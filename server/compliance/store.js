const fs = require("fs");
const path = require("path");

const configuredStateFile = process.env.COMPLIANCE_STATE_FILE;
const stateFile = configuredStateFile
  ? path.resolve(configuredStateFile)
  : path.join(__dirname, "..", "data", "compliance-state.json");
const dataDirectory = path.dirname(stateFile);
const temporaryFile = `${stateFile}.tmp`;

const emptyState = {
  schemaVersion: 1,
  changes: [],
  evidenceReviews: [],
  invalidations: [],
  oversightRuns: [],
  reviewPacks: [],
  activity: [],
};

function ensureStateFile() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, JSON.stringify(emptyState, null, 2), "utf8");
  }
}

function readState() {
  ensureStateFile();
  const raw = fs.readFileSync(stateFile, "utf8");
  const parsed = JSON.parse(raw);
  return {
    ...emptyState,
    ...parsed,
    changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    evidenceReviews: Array.isArray(parsed.evidenceReviews) ? parsed.evidenceReviews : [],
    invalidations: Array.isArray(parsed.invalidations) ? parsed.invalidations : [],
    oversightRuns: Array.isArray(parsed.oversightRuns) ? parsed.oversightRuns : [],
    reviewPacks: Array.isArray(parsed.reviewPacks) ? parsed.reviewPacks : [],
    activity: Array.isArray(parsed.activity) ? parsed.activity : [],
  };
}

function writeState(state) {
  ensureStateFile();
  fs.writeFileSync(temporaryFile, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(temporaryFile, stateFile);
}

function mutateState(mutator) {
  const state = readState();
  const result = mutator(state);
  writeState(state);
  return result;
}

module.exports = { readState, writeState, mutateState, stateFile };
