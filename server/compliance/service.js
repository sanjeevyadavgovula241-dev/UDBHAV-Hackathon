const { randomUUID } = require("crypto");
const { demoSystems, syntheticActions } = require("./demo-data");
const { readState, mutateState } = require("./store");

const changeTypes = [
  "Control update",
  "Architecture change",
  "Vendor onboarding",
  "Model update",
  "Access change",
];
const riskLevels = ["Low", "Medium", "High", "Critical"];
const oversightRoles = ["automation", "analyst", "security_lead", "compliance_manager"];
const riskWeight = { Low: 1, Medium: 2, High: 3, Critical: 4 };

function createHttpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function byNewest(left, right) {
  return new Date(right.createdAt || right.generatedAt || 0) - new Date(left.createdAt || 0);
}

function findDemoSystem(systemId) {
  const system = demoSystems.find((item) => item.id === systemId);
  if (!system) {
    throw createHttpError(404, "Compliance system not found.");
  }
  return system;
}

function findAction(actionId) {
  const action = syntheticActions.find((item) => item.id === actionId);
  if (!action) {
    throw createHttpError(404, "Synthetic oversight action not found.");
  }
  return action;
}

function requireString(value, label, minimum, maximum) {
  if (typeof value !== "string") {
    throw createHttpError(400, `${label} is required.`);
  }
  const text = value.trim();
  if (text.length < minimum) {
    throw createHttpError(400, `${label} must be at least ${minimum} characters.`);
  }
  if (text.length > maximum) {
    throw createHttpError(400, `${label} must be ${maximum} characters or fewer.`);
  }
  return text;
}

function optionalString(value, label, maximum) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw createHttpError(400, `${label} must be text.`);
  }
  const text = value.trim();
  if (text.length > maximum) {
    throw createHttpError(400, `${label} must be ${maximum} characters or fewer.`);
  }
  return text;
}

function requireEnum(value, label, allowed) {
  if (!allowed.includes(value)) {
    throw createHttpError(400, `${label} must be one of: ${allowed.join(", ")}.`);
  }
  return value;
}

function requireDate(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createHttpError(400, `${label} must use YYYY-MM-DD format.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${label} is not a valid date.`);
  }
  return value;
}

function uniqueStrings(value, label) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw createHttpError(400, `${label} must be an array of strings.`);
  }
  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function activityForDemo(system, state) {
  const persisted = state.activity.filter((event) => event.systemId === system.id);
  return [...system.activity, ...persisted].sort(byNewest);
}

function buildEvidence(system, state) {
  return system.baseline.evidence.map((item) => {
    const invalidations = state.invalidations
      .filter((entry) => entry.systemId === system.id && entry.evidenceId === item.id)
      .sort(byNewest);
    const reviews = state.evidenceReviews
      .filter((entry) => entry.systemId === system.id && entry.evidenceId === item.id)
      .sort(byNewest);
    const pending = invalidations.filter((entry) => entry.status === "pending");
    const status = pending.length
      ? "Invalidated"
      : reviews.length
        ? "Revalidated"
        : item.status || "Valid";

    return {
      ...item,
      status,
      invalidations,
      latestReview: reviews[0] ?? null,
      reviewHistory: reviews,
      source: "demo",
    };
  });
}

function summarizeSystem(system, state) {
  const changes = state.changes.filter((entry) => entry.systemId === system.id);
  const invalidations = state.invalidations.filter(
    (entry) => entry.systemId === system.id && entry.status === "pending",
  );
  const reviewPacks = state.reviewPacks.filter((entry) => entry.systemId === system.id);
  const oversightRuns = state.oversightRuns.filter((entry) => entry.systemId === system.id);
  const latestChange = [...changes].sort(byNewest)[0] ?? null;
  const activity = activityForDemo(system, state)[0] ?? null;

  return {
    id: system.id,
    code: system.code,
    name: system.name,
    owner: system.owner,
    criticality: system.criticality,
    description: system.description,
    source: "demo",
    baselineVersion: system.baseline.version,
    releasedAt: system.baseline.releasedAt,
    counts: {
      obligations: system.baseline.obligations.length,
      controls: system.baseline.controls.length,
      evidence: system.baseline.evidence.length,
      changes: changes.length,
      pendingInvalidations: invalidations.length,
      reviewPacks: reviewPacks.length,
      oversightRuns: oversightRuns.length,
    },
    latestChange: latestChange
      ? {
          id: latestChange.id,
          title: latestChange.title,
          proposedVersion: latestChange.proposedVersion,
          riskLevel: latestChange.riskLevel,
          status: latestChange.status,
          createdAt: latestChange.createdAt,
        }
      : null,
    latestActivity: activity,
  };
}

function listSystems() {
  const state = readState();
  return demoSystems.map((system) => summarizeSystem(system, state));
}

function getSystemBundle(systemId) {
  const system = findDemoSystem(systemId);
  const state = readState();

  return {
    system: {
      ...summarizeSystem(system, state),
      baseline: {
        version: system.baseline.version,
        releasedAt: system.baseline.releasedAt,
        obligations: system.baseline.obligations,
        controls: system.baseline.controls,
        risks: system.baseline.risks,
      },
      evidence: buildEvidence(system, state),
    },
    changes: state.changes
      .filter((entry) => entry.systemId === system.id)
      .sort(byNewest),
    invalidations: state.invalidations
      .filter((entry) => entry.systemId === system.id)
      .sort(byNewest),
    evidenceReviews: state.evidenceReviews
      .filter((entry) => entry.systemId === system.id)
      .sort(byNewest),
    oversight: {
      actions: syntheticActions.map((action) => ({ ...action, source: "demo" })),
      runs: state.oversightRuns
        .filter((entry) => entry.systemId === system.id)
        .sort(byNewest),
    },
    reviewPacks: state.reviewPacks
      .filter((entry) => entry.systemId === system.id)
      .map(({ report, snapshot, ...pack }) => pack)
      .sort(byNewest),
    activity: activityForDemo(system, state),
    dataMode: {
      systems: "demo",
      operationalRecords: "persisted",
      persistence: "server/data/compliance-state.json",
    },
  };
}

function buildSimulation(system, proposedControls, retiredControlIds, newControl) {
  const baselineControls = system.baseline.controls;
  const baselineIds = new Set(baselineControls.map((control) => control.id));
  const proposedIds = new Set(proposedControls.map((control) => control.id));
  const proposedObligationIds = new Set(
    proposedControls.flatMap((control) => control.obligationIds),
  );
  const baselineObligationIds = new Set(
    baselineControls.flatMap((control) => control.obligationIds),
  );

  const removedObligationIds = [...baselineObligationIds].filter(
    (id) => !proposedObligationIds.has(id),
  );
  const addedObligationIds = [...proposedObligationIds].filter(
    (id) => !baselineObligationIds.has(id),
  );
  const impactedObligationIds = new Set([
    ...removedObligationIds,
    ...addedObligationIds,
  ]);

  const changedControlIds = new Set([
    ...retiredControlIds,
    ...(newControl ? [newControl.id] : []),
  ]);

  const relatedControlIds = new Set(changedControlIds);
  for (const control of [...baselineControls, ...proposedControls]) {
    if (control.obligationIds.some((id) => impactedObligationIds.has(id))) {
      relatedControlIds.add(control.id);
    }
  }

  const impactedEvidence = system.baseline.evidence.filter((evidence) =>
    evidence.controlIds.some((id) => relatedControlIds.has(id)),
  );

  const uncoveredObligations = system.baseline.obligations.filter(
    (obligation) => !proposedObligationIds.has(obligation.id),
  );

  const baselineRiskScore = baselineControls.reduce(
    (total, control) => total + (riskWeight[control.risk] ?? 1),
    0,
  );
  const proposedRiskScore = proposedControls.reduce(
    (total, control) => total + (riskWeight[control.risk] ?? 1),
    0,
  );
  const residualRisk = uncoveredObligations.some(
    (obligation) => obligation.risk === "Critical",
  )
    ? "Critical"
    : uncoveredObligations.some((obligation) => obligation.risk === "High")
      ? "High"
      : uncoveredObligations.length
        ? "Medium"
        : proposedRiskScore > baselineRiskScore
          ? "Elevated"
          : "Low";

  const findings = [];
  if (retiredControlIds.length) {
    findings.push({
      severity: "High",
      title: "Retired controls",
      detail: `${retiredControlIds.length} baseline control${retiredControlIds.length === 1 ? "" : "s"} will be removed from the proposed version.`,
    });
  }
  if (newControl) {
    findings.push({
      severity: "Info",
      title: "Proposed control added",
      detail: `${newControl.title} will be added and mapped to ${newControl.obligationIds.length} obligation${newControl.obligationIds.length === 1 ? "" : "s"}.`,
    });
  }
  if (uncoveredObligations.length) {
    findings.push({
      severity: "Critical",
      title: "Uncovered obligations",
      detail: `${uncoveredObligations.length} obligation${uncoveredObligations.length === 1 ? "" : "s"} have no proposed control coverage: ${uncoveredObligations.map((item) => item.id).join(", ")}.`,
    });
  }
  if (impactedEvidence.length) {
    findings.push({
      severity: "High",
      title: "Evidence dependencies invalidated",
      detail: `${impactedEvidence.length} evidence item${impactedEvidence.length === 1 ? "" : "s"} must be revalidated before the change review pack can close.`,
    });
  } else {
    findings.push({
      severity: "Low",
      title: "No evidence dependency detected",
      detail: "No demo evidence item is directly linked to the changed controls.",
    });
  }

  return {
    generatedAt: nowIso(),
    controlsAdded: proposedControls.filter((control) => !baselineIds.has(control.id)),
    controlsRemoved: baselineControls.filter((control) => !proposedIds.has(control.id)),
    obligations: system.baseline.obligations,
    removedObligationIds,
    addedObligationIds,
    uncoveredObligations,
    impactedObligations: system.baseline.obligations.filter((obligation) =>
      impactedObligationIds.has(obligation.id),
    ),
    impactedEvidence: impactedEvidence.map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      controlIds: evidence.controlIds.filter((id) => relatedControlIds.has(id)),
      validForVersion: evidence.validForVersion,
    })),
    risk: {
      baselineScore: baselineRiskScore,
      proposedScore: proposedRiskScore,
      delta: proposedRiskScore - baselineRiskScore,
      residualRisk,
    },
    findings,
  };
}

function createChange(systemId, payload) {
  const system = findDemoSystem(systemId);
  const title = requireString(payload.title, "Change title", 3, 120);
  const summary = requireString(payload.summary, "Change summary", 10, 1200);
  const proposedVersion = requireString(payload.proposedVersion, "Proposed version", 2, 40);
  const changeType = requireEnum(payload.changeType, "Change type", changeTypes);
  const riskLevel = requireEnum(payload.riskLevel, "Risk rating", riskLevels);
  const effectiveDate = requireDate(payload.effectiveDate, "Effective date");
  const author = optionalString(payload.author, "Author", 80) || "Compliance workspace";
  const retireControlIds = uniqueStrings(payload.retireControlIds, "Retired controls");
  const baselineControlIds = new Set(system.baseline.controls.map((control) => control.id));
  const invalidControlIds = retireControlIds.filter((id) => !baselineControlIds.has(id));
  if (invalidControlIds.length) {
    throw createHttpError(400, `Unknown control IDs: ${invalidControlIds.join(", ")}.`);
  }
  if (proposedVersion === system.baseline.version) {
    throw createHttpError(400, "Proposed version must differ from the baseline version.");
  }

  let newControl = null;
  if (payload.newControl && payload.newControl.title) {
    const controlTitle = requireString(
      payload.newControl.title,
      "New control title",
      3,
      120,
    );
    const description = optionalString(
      payload.newControl.description,
      "New control description",
      500,
    );
    const obligationIds = uniqueStrings(
      payload.newControl.obligationIds,
      "New control obligations",
    );
    if (!obligationIds.length) {
      throw createHttpError(400, "Select at least one obligation for the new control.");
    }
    const knownObligations = new Set(
      system.baseline.obligations.map((obligation) => obligation.id),
    );
    const unknownObligations = obligationIds.filter((id) => !knownObligations.has(id));
    if (unknownObligations.length) {
      throw createHttpError(400, `Unknown obligation IDs: ${unknownObligations.join(", ")}.`);
    }
    newControl = {
      id: createId(`CTL-${system.code}-NEW`),
      title: controlTitle,
      description: description || "Proposed control added during change simulation.",
      owner: "Compliance workspace",
      category: "Proposed control",
      status: "Proposed",
      risk: riskLevel,
      obligationIds,
      source: "persisted",
    };
  }

  if (!retireControlIds.length && !newControl) {
    throw createHttpError(
      400,
      "Retire at least one control or add a new control to simulate a change.",
    );
  }

  const state = readState();
  if (
    state.changes.some(
      (entry) =>
        entry.systemId === system.id && entry.proposedVersion === proposedVersion,
    )
  ) {
    throw createHttpError(409, "That proposed version already exists for this system.");
  }

  const retired = new Set(retireControlIds);
  const proposedControls = system.baseline.controls
    .filter((control) => !retired.has(control.id))
    .map((control) => ({ ...control }));
  if (newControl) proposedControls.push(newControl);

  const simulation = buildSimulation(
    system,
    proposedControls,
    retireControlIds,
    newControl,
  );
  const createdAt = nowIso();
  const changeId = createId(`CHG-${system.code}`);
  const invalidations = simulation.impactedEvidence.map((evidence) => ({
    id: createId("INV"),
    systemId: system.id,
    changeId,
    evidenceId: evidence.id,
    evidenceTitle: evidence.title,
    fromVersion: system.baseline.version,
    toVersion: proposedVersion,
    controlIds: evidence.controlIds,
    triggerControlIds: [
      ...new Set([
        ...retireControlIds,
        ...(newControl ? [newControl.id] : []),
      ]),
    ],
    reason:
      "A control or obligation dependency changed in the proposed system version.",
    status: "pending",
    createdAt,
    source: "persisted",
  }));

  const change = {
    id: changeId,
    systemId: system.id,
    title,
    summary,
    changeType,
    riskLevel,
    author,
    effectiveDate,
    baselineVersion: system.baseline.version,
    proposedVersion,
    proposedControls,
    simulatedAt: createdAt,
    createdAt,
    status: "simulated",
    source: "persisted",
    retireControlIds,
    newControl,
    simulation,
    invalidationIds: invalidations.map((entry) => entry.id),
  };

  const activityEvents = [
    {
      id: createId("ACT"),
      systemId: system.id,
      type: "change",
      title: `Change simulated: ${title}`,
      detail: `${proposedVersion} proposes ${proposedControls.length} controls with residual risk ${simulation.risk.residualRisk}.`,
      actor: author,
      createdAt,
      source: "persisted",
    },
  ];
  if (invalidations.length) {
    activityEvents.push({
      id: createId("ACT"),
      systemId: system.id,
      type: "evidence",
      title: `${invalidations.length} evidence item${invalidations.length === 1 ? "" : "s"} invalidated`,
      detail: `Evidence dependencies were invalidated for proposed version ${proposedVersion}.`,
      actor: "Compliance engine",
      createdAt,
      source: "persisted",
    });
  }

  const invalidatedOversightRuns = [];
  mutateState((nextState) => {
    nextState.changes.push(change);
    nextState.invalidations.push(...invalidations);

    for (const run of nextState.oversightRuns) {
      if (
        run.systemId !== system.id ||
        run.status !== "approved" ||
        new Date(run.createdAt) > new Date(createdAt)
      ) {
        continue;
      }
      const invalidationReason = `Approval predates proposed version ${proposedVersion} and must be reviewed again.`;
      run.status = "invalidated";
      run.decision = "invalidated";
      run.invalidatedAt = createdAt;
      run.invalidatedByChangeId = changeId;
      run.invalidationReason = invalidationReason;
      if (run.approval) {
        run.approval.status = "invalidated";
        run.approval.invalidatedAt = createdAt;
        run.approval.invalidatedByChangeId = changeId;
      }
      invalidatedOversightRuns.push({
        id: run.id,
        actionLabel: run.actionLabel,
        reason: invalidationReason,
      });
      activityEvents.push({
        id: createId("ACT"),
        systemId: system.id,
        type: "oversight",
        title: `Oversight approval invalidated: ${run.actionLabel}`,
        detail: `${run.id} was invalidated because proposed version ${proposedVersion} changes this system.`,
        actor: "Compliance engine",
        createdAt,
        source: "persisted",
      });
    }

    nextState.activity.push(...activityEvents);
  });

  return { change, invalidations, invalidatedOversightRuns };
}

function revalidateEvidence(systemId, evidenceId, payload) {
  const system = findDemoSystem(systemId);
  const state = readState();
  const evidence = system.baseline.evidence.find((item) => item.id === evidenceId);
  if (!evidence) {
    throw createHttpError(404, "Evidence item not found.");
  }

  const reviewer = requireString(payload.reviewer, "Reviewer", 2, 80);
  const rationale = requireString(payload.rationale, "Review rationale", 8, 800);
  const knownVersions = new Set([
    system.baseline.version,
    ...state.changes
      .filter((entry) => entry.systemId === system.id)
      .map((entry) => entry.proposedVersion),
  ]);
  const version = requireString(payload.version, "Evidence version", 2, 40);
  if (!knownVersions.has(version)) {
    throw createHttpError(400, "Evidence version must match the baseline or a proposed version.");
  }

  const matchingInvalidations = state.invalidations.filter(
    (entry) =>
      entry.systemId === system.id &&
      entry.evidenceId === evidenceId &&
      entry.toVersion === version &&
      entry.status === "pending",
  );
  if (!matchingInvalidations.length) {
    throw createHttpError(
      409,
      "This evidence has no pending invalidation for the selected version.",
    );
  }

  const createdAt = nowIso();
  const review = {
    id: createId("REV"),
    systemId: system.id,
    evidenceId,
    evidenceTitle: evidence.title,
    version,
    reviewer,
    rationale,
    createdAt,
    source: "persisted",
    invalidationIds: matchingInvalidations.map((entry) => entry.id),
  };

  const activity = {
    id: createId("ACT"),
    systemId: system.id,
    type: "evidence",
    title: `Evidence revalidated: ${evidence.title}`,
    detail: `${evidenceId} is valid for ${version} after review by ${reviewer}.`,
    actor: reviewer,
    createdAt,
    source: "persisted",
  };

  const invalidationIds = new Set(review.invalidationIds);
  mutateState((nextState) => {
    for (const invalidation of nextState.invalidations) {
      if (!invalidationIds.has(invalidation.id)) continue;
      invalidation.status = "revalidated";
      invalidation.revalidatedAt = createdAt;
      invalidation.revalidatedBy = reviewer;
      invalidation.reviewId = review.id;
    }
    nextState.evidenceReviews.push(review);
    nextState.activity.push(activity);
  });

  return { review, evidence: buildEvidence(system, readState()).find((item) => item.id === evidenceId) };
}

function evaluateOversight(systemId, payload) {
  const system = findDemoSystem(systemId);
  const action = findAction(payload.actionId);
  const actorType = requireEnum(payload.actorType, "Actor type", ["ai", "human"]);
  const actorName =
    optionalString(payload.actorName, "Actor name", 80) ||
    (actorType === "ai" ? "Synthetic AI agent" : "Compliance reviewer");
  const role =
    actorType === "human"
      ? requireEnum(payload.role, "Actor role", oversightRoles.filter((item) => item !== "automation"))
      : "automation";
  const rationale = requireString(payload.rationale, "Rationale", 8, 1000);
  const acknowledgeRisk = payload.acknowledgeRisk === true;
  const roleAllowed = action.allowedRoles.includes(role);
  const rationaleAllowed = rationale.length >= action.minimumRationaleLength;
  const riskAcknowledged =
    !action.requiresRiskAcknowledgement || acknowledgeRisk === true;

  const checks = [
    {
      id: "human-reviewer",
      label: "Human reviewer present",
      passed: actorType === "human",
      detail:
        actorType === "human"
          ? "A human reviewer is initiating the action."
          : "AI and automation actors cannot self-approve synthetic actions.",
    },
    {
      id: "authorized-role",
      label: "Role authorized for action risk",
      passed: roleAllowed,
      detail: roleAllowed
        ? `${role} is authorized for ${action.riskLevel.toLowerCase()}-risk actions.`
        : `${role} must escalate this action to an authorized reviewer.`,
    },
    {
      id: "rationale",
      label: "Rationale meets review threshold",
      passed: rationaleAllowed,
      detail: `Minimum ${action.minimumRationaleLength} characters required.`,
    },
    {
      id: "risk-acknowledgement",
      label: "Residual risk acknowledged",
      passed: riskAcknowledged,
      detail: action.requiresRiskAcknowledgement
        ? "Critical actions require explicit residual-risk acknowledgement."
        : "This action does not require a separate risk acknowledgement.",
    },
  ];

  let decision = "approved";
  let status = "approved";
  let reason = "All server-side oversight checks passed.";
  if (actorType !== "human") {
    decision = "blocked";
    status = "blocked";
    reason = "AI and automation actors cannot self-approve high-impact actions.";
  } else if (!roleAllowed) {
    decision = "escalated";
    status = "pending";
    reason = `${role} is not authorized for this action. A compliance manager must approve it.`;
  } else if (!rationaleAllowed) {
    decision = "blocked";
    status = "blocked";
    reason = "The rationale is too short for the selected action risk.";
  } else if (!riskAcknowledged) {
    decision = "blocked";
    status = "blocked";
    reason = "The residual risk must be acknowledged before approval.";
  }

  const createdAt = nowIso();
  const run = {
    id: createId("RUN"),
    systemId: system.id,
    actionId: action.id,
    actionLabel: action.label,
    actionRisk: action.riskLevel,
    category: action.category,
    actorType,
    actorName,
    role,
    rationale,
    acknowledgeRisk,
    checks,
    decision,
    status,
    reason,
    createdAt,
    source: "persisted",
    approval: null,
  };

  const activity = {
    id: createId("ACT"),
    systemId: system.id,
    type: "oversight",
    title: `Human oversight ${decision}: ${action.label}`,
    detail: reason,
    actor: actorName,
    createdAt,
    source: "persisted",
  };

  mutateState((nextState) => {
    nextState.oversightRuns.push(run);
    nextState.activity.push(activity);
  });

  return run;
}

function approveOversightRun(systemId, runId, payload) {
  const system = findDemoSystem(systemId);
  const state = readState();
  const run = state.oversightRuns.find(
    (entry) => entry.systemId === system.id && entry.id === runId,
  );
  if (!run) {
    throw createHttpError(404, "Oversight run not found.");
  }
  if (run.status !== "pending") {
    throw createHttpError(409, "Only escalated oversight runs can be approved.");
  }

  const approverName = requireString(payload.approverName, "Approver name", 2, 80);
  const role = requireEnum(payload.role, "Approver role", ["compliance_manager"]);
  const rationale = requireString(payload.rationale, "Approval rationale", 12, 800);
  if (payload.acknowledgeRisk !== true) {
    throw createHttpError(400, "The approver must acknowledge the residual risk.");
  }

  const approvedAt = nowIso();
  const activity = {
    id: createId("ACT"),
    systemId: system.id,
    type: "oversight",
    title: `Escalated action approved: ${run.actionLabel}`,
    detail: `${approverName} approved run ${run.id} after escalation.`,
    actor: approverName,
    createdAt: approvedAt,
    source: "persisted",
  };

  return mutateState((nextState) => {
    const currentRun = nextState.oversightRuns.find((entry) => entry.id === run.id);
    currentRun.status = "approved";
    currentRun.decision = "approved";
    currentRun.reason = `Escalated action approved by ${approverName} (${role}).`;
    currentRun.approval = {
      approverName,
      role,
      rationale,
      acknowledgedRisk: true,
      approvedAt,
    };
    nextState.activity.push(activity);
    return currentRun;
  });
}

function generateReviewPack(systemId, payload) {
  const system = findDemoSystem(systemId);
  const state = readState();
  const changeId = requireString(payload.changeId, "Change", 2, 80);
  const change = state.changes.find(
    (entry) => entry.systemId === system.id && entry.id === changeId,
  );
  if (!change) {
    throw createHttpError(404, "Compliance change not found.");
  }
  const preparedBy =
    optionalString(payload.preparedBy, "Prepared by", 80) || "Compliance workspace";
  const notes = optionalString(payload.notes, "Review pack notes", 2000);
  const evidence = buildEvidence(system, state);
  const pendingInvalidations = state.invalidations.filter(
    (entry) =>
      entry.systemId === system.id &&
      entry.changeId === change.id &&
      entry.status === "pending",
  );
  const changeInvalidations = state.invalidations.filter(
    (entry) => entry.systemId === system.id && entry.changeId === change.id,
  );
  const oversightRuns = state.oversightRuns
    .filter((entry) => entry.systemId === system.id)
    .sort(byNewest)
    .slice(0, 12);
  const activity = activityForDemo(system, state).slice(0, 20);
  const generatedAt = nowIso();
  const packId = createId(`PACK-${system.code}`);

  const summary = {
    pendingInvalidations: pendingInvalidations.length,
    totalInvalidations: changeInvalidations.length,
    residualRisk: change.simulation.risk.residualRisk,
    controlChanges:
      change.simulation.controlsAdded.length +
      change.simulation.controlsRemoved.length,
    oversightRuns: oversightRuns.length,
    approvedOversightRuns: oversightRuns.filter((run) => run.status === "approved")
      .length,
  };

  const report = buildReport({
    system,
    change,
    evidence,
    pendingInvalidations,
    changeInvalidations,
    oversightRuns,
    activity,
    summary,
    preparedBy,
    notes,
    generatedAt,
    packId,
  });

  const pack = {
    id: packId,
    systemId: system.id,
    systemName: system.name,
    systemCode: system.code,
    changeId: change.id,
    changeTitle: change.title,
    baselineVersion: change.baselineVersion,
    proposedVersion: change.proposedVersion,
    preparedBy,
    notes,
    generatedAt,
    createdAt: generatedAt,
    source: "persisted",
    summary,
    report,
    snapshot: {
      change,
      evidence: evidence.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        validForVersion: item.validForVersion,
        controlIds: item.controlIds,
      })),
      invalidations: changeInvalidations,
      oversightRuns: oversightRuns.map((run) => ({
        id: run.id,
        actionLabel: run.actionLabel,
        actionRisk: run.actionRisk,
        decision: run.decision,
        status: run.status,
        createdAt: run.createdAt,
      })),
      activity,
    },
  };

  const activityEvent = {
    id: createId("ACT"),
    systemId: system.id,
    type: "review-pack",
    title: `Review pack generated: ${change.title}`,
    detail: `${packId} contains ${summary.totalInvalidations} evidence invalidations and ${summary.approvedOversightRuns} approved oversight decisions.`,
    actor: preparedBy,
    createdAt: generatedAt,
    source: "persisted",
  };

  mutateState((nextState) => {
    nextState.reviewPacks.push(pack);
    nextState.activity.push(activityEvent);
  });

  return pack;
}

function buildReport({
  system,
  change,
  evidence,
  pendingInvalidations,
  changeInvalidations,
  oversightRuns,
  activity,
  summary,
  preparedBy,
  notes,
  generatedAt,
  packId,
}) {
  const added = change.simulation.controlsAdded;
  const removed = change.simulation.controlsRemoved;
  const uncovered = change.simulation.uncoveredObligations;
  const impacted = change.simulation.impactedObligations;
  const lines = [
    `# Change Review Pack - ${system.name}`,
    "",
    `**Pack:** ${packId}`,
    `**Generated:** ${generatedAt}`,
    `**Prepared by:** ${preparedBy}`,
    `**Baseline:** ${change.baselineVersion}`,
    `**Proposed:** ${change.proposedVersion}`,
    `**Change:** ${change.title}`,
    `**Residual risk:** ${summary.residualRisk}`,
    "",
    "## 1. System context",
    "",
    `- System: ${system.name} (${system.code})`,
    `- Owner: ${system.owner}`,
    `- Criticality: ${system.criticality}`,
    `- Baseline released: ${system.baseline.releasedAt}`,
    "",
    "## 2. Proposed change",
    "",
    `- Type: ${change.changeType}`,
    `- Risk rating: ${change.riskLevel}`,
    `- Effective date: ${change.effectiveDate}`,
    `- Author: ${change.author}`,
    "",
    change.summary,
    "",
    "## 3. Baseline vs proposed controls",
    "",
    `Baseline controls: ${system.baseline.controls.length}`,
    `Proposed controls: ${change.proposedControls.length}`,
    "",
    "### Added controls",
    "",
    ...(added.length
      ? added.map(
          (control) =>
            `- ${control.id} - ${control.title} (${control.risk})`,
        )
      : ["- None"]),
    "",
    "### Removed controls",
    "",
    ...(removed.length
      ? removed.map(
          (control) =>
            `- ${control.id} - ${control.title} (${control.risk})`,
        )
      : ["- None"]),
    "",
    "## 4. Obligation impact",
    "",
    ...(impacted.length
      ? impacted.map(
          (obligation) =>
            `- ${obligation.id} - ${obligation.title} (${obligation.framework}, ${obligation.risk})`,
        )
      : ["- No obligation coverage changes detected."]),
    "",
    "### Uncovered obligations",
    "",
    ...(uncovered.length
      ? uncovered.map(
          (obligation) =>
            `- ${obligation.id} - ${obligation.title} (${obligation.risk})`,
        )
      : ["- None. Proposed controls preserve coverage."]),
    "",
    "## 5. Evidence invalidation",
    "",
    `Invalidations created: ${summary.totalInvalidations}`,
    `Pending revalidation: ${summary.pendingInvalidations}`,
    "",
    ...(changeInvalidations.length
      ? changeInvalidations.map(
          (entry) =>
            `- ${entry.evidenceId} - ${entry.evidenceTitle}: ${entry.fromVersion} -> ${entry.toVersion} [${entry.status}]`,
        )
      : ["- No evidence dependencies were invalidated."]),
    "",
    "## 6. Human oversight decisions",
    "",
    ...(oversightRuns.length
      ? oversightRuns.map(
          (run) =>
            `- ${run.id} - ${run.actionLabel}: ${run.decision} (${run.actionRisk}, ${run.createdAt})`,
        )
      : ["- No oversight sandbox runs recorded for this system."]),
    "",
    "## 7. Activity snapshot",
    "",
    ...(activity.length
      ? activity.map(
          (event) =>
            `- ${event.createdAt} - ${event.title}: ${event.detail} [${event.source}]`,
        )
      : ["- No activity recorded."]),
    "",
    "## 8. Evidence status snapshot",
    "",
    ...evidence.map(
      (item) =>
        `- ${item.id} - ${item.title}: ${item.status} (valid for ${item.validForVersion})`,
    ),
    "",
    "## 9. Sign-off checklist",
    "",
    "- [ ] Proposed control changes reviewed by the system owner",
    "- [ ] Uncovered obligations accepted or remediated",
    "- [ ] Invalidated evidence revalidated",
    "- [ ] Escalated oversight runs approved by a compliance manager",
    "- [ ] Change review pack retained with the audit record",
    "",
    notes ? `## Notes\n\n${notes}\n` : "",
    "---",
    "",
    "Demo system definitions are seeded fixtures. Changes, evidence reviews, oversight runs, packs, and activity in this report are persisted server-side in `server/data/compliance-state.json`.",
    "",
  ];

  return lines.filter((line) => line !== undefined).join("\n");
}

function getReviewPack(packId) {
  const state = readState();
  const pack = state.reviewPacks.find((entry) => entry.id === packId);
  if (!pack) {
    throw createHttpError(404, "Change review pack not found.");
  }
  return pack;
}

module.exports = {
  listSystems,
  getSystemBundle,
  createChange,
  revalidateEvidence,
  evaluateOversight,
  approveOversightRun,
  generateReviewPack,
  getReviewPack,
};
