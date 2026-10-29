const express = require("express");
const {
  listSystems,
  getSystemBundle,
  createChange,
  revalidateEvidence,
  evaluateOversight,
  approveOversightRun,
  generateReviewPack,
  getReviewPack,
} = require("./service");

const router = express.Router();

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

router.get(
  "/systems",
  asyncRoute(async (request, response) => {
    response.json({ systems: listSystems() });
  }),
);

router.get(
  "/systems/:systemId",
  asyncRoute(async (request, response) => {
    response.json(getSystemBundle(request.params.systemId));
  }),
);

router.get(
  "/systems/:systemId/changes",
  asyncRoute(async (request, response) => {
    const bundle = getSystemBundle(request.params.systemId);
    response.json({ changes: bundle.changes });
  }),
);

router.post(
  "/systems/:systemId/changes",
  asyncRoute(async (request, response) => {
    response.status(201).json(createChange(request.params.systemId, request.body ?? {}));
  }),
);

router.get(
  "/systems/:systemId/changes/:changeId",
  asyncRoute(async (request, response) => {
    const bundle = getSystemBundle(request.params.systemId);
    const change = bundle.changes.find((entry) => entry.id === request.params.changeId);
    if (!change) {
      return response.status(404).json({ error: "Compliance change not found." });
    }
    response.json({ change });
  }),
);

router.get(
  "/systems/:systemId/evidence",
  asyncRoute(async (request, response) => {
    const bundle = getSystemBundle(request.params.systemId);
    response.json({
      evidence: bundle.system.evidence,
      invalidations: bundle.invalidations,
      reviews: bundle.evidenceReviews,
    });
  }),
);

router.post(
  "/systems/:systemId/evidence/:evidenceId/revalidate",
  asyncRoute(async (request, response) => {
    response.status(201).json(
      revalidateEvidence(
        request.params.systemId,
        request.params.evidenceId,
        request.body ?? {},
      ),
    );
  }),
);

router.get(
  "/systems/:systemId/oversight",
  asyncRoute(async (request, response) => {
    const bundle = getSystemBundle(request.params.systemId);
    response.json(bundle.oversight);
  }),
);

router.post(
  "/systems/:systemId/oversight/evaluate",
  asyncRoute(async (request, response) => {
    response.status(201).json(
      evaluateOversight(request.params.systemId, request.body ?? {}),
    );
  }),
);

router.post(
  "/systems/:systemId/oversight/runs/:runId/approve",
  asyncRoute(async (request, response) => {
    response.json(
      approveOversightRun(
        request.params.systemId,
        request.params.runId,
        request.body ?? {},
      ),
    );
  }),
);

router.get(
  "/systems/:systemId/activity",
  asyncRoute(async (request, response) => {
    const bundle = getSystemBundle(request.params.systemId);
    const limit = Math.min(Number(request.query.limit) || 100, 250);
    response.json({ activity: bundle.activity.slice(0, limit) });
  }),
);

router.get(
  "/systems/:systemId/review-packs",
  asyncRoute(async (request, response) => {
    const bundle = getSystemBundle(request.params.systemId);
    response.json({ reviewPacks: bundle.reviewPacks });
  }),
);

router.post(
  "/systems/:systemId/review-packs",
  asyncRoute(async (request, response) => {
    response.status(201).json(
      generateReviewPack(request.params.systemId, request.body ?? {}),
    );
  }),
);

router.get(
  "/review-packs/:packId",
  asyncRoute(async (request, response) => {
    response.json(getReviewPack(request.params.packId));
  }),
);

router.get(
  "/review-packs/:packId/report",
  asyncRoute(async (request, response) => {
    const pack = getReviewPack(request.params.packId);
    response.type("text/markdown; charset=utf-8");
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${pack.id}-change-review.md"`,
    );
    response.send(pack.report);
  }),
);

router.use((request, response) => {
  response.status(404).json({ error: "Compliance endpoint not found." });
});

router.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  const status = Number(error.status) || 500;
  if (status >= 500) {
    console.error("Compliance API error:", error);
  }
  response.status(status).json({
    error: error.message || "The compliance service could not complete the request.",
    details: error.details,
  });
});

module.exports = router;
