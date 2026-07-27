const productCatalog = [
  {
    id: "dot-key-watermelon-sunscreen",

    brand: "Dot & Key",

    name: "Watermelon Cooling Sunscreen SPF 50+ PA++++",

    category: "Sunscreen",

    size: "",

    price: 0,
    originalPrice: 0,
    currency: "INR",

    seller: "Dot & Key Official Website",

    skinTypes: [
      "oily",
      "combination",
    ],

    concerns: [
      "oiliness",
      "excess oil",
      "sun damage",
      "dehydration",
      "dullness",
    ],

    keyIngredients: [
      "UV filters",
      "Watermelon extract",
      "Hyaluronic acid",
    ],

    usage:
      "Apply generously to the face and neck as the final step of the morning routine. Reapply every two to three hours when outdoors.",

    warnings: [
      "Patch-test before regular use.",
      "Avoid direct contact with the eyes.",
    ],

    /*
      The backend extracts the product image
      automatically from this official page.
    */
    buyUrl:
      "https://www.dotandkey.com/products/watermelon-cooling-spf-50-face-sunscreen",
  },

  {
    id: "dot-key-barrier-repair-sunscreen",

    brand: "Dot & Key",

    name: "Barrier Repair Sunscreen SPF 50+ PA++++",

    category: "Sunscreen",

    size: "",

    price: 0,
    originalPrice: 0,
    currency: "INR",

    seller: "Dot & Key Official Website",

    skinTypes: [
      "dry",
      "normal",
      "sensitive",
      "combination",
    ],

    concerns: [
      "dryness",
      "sensitivity",
      "damaged skin barrier",
      "weakened skin barrier",
      "dehydration",
      "sun damage",
    ],

    keyIngredients: [
      "Ceramides",
      "UV filters",
      "Hyaluronic acid",
    ],

    usage:
      "Apply generously to the face and neck as the final step of the morning routine. Reapply every two to three hours when outdoors.",

    warnings: [
      "Patch-test before regular use.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://www.dotandkey.com/products/barrier-repair-sunscreen",
  },

  {
    id: "cetaphil-gentle-skin-cleanser",

    brand: "Cetaphil",

    name: "Gentle Skin Cleanser",

    category: "Cleanser",

    size: "",

    price: 0,
    originalPrice: 0,
    currency: "INR",

    seller: "Cetaphil India Official Website",

    skinTypes: [
      "dry",
      "normal",
      "sensitive",
    ],

    concerns: [
      "dryness",
      "sensitivity",
      "tightness",
      "weakened skin barrier",
      "damaged skin barrier",
      "dehydration",
    ],

    keyIngredients: [
      "Glycerin",
      "Niacinamide",
      "Panthenol",
    ],

    usage:
      "Massage gently onto damp skin and rinse. Use in the morning and evening according to skin tolerance.",

    warnings: [
      "Patch-test before regular use.",
      "Avoid direct contact with the eyes.",
    ],

    buyUrl:
      "https://www.cetaphil.in/products/cleansers/gentle-skin-cleanser/8906005274120.html",
  },

  {
    id: "cetaphil-oily-skin-cleanser",

    brand: "Cetaphil",

    name: "Oily Skin Cleanser",

    category: "Cleanser",

    size: "",

    price: 0,
    originalPrice: 0,
    currency: "INR",

    seller: "Cetaphil India Official Website",

    skinTypes: [
      "oily",
      "combination",
      "sensitive",
    ],

    concerns: [
      "oiliness",
      "excess oil",
      "visible pores",
      "enlarged pores",
      "acne",
      "acne-prone skin",
    ],

    keyIngredients: [
      "Niacinamide",
      "Panthenol",
    ],

    usage:
      "Massage gently onto damp skin and rinse. Use in the morning and evening according to skin tolerance.",

    warnings: [
      "Patch-test before regular use.",
      "Avoid over-cleansing irritated or very dry skin.",
    ],

    buyUrl:
      "https://www.cetaphil.in/products/cleansers/oily-skin-cleanser/8906005274090.html",
  },

  {
    id: "cetaphil-moisturising-lotion",

    brand: "Cetaphil",

    name: "Cetaphil Moisturising Lotion",

    category: "Moisturizer",

    size: "",

    price: 0,
    originalPrice: 0,
    currency: "INR",

    seller: "Cetaphil India Official Website",

    skinTypes: [
      "dry",
      "normal",
      "sensitive",
    ],

    concerns: [
      "dryness",
      "dehydration",
      "sensitivity",
      "tightness",
      "weakened skin barrier",
      "damaged skin barrier",
    ],

    keyIngredients: [
      "Glycerin",
      "Niacinamide",
      "Panthenol",
      "Avocado oil",
    ],

    usage:
      "Apply to clean skin after cleansing. Use in the morning and evening.",

    warnings: [
      "Patch-test before regular use.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://www.cetaphil.in/products-1/cetaphil-moisturising-lotion/8906005271623.html/",
  },
  {
    id: "minimalist-niacinamide-5-serum",

    brand: "Minimalist",

    name: "Niacinamide 5% Face Serum",

    category: "Serum",

    treatmentType: "Niacinamide",

    size: "10 ml",

    price: 249,
    originalPrice: 249,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "dry",
      "normal",
      "sensitive",
      "combination",
      "acne-prone",
    ],

    concerns: [
      "sensitivity",
      "redness",
      "dehydration",
      "acne marks",
      "uneven skin tone",
      "damaged skin barrier",
      "weakened skin barrier",
    ],

    benefits: [
      "Supports the skin barrier",
      "Helps soothe sensitive skin",
      "Improves the appearance of uneven tone",
      "Provides lightweight hydration",
    ],

    keyIngredients: [
      "Niacinamide",
      "Hyaluronic Acid",
      "Bifida Ferment Lysate",
      "Oat Extract",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "low",

    routineSlots: [
      "morning-treatment",
      "night-treatment",
    ],

    incompatibleWith: [],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops after cleansing. Follow with moisturizer. It may be used in the morning or at night.",

    warnings: [
      "Patch-test before regular use.",
      "Introduce one new treatment product at a time.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/niacinamide-5-face-serum-10ml",
  },

  {
    id: "minimalist-niacinamide-10-serum",

    brand: "Minimalist",

    name: "Niacinamide 10% Face Serum",

    category: "Serum",

    treatmentType: "Niacinamide",

    size: "30 ml",

    price: 599,
    originalPrice: 599,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "oily",
      "combination",
      "normal",
      "acne-prone",
    ],

    concerns: [
      "oiliness",
      "excess oil",
      "visible pores",
      "enlarged pores",
      "acne marks",
      "uneven skin tone",
      "dullness",
    ],

    benefits: [
      "Helps balance excess oil",
      "Improves the appearance of visible pores",
      "Supports the skin barrier",
      "Helps improve uneven-looking skin tone",
    ],

    keyIngredients: [
      "Niacinamide",
      "Zinc",
      "Matmarine",
      "Acetyl Glucosamine",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "medium",

    routineSlots: [
      "morning-treatment",
      "night-treatment",
    ],

    incompatibleWith: [],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops after cleansing and before moisturizer. Begin once daily if the user has not previously used niacinamide.",

    warnings: [
      "Patch-test before regular use.",
      "Users with very sensitive skin should begin with a lower-strength niacinamide product.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/niacinamide-10-with-matmarine",
  },

  {
    id: "minimalist-vitamin-c-10-serum",

    brand: "Minimalist",

    name: "Vitamin C 10% Face Serum",

    category: "Serum",

    treatmentType: "Vitamin C",

    size: "10 ml",

    price: 299,
    originalPrice: 299,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "dry",
      "normal",
      "oily",
      "combination",
    ],

    concerns: [
      "dullness",
      "pigmentation",
      "dark spots",
      "sun damage",
      "uneven skin tone",
      "loss of elasticity",
    ],

    benefits: [
      "Helps improve visible dullness",
      "Supports brighter-looking skin",
      "Helps improve the appearance of dark spots",
      "Provides antioxidant support",
    ],

    keyIngredients: [
      "Vitamin C",
      "Ethyl Ascorbic Acid",
      "Acetyl Glucosamine",
      "PHA",
      "Centella Water",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "medium",

    routineSlots: [
      "morning-treatment",
    ],

    incompatibleWith: [
      "Benzoyl Peroxide",
      "AHA",
      "BHA",
      "Retinol",
    ],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops after cleansing in the morning. Follow with moisturizer and sunscreen.",

    warnings: [
      "Patch-test before regular use.",
      "Do not use in the same routine as a strong exfoliant when the user is a beginner.",
      "Daily sunscreen is required.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/vitamin-c-ethyl-ascorbic-acid-10-acetyl-glucosamine-1",
  },

  {
    id: "minimalist-hyaluronic-pga-2-serum",

    brand: "Minimalist",

    name: "Hyaluronic + PGA 2% Face Serum",

    category: "Serum",

    treatmentType: "Hyaluronic Acid",

    size: "30 ml",

    price: 599,
    originalPrice: 599,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "dry",
      "normal",
      "oily",
      "combination",
      "sensitive",
    ],

    concerns: [
      "dryness",
      "dehydration",
      "tightness",
      "dullness",
      "fine lines",
      "damaged skin barrier",
    ],

    benefits: [
      "Provides lightweight hydration",
      "Helps reduce the appearance of dehydration lines",
      "Supports soft and plump-looking skin",
      "Suitable for use alongside most treatments",
    ],

    keyIngredients: [
      "Hyaluronic Acid",
      "Polyglutamic Acid",
      "Vitamin B5",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "low",

    routineSlots: [
      "morning-treatment",
      "night-treatment",
    ],

    incompatibleWith: [],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops to slightly damp skin after cleansing. Seal with moisturizer.",

    warnings: [
      "Patch-test before regular use.",
      "Always follow with moisturizer to help retain hydration.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/2-hyaluronic-acid",
  },
    {
    id: "minimalist-salicylic-acid-2-serum",

    brand: "Minimalist",

    name: "Salicylic Acid 2% Face Serum",

    category: "Serum",

    treatmentType: "Salicylic Acid",

    size: "30 ml",

    price: 549,
    originalPrice: 549,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "oily",
      "combination",
      "acne-prone",
    ],

    concerns: [
      "acne",
      "acne-prone skin",
      "blackheads",
      "whiteheads",
      "oiliness",
      "excess oil",
      "visible pores",
      "enlarged pores",
    ],

    benefits: [
      "Helps unclog pores",
      "Helps reduce blackheads and whiteheads",
      "Supports oil control",
      "Improves the appearance of congested skin",
    ],

    keyIngredients: [
      "Salicylic Acid",
      "Aloe Vera",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "medium",

    routineSlots: [
      "night-treatment",
    ],

    incompatibleWith: [
      "Retinol",
      "AHA",
      "BHA",
      "Benzoyl Peroxide",
    ],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops after cleansing at night. Begin two or three times per week and increase only if the skin tolerates it.",

    warnings: [
      "Patch-test before regular use.",
      "Do not apply to irritated or damaged skin.",
      "Do not combine with another strong exfoliant in the same routine.",
      "Use sunscreen every morning.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/salicylic-acid-2",
  },

  {
    id: "minimalist-alpha-arbutin-2-serum",

    brand: "Minimalist",

    name: "Alpha Arbutin 2% Face Serum",

    category: "Serum",

    treatmentType: "Alpha Arbutin",

    size: "30 ml",

    price: 549,
    originalPrice: 549,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "dry",
      "normal",
      "oily",
      "combination",
    ],

    concerns: [
      "pigmentation",
      "dark spots",
      "acne marks",
      "uneven skin tone",
      "sun damage",
      "dullness",
    ],

    benefits: [
      "Helps improve the appearance of dark spots",
      "Supports a more even-looking skin tone",
      "Helps reduce the appearance of post-acne marks",
      "Supports brighter-looking skin",
    ],

    keyIngredients: [
      "Alpha Arbutin",
      "Hyaluronic Acid",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "low",

    routineSlots: [
      "morning-treatment",
      "night-treatment",
    ],

    incompatibleWith: [],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops after cleansing and before moisturizer. It may be used in the morning or at night.",

    warnings: [
      "Patch-test before regular use.",
      "Use sunscreen every morning for better pigmentation control.",
      "Introduce one new treatment product at a time.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/alpha-arbutin-2",
  },

  {
    id: "minimalist-tranexamic-acid-3-serum",

    brand: "Minimalist",

    name: "Tranexamic Acid 3% Face Serum",

    category: "Serum",

    treatmentType: "Tranexamic Acid",

    size: "30 ml",

    price: 649,
    originalPrice: 649,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "dry",
      "normal",
      "oily",
      "combination",
    ],

    concerns: [
      "pigmentation",
      "dark spots",
      "acne marks",
      "uneven skin tone",
      "sun damage",
      "dullness",
    ],

    benefits: [
      "Helps improve stubborn-looking pigmentation",
      "Supports a more even-looking skin tone",
      "Helps reduce the appearance of post-acne marks",
      "Supports brighter-looking skin",
    ],

    keyIngredients: [
      "Tranexamic Acid",
      "Mandelic Acid",
      "Salicylic Acid",
      "HPA",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "medium",

    routineSlots: [
      "night-treatment",
    ],

    incompatibleWith: [
      "Retinol",
      "AHA",
      "BHA",
      "Salicylic Acid",
      "Benzoyl Peroxide",
    ],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops after cleansing at night. Begin on alternate nights and increase only if the skin tolerates it.",

    warnings: [
      "Patch-test before regular use.",
      "Do not combine with another strong exfoliating treatment in the same routine.",
      "Use sunscreen every morning.",
      "Avoid use on irritated or damaged skin.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/tranexamic-acid-3-hpa",
  },

{
    id: "derma-co-nia-zelaic-oil-control-serum",

    brand: "The Derma Co",

    name: "Nia-Zelaic Oil Control Face Serum",

    category: "Serum",

    treatmentType: "Azelaic Acid",

    size: "30 ml",

    price: 558,
    originalPrice: 649,
    currency: "INR",

    seller: "The Derma Co Official Website",

    skinTypes: [
      "oily",
      "combination",
      "acne-prone",
    ],

    concerns: [
      "acne",
      "acne-prone skin",
      "oiliness",
      "excess oil",
      "redness",
      "acne marks",
      "uneven skin tone",
      "visible pores",
    ],

    benefits: [
      "Helps control excess oil",
      "Supports clearer-looking skin",
      "Helps reduce the appearance of acne marks",
      "Supports a more even-looking skin tone",
    ],

    keyIngredients: [
      "Azelaic Acid",
      "Niacinamide",
      "Potassium Azeloyl Diglycinate",
      "N-Acetyl Glucosamine",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "medium",

    routineSlots: [
      "night-treatment",
    ],

    incompatibleWith: [
      "Retinol",
      "AHA",
      "BHA",
      "Salicylic Acid",
      "Benzoyl Peroxide",
    ],

    pregnancyRestricted: false,

    usage:
      "Apply 2 to 3 drops after cleansing at night. Begin on alternate nights and follow with moisturizer.",

    warnings: [
      "Patch-test before regular use.",
      "Avoid applying to irritated or damaged skin.",
      "Do not combine with another strong treatment in the same routine.",
      "Use sunscreen every morning.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://thedermaco.com/products/nia-zelaic-oil-control-face-serum-30-ml",
  },

  {
    id: "minimalist-ceramide-madecassoside-moisturizer",

    brand: "Minimalist",

    name: "Ceramides 0.3% + Madecassoside Moisturizer",

    category: "Moisturizer",

    treatmentType: "Ceramides",

    size: "50 g",

    price: 599,
    originalPrice: 599,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "oily",
      "combination",
      "normal",
      "sensitive",
    ],

    concerns: [
      "sensitivity",
      "redness",
      "dehydration",
      "irritation",
      "damaged skin barrier",
      "weakened skin barrier",
    ],

    benefits: [
      "Supports skin-barrier repair",
      "Helps soothe irritated-looking skin",
      "Helps retain skin hydration",
      "Supports sensitive and compromised skin",
    ],

    keyIngredients: [
      "Ceramides",
      "Madecassoside",
      "Oat Extract",
      "Allantoin",
      "Glycerin",
    ],

    beginnerFriendly: true,

    sensitivityLevel: "low",

    routineSlots: [
      "morning-moisturizer",
      "night-moisturizer",
    ],

    incompatibleWith: [],

    pregnancyRestricted: false,

    usage:
      "Apply after serums or treatments. Use in the morning and evening as the moisturizing step.",

    warnings: [
      "Patch-test before regular use.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/ceramides-0-3-madecassoside",
  },

  {
    id: "minimalist-retinol-0-3-serum",

    brand: "Minimalist",

    name: "Retinol 0.3% Face Serum",

    category: "Serum",

    treatmentType: "Retinol",

    size: "30 ml",

    price: 570,
    originalPrice: 599,
    currency: "INR",

    seller: "Minimalist Official Website",

    skinTypes: [
      "dry",
      "normal",
      "oily",
      "combination",
      "acne-prone",
    ],

    concerns: [
      "fine lines",
      "wrinkles",
      "uneven skin tone",
      "uneven texture",
      "loss of elasticity",
      "sun damage",
    ],

    benefits: [
      "Helps improve the appearance of fine lines",
      "Supports smoother-looking skin",
      "Helps improve uneven-looking texture",
      "Supports firmer-looking skin",
    ],

    keyIngredients: [
      "Retinol",
      "Coenzyme Q10",
      "Bakuchiol",
      "Squalane",
      "Vitamin E",
    ],

    beginnerFriendly: false,

    sensitivityLevel: "high",

    routineSlots: [
      "night-treatment",
    ],

    incompatibleWith: [
      "AHA",
      "BHA",
      "Salicylic Acid",
      "Benzoyl Peroxide",
      "Vitamin C",
      "Azelaic Acid",
    ],

    pregnancyRestricted: true,

    minimumAge: 18,

    usage:
      "Apply a small amount at night after water-based serums and before moisturizer. Begin once or twice weekly and increase slowly only when tolerated.",

    warnings: [
      "Patch-test before regular use.",
      "Do not recommend during pregnancy or breastfeeding.",
      "Do not recommend to users under 18.",
      "Do not apply to irritated or damaged skin.",
      "Do not combine with exfoliating acids in the same routine.",
      "Use sunscreen every morning.",
      "Stop use if persistent irritation occurs.",
    ],

    buyUrl:
      "https://beminimalist.co/products/retinol-0-3-q10",
  },
];

module.exports = productCatalog;

module.exports = productCatalog;