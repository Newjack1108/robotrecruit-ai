/**
 * Ingredient Parser Utility
 * Detects and extracts ingredients from Chef Bot responses
 */

/**
 * Detects if a message contains ingredients
 * Returns array of ingredients or null if none detected
 */
export function detectIngredients(text: string): string[] | null {
  // Convert to lowercase for pattern matching
  const lowerText = text.toLowerCase();
  
  // Keywords that indicate ingredients section
  const ingredientKeywords = [
    'ingredients:',
    'you\'ll need:',
    'you will need:',
    'shopping list:',
    'here\'s what you need:',
    'for this recipe',
    'materials needed:'
  ];
  
  // Check if text contains ingredient keywords
  const hasKeyword = ingredientKeywords.some(keyword => lowerText.includes(keyword));
  
  if (!hasKeyword) {
    return null;
  }
  
  // Extract ingredients using various patterns
  const ingredients = parseIngredientList(text);
  
  return ingredients.length > 0 ? ingredients : null;
}

/**
 * Parses ingredient list from text using multiple patterns
 */
export function parseIngredientList(text: string): string[] {
  const ingredients: string[] = [];
  
  // Split into lines
  const lines = text.split('\n');
  
  let inIngredientSection = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Check if we're entering ingredient section
    const lowerLine = trimmedLine.toLowerCase();
    if (
      lowerLine.includes('ingredients:') ||
      lowerLine.includes('you\'ll need:') ||
      lowerLine.includes('shopping list:')
    ) {
      inIngredientSection = true;
      continue;
    }
    
    // Check if we're leaving ingredient section (instructions, steps, etc.)
    if (
      lowerLine.includes('instructions:') ||
      lowerLine.includes('directions:') ||
      lowerLine.includes('steps:') ||
      lowerLine.includes('method:')
    ) {
      inIngredientSection = false;
      break;
    }
    
    // Extract ingredients if in section
    if (inIngredientSection) {
      // Pattern 1: Numbered list (1. 2 cups flour)
      const numberedMatch = trimmedLine.match(/^\d+\.\s*(.+)$/);
      if (numberedMatch) {
        ingredients.push(normalizeIngredient(numberedMatch[1]));
        continue;
      }
      
      // Pattern 2: Bullet points (• 2 cups flour or - 2 cups flour)
      const bulletMatch = trimmedLine.match(/^[•\-*]\s*(.+)$/);
      if (bulletMatch) {
        ingredients.push(normalizeIngredient(bulletMatch[1]));
        continue;
      }
      
      // Pattern 3: Ingredient with quantity at start (2 cups flour)
      const quantityMatch = trimmedLine.match(/^\d+[\s\/\d]*\s*(cups?|tablespoons?|teaspoons?|tbsp|tsp|oz|ounces?|lbs?|pounds?|grams?|g|ml|l|liters?|cloves?|pieces?|whole|large|medium|small)?\s*(.+)$/i);
      if (quantityMatch) {
        ingredients.push(normalizeIngredient(trimmedLine));
        continue;
      }
    }
  }
  
  // If no structured list found, try to detect ingredients from complete sentences
  if (ingredients.length === 0) {
    const commaListMatch = text.match(/(?:ingredients?|need|require)(?:\s+are|\s+include)?:?\s*([^.!?]+)/i);
    if (commaListMatch) {
      const items = commaListMatch[1].split(/,\s*(?:and\s+)?/);
      items.forEach(item => {
        const cleaned = item.trim();
        if (cleaned && cleaned.length > 2) {
          ingredients.push(normalizeIngredient(cleaned));
        }
      });
    }
  }
  
  return ingredients;
}

/**
 * Normalizes an ingredient string (trim, clean up formatting)
 */
export function normalizeIngredient(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/^\*+|\*+$/g, '') // Remove asterisks
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .trim();
}

/**
 * Checks if text likely contains a recipe or ingredient list
 */
export function looksLikeRecipe(text: string): boolean {
  const lowerText = text.toLowerCase();
  const recipeIndicators = [
    'recipe',
    'ingredients',
    'cook',
    'bake',
    'prepare',
    'serve',
    'mix',
    'cups',
    'tablespoons',
    'oven',
    'pan'
  ];
  
  let matches = 0;
  for (const indicator of recipeIndicators) {
    if (lowerText.includes(indicator)) {
      matches++;
    }
  }
  
  return matches >= 3;
}

