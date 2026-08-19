const mongoose = require("mongoose");

const routineStepSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: "",
    },
    instruction: {
      type: String,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const concernSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      default: "uncertain",
    },
    score: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const skinAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    image: {
      filename: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        default: "",
      },
    },

    questionnaire: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    visualAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    reportedAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    finalAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    conflicts: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    skinScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    skinType: {
      type: String,
      default: "Unknown",
    },

    concerns: {
      type: [concernSchema],
      default: [],
    },

    morningRoutine: {
      type: [routineStepSchema],
      default: [],
    },

    nightRoutine: {
      type: [routineStepSchema],
      default: [],
    },

    weeklyRoutine: {
      type: [routineStepSchema],
      default: [],
    },

    products: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    routineTotal: {
      type: Number,
      default: 0,
    },

    detectedBudget: {
      type: Number,
      default: null,
    },

    budgetStatus: {
      type: String,
      default: "",
    },

    weather: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    safety: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    progress: {
      previousSkinScore: {
        type: Number,
        default: null,
      },
      scoreChange: {
        type: Number,
        default: null,
      },
      direction: {
        type: String,
        enum: ["improved", "declined", "stable", "first-scan"],
        default: "first-scan",
      },
    },

    analysisVersion: {
      type: String,
      default: "2.0",
    },
  },
  {
    timestamps: true,
  }
);

skinAnalysisSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SkinAnalysis",
  skinAnalysisSchema
);