const concernTreatmentMap = {
  acne: [
    "Salicylic Acid",
    "Niacinamide",
    "Azelaic Acid",
  ],

  "acne-prone skin": [
    "Salicylic Acid",
    "Niacinamide",
    "Azelaic Acid",
  ],

  pigmentation: [
    "Vitamin C",
    "Alpha Arbutin",
    "Tranexamic Acid",
    "Azelaic Acid",
    "Niacinamide",
  ],

  "uneven skin tone": [
    "Vitamin C",
    "Alpha Arbutin",
    "Tranexamic Acid",
    "Niacinamide",
  ],

  dullness: [
    "Vitamin C",
    "Niacinamide",
  ],

  oiliness: [
    "Niacinamide",
    "Salicylic Acid",
  ],

  "excess oil": [
    "Niacinamide",
    "Salicylic Acid",
  ],

  "visible pores": [
    "Niacinamide",
    "Salicylic Acid",
  ],

  "enlarged pores": [
    "Niacinamide",
    "Salicylic Acid",
  ],

  dryness: [
    "Hyaluronic Acid",
    "Ceramides",
    "Panthenol",
    "Squalane",
  ],

  dehydration: [
    "Hyaluronic Acid",
    "Ceramides",
    "Panthenol",
  ],

  tightness: [
    "Hyaluronic Acid",
    "Ceramides",
    "Panthenol",
  ],

  sensitivity: [
    "Ceramides",
    "Panthenol",
    "Centella Asiatica",
  ],

  redness: [
    "Azelaic Acid",
    "Ceramides",
    "Panthenol",
    "Centella Asiatica",
  ],

  "damaged skin barrier": [
    "Ceramides",
    "Panthenol",
    "Squalane",
  ],

  "weakened skin barrier": [
    "Ceramides",
    "Panthenol",
    "Squalane",
  ],

  "fine lines": [
    "Retinol",
    "Peptides",
    "Hyaluronic Acid",
  ],

  wrinkles: [
    "Retinol",
    "Peptides",
    "Hyaluronic Acid",
  ],

  "sun damage": [
    "Vitamin C",
    "Niacinamide",
    "Alpha Arbutin",
  ],

  "dark spots": [
    "Alpha Arbutin",
    "Tranexamic Acid",
    "Vitamin C",
    "Azelaic Acid",
  ],
};

const essentialRoutineSlots = {
  morning: [
    "cleanser",
    "treatment",
    "moisturizer",
    "sunscreen",
  ],

  night: [
    "cleanser",
    "treatment",
    "moisturizer",
  ],
};

const optionalRoutineSlots = {
  weekly: [
    "exfoliant",
    "mask",
  ],
};

const treatmentPriority = {
  acne: [
    "Salicylic Acid",
    "Niacinamide",
    "Azelaic Acid",
  ],

  pigmentation: [
    "Vitamin C",
    "Alpha Arbutin",
    "Tranexamic Acid",
    "Azelaic Acid",
  ],

  oiliness: [
    "Niacinamide",
    "Salicylic Acid",
  ],

  dryness: [
    "Hyaluronic Acid",
    "Ceramides",
  ],

  dehydration: [
    "Hyaluronic Acid",
    "Ceramides",
  ],

  sensitivity: [
    "Ceramides",
    "Panthenol",
    "Centella Asiatica",
  ],

  redness: [
    "Azelaic Acid",
    "Ceramides",
  ],

  "fine lines": [
    "Retinol",
    "Peptides",
  ],

  dullness: [
    "Vitamin C",
    "Niacinamide",
  ],
};

const activeIngredientRules = {
  "Salicylic Acid": {
    strength: "medium",
    beginnerFriendly: true,
    preferredRoutine: "night",
    maximumWeeklyFrequency: 3,
  },

  "Niacinamide": {
    strength: "low",
    beginnerFriendly: true,
    preferredRoutine: "morning-or-night",
    maximumWeeklyFrequency: 7,
  },

  "Vitamin C": {
    strength: "medium",
    beginnerFriendly: true,
    preferredRoutine: "morning",
    maximumWeeklyFrequency: 7,
  },

  "Alpha Arbutin": {
    strength: "low",
    beginnerFriendly: true,
    preferredRoutine: "morning-or-night",
    maximumWeeklyFrequency: 7,
  },

  "Tranexamic Acid": {
    strength: "medium",
    beginnerFriendly: true,
    preferredRoutine: "night",
    maximumWeeklyFrequency: 7,
  },

  "Azelaic Acid": {
    strength: "medium",
    beginnerFriendly: true,
    preferredRoutine: "night",
    maximumWeeklyFrequency: 7,
  },

  "Hyaluronic Acid": {
    strength: "low",
    beginnerFriendly: true,
    preferredRoutine: "morning-or-night",
    maximumWeeklyFrequency: 7,
  },

  Ceramides: {
    strength: "low",
    beginnerFriendly: true,
    preferredRoutine: "morning-or-night",
    maximumWeeklyFrequency: 7,
  },

  Panthenol: {
    strength: "low",
    beginnerFriendly: true,
    preferredRoutine: "morning-or-night",
    maximumWeeklyFrequency: 7,
  },

  Peptides: {
    strength: "low",
    beginnerFriendly: true,
    preferredRoutine: "morning-or-night",
    maximumWeeklyFrequency: 7,
  },

  Retinol: {
    strength: "high",
    beginnerFriendly: false,
    preferredRoutine: "night",
    maximumWeeklyFrequency: 2,
    pregnancyRestricted: true,
  },

  "Benzoyl Peroxide": {
    strength: "high",
    beginnerFriendly: false,
    preferredRoutine: "night",
    maximumWeeklyFrequency: 3,
  },

  AHA: {
    strength: "high",
    beginnerFriendly: false,
    preferredRoutine: "night",
    maximumWeeklyFrequency: 1,
  },

  BHA: {
    strength: "medium",
    beginnerFriendly: true,
    preferredRoutine: "night",
    maximumWeeklyFrequency: 2,
  },
};

const incompatibleIngredientPairs = [
  ["Retinol", "AHA"],
  ["Retinol", "BHA"],
  ["Retinol", "Salicylic Acid"],
  ["Retinol", "Benzoyl Peroxide"],
  ["AHA", "BHA"],
  ["AHA", "Salicylic Acid"],
  ["Benzoyl Peroxide", "Vitamin C"],
];

const sensitiveSkinAvoid = [
  "Retinol",
  "AHA",
  "Benzoyl Peroxide",
];

const damagedBarrierAvoid = [
  "Retinol",
  "AHA",
  "BHA",
  "Salicylic Acid",
  "Benzoyl Peroxide",
];

const pregnancyRestrictedIngredients = [
  "Retinol",
  "Retinal",
  "Retinoid",
  "Adapalene",
  "Tretinoin",
];

const routineSafetyRules = {
  beginnerMaximumTreatmentsPerRoutine: 1,

  experiencedMaximumTreatmentsPerRoutine: 2,

  maximumStrongActivesPerRoutine: 1,

  requireSunscreenWhenUsing: [
    "Retinol",
    "AHA",
    "BHA",
    "Salicylic Acid",
    "Vitamin C",
    "Alpha Arbutin",
    "Tranexamic Acid",
  ],

  avoidActivesWhenBarrierDamaged: true,

  avoidRetinoidsDuringPregnancy: true,
};

const categoryAliases = {
  cleanser: [
    "cleanser",
    "face wash",
  ],

  moisturizer: [
    "moisturizer",
    "moisturiser",
    "cream",
    "gel moisturizer",
    "barrier cream",
  ],

  sunscreen: [
    "sunscreen",
    "sun protection",
    "spf",
  ],

  treatment: [
    "serum",
    "treatment",
    "spot treatment",
    "retinol",
    "exfoliant",
  ],

  exfoliant: [
    "exfoliant",
    "aha",
    "bha",
    "peel",
  ],

  mask: [
    "mask",
    "sleeping mask",
    "clay mask",
  ],
};

const skinTypeCategoryPreferences = {
  oily: {
    cleanser: [
      "gel",
      "foaming",
    ],

    moisturizer: [
      "gel",
      "lightweight",
      "oil-free",
    ],

    sunscreen: [
      "gel",
      "matte",
      "lightweight",
    ],
  },

  dry: {
    cleanser: [
      "gentle",
      "hydrating",
      "cream",
    ],

    moisturizer: [
      "cream",
      "barrier",
      "ceramide",
    ],

    sunscreen: [
      "hydrating",
      "cream",
    ],
  },

  sensitive: {
    cleanser: [
      "gentle",
      "fragrance-free",
    ],

    moisturizer: [
      "barrier",
      "ceramide",
      "soothing",
    ],

    sunscreen: [
      "gentle",
      "mineral",
      "fragrance-free",
    ],
  },

  combination: {
    cleanser: [
      "gentle",
      "gel",
    ],

    moisturizer: [
      "lightweight",
      "gel",
    ],

    sunscreen: [
      "lightweight",
      "gel",
    ],
  },

  normal: {
    cleanser: [
      "gentle",
    ],

    moisturizer: [
      "lightweight",
      "hydrating",
    ],

    sunscreen: [
      "lightweight",
      "hydrating",
    ],
  },
};

module.exports = {
  concernTreatmentMap,
  essentialRoutineSlots,
  optionalRoutineSlots,
  treatmentPriority,
  activeIngredientRules,
  incompatibleIngredientPairs,
  sensitiveSkinAvoid,
  damagedBarrierAvoid,
  pregnancyRestrictedIngredients,
  routineSafetyRules,
  categoryAliases,
  skinTypeCategoryPreferences,
};