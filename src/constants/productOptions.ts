// Floral
const floralScents = [
  "Rose", "Indian Rose", "Kannauj Rose", "Damask Rose", "Jasmine", "Mogra",
  "Arabian Jasmine", "Night Jasmine", "Lavender", "Frangipani", "Tuberose",
  "Rajnigandha", "Lily", "White Lily", "Oriental Lily", "Gardenia", "Lotus",
  "Marigold", "Genda", "Champa", "Nag Champa", "Ylang-Ylang",
];

// Woody / Earthy
const woodyScents = [
  "Sandalwood", "Mysore Sandalwood", "Cedarwood", "Oudh", "Agarwood",
  "Patchouli", "Vetiver", "Khus", "Pinewood", "Teakwood", "Driftwood",
  "Moss", "Oakmoss",
];

// Citrus & Fruits
const citrusFruitScents = [
  "Lemon", "Orange", "Sweet Orange", "Bitter Orange", "Lime", "Bergamot",
  "Grapefruit", "Green Apple", "Mango", "Pineapple", "Strawberry", "Peach",
  "Pomegranate", "Blueberry", "Raspberry", "Blackberry", "Mixed Berry",
  "Watermelon", "Cucumber Melon", "Coconut",
];

// Spices & Indian Notes
const spiceScents = [
  "Cinnamon", "Cardamom", "Clove", "Nutmeg", "Saffron", "Kesar",
  "Black Pepper", "Star Anise", "Ginger", "Turmeric",
];

// Sweet & Gourmand
const sweetScents = [
  "Vanilla", "French Vanilla", "Bourbon Vanilla", "Chocolate", "Dark Chocolate",
  "Cocoa", "Coffee", "Espresso", "Cappuccino", "Caramel", "Honey",
  "Butterscotch", "Maple Syrup", "Cookies", "Bakery", "Cake", "Sugarcane",
];

// Resinous / Deep
const resinousScents = [
  "Amber", "Musk", "Frankincense", "Myrrh", "Nag Champa", "Copal",
  "Resin blends", "Oudh & Musk",
];

// Herbal & Fresh
const herbalScents = [
  "Lemongrass", "Eucalyptus", "Peppermint", "Spearmint", "Basil", "Tulsi",
  "Sage", "Thyme", "Rosemary", "Tea Tree", "Chamomile", "Aloe Vera",
  "Green Tea", "Fresh Linen", "Cotton",
];

// Tropical & Exotic
const tropicalScents = [
  "Coconut Lime", "Mango Papaya", "Tropical Fruit Punch", "Pineapple Coconut",
  "Passionfruit", "Banana Leaf", "Hibiscus",
];

// Festive & Seasonal
const festiveScents = [
  "Pumpkin Spice", "Spiced Apple", "Winter Evergreen", "Pine", "Fir", "Balsam",
  "Christmas Spice", "Sandal & Rose",
];

// Shades of Pink
const pinkColors = [
  "Pink", "Light Pink", "Baby Pink", "Dark Pink", "Hot Pink", "Rose Pink", "Peach",
];

// Shades of Blue
const blueColors = [
  "Blue", "Light Blue", "Sky Blue", "Dark Blue", "Navy Blue", "Royal Blue", "Peacock Blue",
];

// Shades of Green
const greenColors = [
  "Green", "Light Green", "Mint Green", "Dark Green", "Emerald Green", "Olive Green",
];

// Shades of Red
const redColors = [
  "Red", "Light Red", "Dark Red", "Crimson", "Burgundy", "Maroon",
];

// Shades of Purple
const purpleColors = [
  "Purple", "Light Purple", "Lavender", "Lilac", "Dark Purple", "Violet",
];

// Shades of Yellow & Orange
const yellowOrangeColors = [
  "Yellow", "Light Yellow", "Lemon Yellow", "Golden Yellow", "Orange",
  "Light Orange", "Dark Orange", "Saffron", "Marigold",
];

// Neutral & Earthy
const neutralColors = [
  "White", "Off White", "Ivory", "Cream", "Brown", "Light Brown",
  "Dark Brown", "Beige", "Terracotta", "Grey", "Black",
];

// Metallic & Decorative
const specialColors = [
  "Gold", "Silver", "Rose Gold", "Copper", "Bronze", "Glittered Gold",
  "Glittered Silver", "Multicolor Glitter", "Ombre", "Gradient",
  "Marble Effect", "Transparent Gel",
];

// Master lists
export const allCandleScents: string[] = [
  ...floralScents,
  ...woodyScents,
  ...citrusFruitScents,
  ...spiceScents,
  ...sweetScents,
  ...resinousScents,
  ...herbalScents,
  ...tropicalScents,
  ...festiveScents,
];

export const allCandleColors: string[] = [
  ...pinkColors,
  ...blueColors,
  ...greenColors,
  ...redColors,
  ...purpleColors,
  ...yellowOrangeColors,
  ...neutralColors,
  ...specialColors,
];

// Grouped options for better UX
export const groupedScents = [
  { label: "Floral", options: floralScents },
  { label: "Woody & Earthy", options: woodyScents },
  { label: "Citrus & Fruits", options: citrusFruitScents },
  { label: "Spices & Indian", options: spiceScents },
  { label: "Sweet & Gourmand", options: sweetScents },
  { label: "Resinous & Deep", options: resinousScents },
  { label: "Herbal & Fresh", options: herbalScents },
  { label: "Tropical & Exotic", options: tropicalScents },
  { label: "Festive & Seasonal", options: festiveScents },
];

export const groupedColors = [
  { label: "Pink Shades", options: pinkColors },
  { label: "Blue Shades", options: blueColors },
  { label: "Green Shades", options: greenColors },
  { label: "Red Shades", options: redColors },
  { label: "Purple Shades", options: purpleColors },
  { label: "Yellow & Orange", options: yellowOrangeColors },
  { label: "Neutral & Earthy", options: neutralColors },
  { label: "Metallic & Special", options: specialColors },
];

// Helper functions
export const stringToArray = (str: string): string[] => {
  return str ? str.split(',').map(item => item.trim()).filter(Boolean) : [];
};

export const arrayToString = (arr: string[]): string => {
  return arr.filter(Boolean).join(', ');
};

// Color mapping for visual display
export const colorHexMap: Record<string, string> = {
  // Pink Shades
  "Pink": "#FFC0CB",
  "Light Pink": "#FFB6C1",
  "Baby Pink": "#F4C2C2",
  "Dark Pink": "#FF1493",
  "Hot Pink": "#FF69B4",
  "Rose Pink": "#FF66CC",
  "Peach": "#FFCBA4",

  // Blue Shades
  "Blue": "#0000FF",
  "Light Blue": "#ADD8E6",
  "Sky Blue": "#87CEEB",
  "Dark Blue": "#00008B",
  "Navy Blue": "#000080",
  "Royal Blue": "#4169E1",
  "Peacock Blue": "#005F69",

  // Green Shades
  "Green": "#008000",
  "Light Green": "#90EE90",
  "Mint Green": "#98FB98",
  "Dark Green": "#006400",
  "Emerald Green": "#50C878",
  "Olive Green": "#808000",

  // Red Shades
  "Red": "#FF0000",
  "Light Red": "#FF6B6B",
  "Dark Red": "#8B0000",
  "Crimson": "#DC143C",
  "Burgundy": "#800020",
  "Maroon": "#800000",

  // Purple Shades
  "Purple": "#800080",
  "Light Purple": "#DDA0DD",
  "Lavender": "#E6E6FA",
  "Lilac": "#C8A2C8",
  "Dark Purple": "#4B0082",
  "Violet": "#8A2BE2",

  // Yellow & Orange
  "Yellow": "#FFFF00",
  "Light Yellow": "#FFFFE0",
  "Lemon Yellow": "#FFFACD",
  "Golden Yellow": "#FFD700",
  "Orange": "#FFA500",
  "Light Orange": "#FFB84D",
  "Dark Orange": "#FF8C00",
  "Saffron": "#F4C430",
  "Marigold": "#EAA221",

  // Neutral & Earthy
  "White": "#FFFFFF",
  "Off White": "#FAF0E6",
  "Ivory": "#FFFFF0",
  "Cream": "#F5F5DC",
  "Brown": "#A52A2A",
  "Light Brown": "#D2B48C",
  "Dark Brown": "#654321",
  "Beige": "#F5F5DC",
  "Terracotta": "#E2725B",
  "Grey": "#808080",
  "Black": "#000000",

  // Metallic & Special
  "Gold": "#FFD700",
  "Silver": "#C0C0C0",
  "Rose Gold": "#E8B4B8",
  "Copper": "#B87333",
  "Bronze": "#CD7F32",
  "Glittered Gold": "#FFD700",
  "Glittered Silver": "#C0C0C0",
  "Multicolor Glitter": "linear-gradient(45deg, #ff0000, #00ff00, #0000ff)",
  "Ombre": "linear-gradient(45deg, #ff9a9e, #fecfef)",
  "Gradient": "linear-gradient(45deg, #a8edea, #fed6e3)",
  "Marble Effect": "#F8F8FF",
  "Transparent Gel": "rgba(255, 255, 255, 0.3)",
};
