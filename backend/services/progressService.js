const SkinAnalysis = require("../models/SkinAnalysis");

const LEVEL_ORDER = {
  none: 0,
  low: 1,
  mild: 1,
  balanced: 2,
  moderate: 2,
  medium: 2,
  high: 3,
  severe: 4,
  uncertain: -1,
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toRank(value) {
  const normalized = normalize(value);

  if (!normalized) {
    return -1;
  }

  for (const [label, rank] of Object.entries(
    LEVEL_ORDER
  )) {
    if (normalized.includes(label)) {
      return rank;
    }
  }

  return -1;
}

function compareMetric(
  currentValue,
  previousValue,
  options = {}
) {
  const {
    lowerIsBetter = false,
  } = options;

  const currentRank = toRank(currentValue);
  const previousRank = toRank(previousValue);

  if (
    currentRank === -1 ||
    previousRank === -1
  ) {
    return {
      previous: previousValue || "Unknown",
      current: currentValue || "Unknown",
      change: "unknown",
    };
  }

  if (currentRank === previousRank) {
    return {
      previous: previousValue,
      current: currentValue,
      change: "stable",
    };
  }

  const improved = lowerIsBetter
    ? currentRank < previousRank
    : currentRank > previousRank;

  return {
    previous: previousValue,
    current: currentValue,
    change: improved
      ? "improved"
      : "declined",
  };
}

function buildMetricComparison(
  latest,
  previous
) {
  const latestFinal =
    latest?.finalAssessment || {};

  const previousFinal =
    previous?.finalAssessment || {};

  return {
    hydration: compareMetric(
      latestFinal.hydration,
      previousFinal.hydration
    ),

    oiliness: compareMetric(
      latestFinal.oiliness,
      previousFinal.oiliness,
      {
        lowerIsBetter: true,
      }
    ),

    sensitivity: compareMetric(
      latestFinal.sensitivity,
      previousFinal.sensitivity,
      {
        lowerIsBetter: true,
      }
    ),

    acne: compareMetric(
      latestFinal?.concerns?.acne,
      previousFinal?.concerns?.acne,
      {
        lowerIsBetter: true,
      }
    ),

    pigmentation: compareMetric(
      latestFinal?.concerns?.pigmentation,
      previousFinal?.concerns?.pigmentation,
      {
        lowerIsBetter: true,
      }
    ),

    pores: compareMetric(
      latestFinal?.concerns?.pores,
      previousFinal?.concerns?.pores,
      {
        lowerIsBetter: true,
      }
    ),
  };
}

function buildOverallProgress(
  latest,
  previous
) {
  const currentScore =
    Number(latest?.skinScore) || 0;

  const previousScore =
    Number(previous?.skinScore) || 0;

  const change =
    currentScore - previousScore;

  let status = "stable";

  if (change > 0) {
    status = "improved";
  }

  if (change < 0) {
    status = "declined";
  }

  return {
    previousScore,
    currentScore,
    change,
    status,
  };
}

function buildSummary(
  overall,
  metrics
) {
  const improvedMetrics =
    Object.entries(metrics)
      .filter(
        ([, value]) =>
          value.change === "improved"
      )
      .map(([name]) => name);

  const declinedMetrics =
    Object.entries(metrics)
      .filter(
        ([, value]) =>
          value.change === "declined"
      )
      .map(([name]) => name);

  if (
    overall.status === "improved" &&
    improvedMetrics.length > 0
  ) {
    return `Overall skin health improved by ${overall.change} points. Improvements were also seen in ${improvedMetrics.join(
      ", "
    )}.`;
  }

  if (
    overall.status === "declined" &&
    declinedMetrics.length > 0
  ) {
    return `Overall skin score decreased by ${Math.abs(
      overall.change
    )} points. Areas needing attention include ${declinedMetrics.join(
      ", "
    )}.`;
  }

  if (
    improvedMetrics.length > 0 ||
    declinedMetrics.length > 0
  ) {
    return `Your overall score is stable, but some individual skin metrics changed.`;
  }

  return "Your latest skin condition is generally stable compared with the previous scan.";
}

async function getLatestProgressForUser(
  userId
) {
  const scans = await SkinAnalysis.find({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(2)
    .lean();

  const latest = scans[0] || null;
  const previous = scans[1] || null;

  if (!latest) {
    return {
      status: "no-scans",
      latest: null,
      previous: null,
      overall: null,
      metrics: {},
      summary:
        "Complete your first skin analysis to start tracking progress.",
    };
  }

  if (!previous) {
    return {
      status: "first-scan",
      latest: {
        id: latest._id.toString(),
        date: latest.createdAt,
        skinScore: latest.skinScore,
      },
      previous: null,
      overall: {
        previousScore: null,
        currentScore:
          latest.skinScore ?? null,
        change: null,
        status: "first-scan",
      },
      metrics: {},
      summary:
        "This is your first saved scan. Complete another analysis later to begin progress comparison.",
    };
  }

  const overall =
    buildOverallProgress(
      latest,
      previous
    );

  const metrics =
    buildMetricComparison(
      latest,
      previous
    );

  return {
    status: "comparison-ready",

    latest: {
      id: latest._id.toString(),
      date: latest.createdAt,
      skinScore: latest.skinScore,
    },

    previous: {
      id: previous._id.toString(),
      date: previous.createdAt,
      skinScore: previous.skinScore,
    },

    overall,
    metrics,
    summary: buildSummary(
      overall,
      metrics
    ),
  };
}

module.exports = {
  getLatestProgressForUser,
  buildOverallProgress,
  buildMetricComparison,
  compareMetric,
};