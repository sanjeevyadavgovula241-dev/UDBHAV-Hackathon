export const oversightRoleLabels = {
  automation: "AI automation",
  analyst: "Analyst",
  security_lead: "Security lead",
  compliance_manager: "Compliance manager",
};

export const activityLabels = {
  change: "Change",
  evidence: "Evidence",
  oversight: "Oversight",
  "review-pack": "Review pack",
  control: "Control",
};

export function latestPendingInvalidations(invalidations = []) {
  return invalidations.filter((entry) => entry.status === "pending");
}

export function proposedVersionFor(changes = []) {
  return changes.find((change) => change.proposedVersion)?.proposedVersion ?? null;
}

export function changeStatusLabel(status) {
  if (status === "simulated") return "Simulated";
  if (status === "review_ready") return "Review ready";
  return status || "Unknown";
}
