const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const serverRoot = path.join(__dirname, "..");
const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "compliance-verification-"));
const stateFile = path.join(tempDirectory, "compliance-state.json");

let server;
let baseUrl;
let systemId = "atlas-cdp";
let changeA;
let changeB;
let escalatedRun;
let approvedRun;
let invalidatedRun;
let reviewPack;

function freePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", () => {
      const { port } = listener.address();
      listener.close(() => resolve(port));
    });
  });
}

async function startServer() {
  const port = await freePort();
  server = spawn(process.execPath, ["index.js"], {
    cwd: serverRoot,
    env: {
      ...process.env,
      PORT: String(port),
      COMPLIANCE_STATE_FILE: stateFile,
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });
  baseUrl = `http://127.0.0.1:${port}`;

  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited before becoming ready.\n${output}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/compliance/systems`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(`Server did not become ready.\n${output}`);
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill();
  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
}

async function request(route, options = {}) {
  const { body, headers, ...rest } = options;
  const response = await fetch(`${baseUrl}${route}`, {
    ...rest,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return {
    status: response.status,
    headers: response.headers,
    text,
    json,
  };
}

async function getBundle(id = systemId) {
  const response = await request(`/api/compliance/systems/${id}`);
  assert.equal(response.status, 200, response.text);
  return response.json;
}

test.before(async () => {
  await startServer();
});

test.after(async () => {
  await stopServer();
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test("1. change simulator preserves baseline and calculates impact", async () => {
  const before = await getBundle();
  assert.equal(before.system.baselineVersion, "v2.4.0");
  const baselineSnapshot = {
    version: before.system.baseline.version,
    releasedAt: before.system.baseline.releasedAt,
    obligations: before.system.baseline.obligations,
    controls: before.system.baseline.controls,
    risks: before.system.baseline.risks,
    evidence: before.system.evidence.map((item) => ({
      id: item.id,
      validForVersion: item.validForVersion,
      controlIds: item.controlIds,
      status: item.status,
    })),
  };

  const created = await request(`/api/compliance/systems/${systemId}/changes`, {
    method: "POST",
    body: {
      title: "Verification retire access recertification",
      summary:
        "Retire the quarterly access recertification and replace it with continuous access review.",
      proposedVersion: "v2.5.0",
      effectiveDate: "2026-12-01",
      changeType: "Control update",
      riskLevel: "High",
      author: "Verification suite",
      retireControlIds: ["CTL-RBAC-01"],
      newControl: {
        title: "Continuous access verification control",
        description: "Daily automated review of privileged access assignments.",
        obligationIds: ["OBL-SEC-01"],
      },
    },
  });
  assert.equal(created.status, 201, created.text);
  changeA = created.json.change;
  assert.equal(changeA.baselineVersion, "v2.4.0");
  assert.equal(changeA.proposedVersion, "v2.5.0");
  assert.deepEqual(
    changeA.simulation.controlsRemoved.map((control) => control.id),
    ["CTL-RBAC-01"],
  );
  assert.equal(changeA.simulation.controlsAdded.length, 1);
  assert.equal(changeA.simulation.controlsAdded[0].obligationIds[0], "OBL-SEC-01");
  assert.equal(changeA.simulation.impactedObligations.length, 0);
  assert.equal(changeA.simulation.uncoveredObligations.length, 0);
  assert.equal(changeA.simulation.risk.baselineScore, 14);
  assert.equal(changeA.simulation.risk.proposedScore, 14);
  assert.equal(changeA.simulation.risk.delta, 0);
  assert.equal(changeA.simulation.risk.residualRisk, "Low");
  assert.ok(
    changeA.simulation.impactedEvidence.some((item) => item.id === "EVD-ATL-03"),
  );
  assert.ok(created.json.invalidations.length >= 1);

  const after = await getBundle();
  assert.deepEqual(
    {
      version: after.system.baseline.version,
      releasedAt: after.system.baseline.releasedAt,
      obligations: after.system.baseline.obligations,
      controls: after.system.baseline.controls,
      risks: after.system.baseline.risks,
    },
    {
      version: baselineSnapshot.version,
      releasedAt: baselineSnapshot.releasedAt,
      obligations: baselineSnapshot.obligations,
      controls: baselineSnapshot.controls,
      risks: baselineSnapshot.risks,
    },
  );
  for (const evidence of baselineSnapshot.evidence) {
    const current = after.system.evidence.find((item) => item.id === evidence.id);
    assert.deepEqual(
      {
        id: current.id,
        validForVersion: current.validForVersion,
        controlIds: current.controlIds,
      },
      {
        id: evidence.id,
        validForVersion: evidence.validForVersion,
        controlIds: evidence.controlIds,
      },
    );
  }
  assert.equal(after.changes.length, 1);
  assert.equal(after.changes[0].id, changeA.id);

  const duplicate = await request(`/api/compliance/systems/${systemId}/changes`, {
    method: "POST",
    body: {
      title: "Duplicate proposed version",
      summary: "This request must be rejected because the proposed version already exists.",
      proposedVersion: "v2.5.0",
      effectiveDate: "2026-12-02",
      changeType: "Control update",
      riskLevel: "High",
      retireControlIds: ["CTL-BACKUP-01"],
    },
  });
  assert.equal(duplicate.status, 409, duplicate.text);

  const emptyChange = await request(`/api/compliance/systems/${systemId}/changes`, {
    method: "POST",
    body: {
      title: "No control mutation",
      summary: "This request must be rejected because it does not change a control.",
      proposedVersion: "v2.5.1",
      effectiveDate: "2026-12-02",
      changeType: "Control update",
      riskLevel: "High",
    },
  });
  assert.equal(emptyChange.status, 400, emptyChange.text);
});

test("2. evidence tracking invalidates dependencies and explains stale status", async () => {
  const evidenceResponse = await request(`/api/compliance/systems/${systemId}/evidence`);
  assert.equal(evidenceResponse.status, 200, evidenceResponse.text);
  const evidenceId = "EVD-ATL-03";
  const invalidated = evidenceResponse.json.evidence.find((item) => item.id === evidenceId);
  assert.equal(invalidated.status, "Invalidated");
  assert.ok(invalidated.invalidations.length >= 1);
  const pendingInvalidation = invalidated.invalidations.find(
    (entry) => entry.status === "pending",
  );
  assert.ok(pendingInvalidation);
  assert.equal(pendingInvalidation.changeId, changeA.id);
  assert.equal(pendingInvalidation.fromVersion, "v2.4.0");
  assert.equal(pendingInvalidation.toVersion, "v2.5.0");
  assert.ok(pendingInvalidation.reason.includes("dependency changed"));
  assert.ok(pendingInvalidation.triggerControlIds.includes("CTL-RBAC-01"));
  assert.equal(
    evidenceResponse.json.evidence.find((item) => item.id === "EVD-ATL-01").status,
    "Valid",
  );

  const wrongVersion = await request(
    `/api/compliance/systems/${systemId}/evidence/${evidenceId}/revalidate`,
    {
      method: "POST",
      body: {
        version: "v9.9.9",
        reviewer: "Verification reviewer",
        rationale: "This version is not part of the system change history.",
      },
    },
  );
  assert.equal(wrongVersion.status, 400, wrongVersion.text);

  const revalidated = await request(
    `/api/compliance/systems/${systemId}/evidence/${evidenceId}/revalidate`,
    {
      method: "POST",
      body: {
        version: "v2.5.0",
        reviewer: "Verification reviewer",
        rationale: "Confirmed the replacement control preserves the evidence dependency.",
      },
    },
  );
  assert.equal(revalidated.status, 201, revalidated.text);
  assert.equal(revalidated.json.evidence.status, "Revalidated");
  assert.equal(revalidated.json.review.version, "v2.5.0");
  assert.equal(revalidated.json.review.invalidationIds.length, 1);

  const refreshed = await request(`/api/compliance/systems/${systemId}/evidence`);
  const refreshedEvidence = refreshed.json.evidence.find((item) => item.id === evidenceId);
  assert.equal(refreshedEvidence.status, "Revalidated");
  assert.equal(refreshedEvidence.invalidations[0].status, "revalidated");
  assert.equal(refreshedEvidence.invalidations[0].revalidatedBy, "Verification reviewer");
  assert.ok(refreshedEvidence.reviewHistory.length >= 1);

  const repeat = await request(
    `/api/compliance/systems/${systemId}/evidence/${evidenceId}/revalidate`,
    {
      method: "POST",
      body: {
        version: "v2.5.0",
        reviewer: "Verification reviewer",
        rationale: "A second review must not be accepted without a pending invalidation.",
      },
    },
  );
  assert.equal(repeat.status, 409, repeat.text);
});

test("3. human oversight enforces policy and invalidates approvals after a change", async () => {
  const aiRun = await request(`/api/compliance/systems/${systemId}/oversight/evaluate`, {
    method: "POST",
    body: {
      actionId: "grant-break-glass-access",
      actorType: "ai",
      actorName: "Verification AI agent",
      rationale: "Synthetic AI request that must never self-approve production access.",
      acknowledgeRisk: true,
    },
  });
  assert.equal(aiRun.status, 201, aiRun.text);
  assert.equal(aiRun.json.decision, "blocked");
  assert.equal(aiRun.json.status, "blocked");
  assert.equal(aiRun.json.approval, null);
  assert.equal(
    aiRun.json.checks.find((check) => check.id === "human-reviewer").passed,
    false,
  );

  const escalation = await request(
    `/api/compliance/systems/${systemId}/oversight/evaluate`,
    {
      method: "POST",
      body: {
        actionId: "grant-break-glass-access",
        actorType: "human",
        actorName: "Verification analyst",
        role: "analyst",
        rationale: "Emergency access is required for an approved incident response action.",
        acknowledgeRisk: true,
      },
    },
  );
  assert.equal(escalation.status, 201, escalation.text);
  escalatedRun = escalation.json;
  assert.equal(escalatedRun.decision, "escalated");
  assert.equal(escalatedRun.status, "pending");

  const unauthorizedApproval = await request(
    `/api/compliance/systems/${systemId}/oversight/runs/${escalatedRun.id}/approve`,
    {
      method: "POST",
      body: {
        approverName: "Verification analyst",
        role: "analyst",
        rationale: "An analyst must not be allowed to approve this escalation.",
        acknowledgeRisk: true,
      },
    },
  );
  assert.equal(unauthorizedApproval.status, 400, unauthorizedApproval.text);

  const missingAcknowledgement = await request(
    `/api/compliance/systems/${systemId}/oversight/runs/${escalatedRun.id}/approve`,
    {
      method: "POST",
      body: {
        approverName: "Verification manager",
        role: "compliance_manager",
        rationale: "Approval without the required residual-risk acknowledgement.",
        acknowledgeRisk: false,
      },
    },
  );
  assert.equal(missingAcknowledgement.status, 400, missingAcknowledgement.text);

  const approval = await request(
    `/api/compliance/systems/${systemId}/oversight/runs/${escalatedRun.id}/approve`,
    {
      method: "POST",
      body: {
        approverName: "Verification manager",
        role: "compliance_manager",
        rationale: "Approved after reviewing the incident and compensating controls.",
        acknowledgeRisk: true,
      },
    },
  );
  assert.equal(approval.status, 200, approval.text);
  approvedRun = approval.json;
  assert.equal(approvedRun.status, "approved");
  assert.equal(approvedRun.decision, "approved");
  assert.equal(approvedRun.approval.approverName, "Verification manager");
  assert.equal(approvedRun.approval.acknowledgedRisk, true);

  const repeatApproval = await request(
    `/api/compliance/systems/${systemId}/oversight/runs/${escalatedRun.id}/approve`,
    {
      method: "POST",
      body: {
        approverName: "Verification manager",
        role: "compliance_manager",
        rationale: "A completed approval must not be approved a second time.",
        acknowledgeRisk: true,
      },
    },
  );
  assert.equal(repeatApproval.status, 409, repeatApproval.text);

  const otherRun = await request("/api/compliance/systems/ledger-core/oversight/evaluate", {
    method: "POST",
    body: {
      actionId: "close-remediation",
      actorType: "human",
      actorName: "Verification ledger analyst",
      role: "analyst",
      rationale: "Synthetic approval that must survive an unrelated system change.",
      acknowledgeRisk: true,
    },
  });
  assert.equal(otherRun.status, 201, otherRun.text);
  assert.equal(otherRun.json.status, "approved");

  const created = await request(`/api/compliance/systems/${systemId}/changes`, {
    method: "POST",
    body: {
      title: "Verification retire backup evidence control",
      summary:
        "Retire the restore test control and add a replacement recovery verification control.",
      proposedVersion: "v2.6.0",
      effectiveDate: "2026-12-15",
      changeType: "Control update",
      riskLevel: "Medium",
      author: "Verification suite",
      retireControlIds: ["CTL-BACKUP-01"],
      newControl: {
        title: "Recovery verification control",
        description: "Quarterly recovery exercise with independent verification.",
        obligationIds: ["OBL-RES-01"],
      },
    },
  });
  assert.equal(created.status, 201, created.text);
  changeB = created.json.change;
  assert.ok(
    created.json.invalidatedOversightRuns.some((run) => run.id === escalatedRun.id),
  );

  const bundle = await getBundle();
  invalidatedRun = bundle.oversight.runs.find((run) => run.id === escalatedRun.id);
  assert.equal(invalidatedRun.status, "invalidated");
  assert.equal(invalidatedRun.decision, "invalidated");
  assert.equal(invalidatedRun.invalidatedByChangeId, changeB.id);
  assert.ok(invalidatedRun.invalidationReason.includes("v2.6.0"));
  assert.equal(invalidatedRun.approval.status, "invalidated");
  assert.ok(
    bundle.activity.some(
      (event) =>
        event.source === "persisted" &&
        event.title.includes("Oversight approval invalidated") &&
        event.systemId === systemId,
    ),
  );

  const otherBundleAfterChange = await getBundle("ledger-core");
  const otherRunAfterChange = otherBundleAfterChange.oversight.runs.find(
    (run) => run.id === otherRun.json.id,
  );
  assert.equal(otherRunAfterChange.status, "approved");
  assert.equal(otherRunAfterChange.decision, "approved");

  const afterInvalidationApproval = await request(
    `/api/compliance/systems/${systemId}/oversight/runs/${escalatedRun.id}/approve`,
    {
      method: "POST",
      body: {
        approverName: "Verification manager",
        role: "compliance_manager",
        rationale: "An invalidated approval must not be reactivated by re-approval.",
        acknowledgeRisk: true,
      },
    },
  );
  assert.equal(afterInvalidationApproval.status, 409, afterInvalidationApproval.text);
});

test("4. activity history records, associates, and persists events", async () => {
  const activityResponse = await request(`/api/compliance/systems/${systemId}/activity`);
  assert.equal(activityResponse.status, 200, activityResponse.text);
  const persisted = activityResponse.json.activity.filter(
    (event) => event.source === "persisted",
  );
  assert.ok(persisted.length >= 8);
  assert.ok(persisted.every((event) => event.systemId === systemId));
  assert.ok(persisted.some((event) => event.type === "change"));
  assert.ok(persisted.some((event) => event.type === "evidence"));
  assert.ok(persisted.some((event) => event.type === "oversight"));
  assert.ok(persisted.some((event) => event.title.includes(changeA.title)));
  assert.ok(persisted.some((event) => event.title.includes(changeB.title)));

  const otherBundle = await getBundle("ledger-core");
  assert.equal(
    otherBundle.activity.some((event) =>
      persisted.some((atlasEvent) => atlasEvent.id === event.id),
    ),
    false,
  );

  const storedState = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  const storedEvents = storedState.activity.filter((event) => event.systemId === systemId);
  assert.equal(storedEvents.length, persisted.length);
  assert.deepEqual(
    new Set(storedEvents.map((event) => event.id)),
    new Set(persisted.map((event) => event.id)),
  );
});

test("5. change review pack generates, downloads, and contains accurate data", async () => {
  const generated = await request(
    `/api/compliance/systems/${systemId}/review-packs`,
    {
      method: "POST",
      body: {
        changeId: changeA.id,
        preparedBy: "Verification reviewer",
        notes: "Verification pack for the access recertification replacement.",
      },
    },
  );
  assert.equal(generated.status, 201, generated.text);
  reviewPack = generated.json;
  assert.match(reviewPack.id, /^PACK-ATL-/);
  assert.equal(reviewPack.systemId, systemId);
  assert.equal(reviewPack.changeId, changeA.id);

  const report = reviewPack.report;
  assert.ok(report.includes(`# Change Review Pack - Atlas Customer Data Platform`));
  assert.ok(report.includes(`**Baseline:** v2.4.0`));
  assert.ok(report.includes(`**Proposed:** v2.5.0`));
  assert.ok(report.includes(`**Change:** ${changeA.title}`));
  assert.ok(report.includes("CTL-RBAC-01"));
  assert.ok(report.includes("Continuous access verification control"));
  assert.ok(report.includes("EVD-ATL-03"));
  assert.ok(report.includes("[revalidated]"));
  assert.ok(report.includes(escalatedRun.id));
  assert.ok(report.includes("invalidated"));
  assert.ok(report.includes("Verification reviewer"));
  assert.ok(report.includes("Verification pack for the access recertification replacement."));

  const storedPack = await request(`/api/compliance/review-packs/${reviewPack.id}`);
  assert.equal(storedPack.status, 200, storedPack.text);
  assert.equal(storedPack.json.report, report);

  const download = await request(
    `/api/compliance/review-packs/${reviewPack.id}/report`,
  );
  assert.equal(download.status, 200, download.text);
  assert.match(download.headers.get("content-type"), /text\/markdown/);
  assert.match(
    download.headers.get("content-disposition"),
    new RegExp(`${reviewPack.id}-change-review\\.md`),
  );
  assert.equal(download.text, report);

  const missingChange = await request(
    `/api/compliance/systems/${systemId}/review-packs`,
    {
      method: "POST",
      body: { changeId: "CHG-ATL-NOTFOUND", preparedBy: "Verification reviewer" },
    },
  );
  assert.equal(missingChange.status, 404, missingChange.text);

  const missingPack = await request(`/api/compliance/review-packs/PACK-ATL-NOTFOUND`);
  assert.equal(missingPack.status, 404, missingPack.text);

  const packBeforeExtraActivity = storedPack.json.report;
  await request(`/api/compliance/systems/${systemId}/oversight/evaluate`, {
    method: "POST",
    body: {
      actionId: "close-remediation",
      actorType: "human",
      actorName: "Verification analyst",
      role: "analyst",
      rationale: "Verification activity added after the review pack snapshot.",
    },
  });
  const packAfterExtraActivity = await request(
    `/api/compliance/review-packs/${reviewPack.id}`,
  );
  assert.equal(packAfterExtraActivity.json.report, packBeforeExtraActivity);
});

test("persists workflow records and report across a server restart", async () => {
  const beforeRestart = await getBundle();
  const beforeActivity = beforeRestart.activity
    .filter((event) => event.source === "persisted")
    .map((event) => event.id);
  const beforePackReport = (await request(
    `/api/compliance/review-packs/${reviewPack.id}`,
  )).json.report;

  await stopServer();
  await startServer();

  const afterRestart = await getBundle();
  assert.ok(afterRestart.changes.some((change) => change.id === changeA.id));
  assert.ok(afterRestart.changes.some((change) => change.id === changeB.id));
  const persistedActivity = afterRestart.activity
    .filter((event) => event.source === "persisted")
    .map((event) => event.id);
  for (const id of beforeActivity) {
    assert.ok(persistedActivity.includes(id));
  }
  const persistedRun = afterRestart.oversight.runs.find(
    (run) => run.id === escalatedRun.id,
  );
  assert.equal(persistedRun.status, "invalidated");
  const persistedEvidence = afterRestart.system.evidence.find(
    (item) => item.id === "EVD-ATL-03",
  );
  assert.equal(persistedEvidence.status, "Revalidated");
  const persistedPack = await request(
    `/api/compliance/review-packs/${reviewPack.id}`,
  );
  assert.equal(persistedPack.status, 200, persistedPack.text);
  assert.equal(persistedPack.json.report, beforePackReport);
});
