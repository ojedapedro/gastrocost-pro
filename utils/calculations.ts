import { Ingredient, PreRecipe, Dish, GlobalSettings, CalculatedCost, RecipeComponent } from '../types';

/**
 * Level 1: Calculate Standard Unit Cost (CUE)
 * CUE = CPP / (Conversion * (1 - FM))
 * Note: weightedAverageCost is per Purchase Unit.
 */
export const calculateCUE = (ingredient: Ingredient): number => {
  if (ingredient.conversionFactor === 0) return 0;
  const usableFactor = 1 - ingredient.wasteFactor;
  if (usableFactor <= 0) return 999999; // Error safety

  // Cost per standard unit considering waste
  return ingredient.weightedAverageCost / (ingredient.conversionFactor * usableFactor);
};

/**
 * Helper to get cost of a component (Ingredient or PreRecipe)
 */
export const getComponentCost = (
  comp: RecipeComponent, 
  ingredients: Ingredient[], 
  preRecipes: PreRecipe[]
): number => {
  if (comp.type === 'ingredient') {
    const ing = ingredients.find(i => i.id === comp.id);
    if (!ing) return 0;
    const cue = calculateCUE(ing);
    return cue * comp.quantity;
  } else {
    const pre = preRecipes.find(p => p.id === comp.id);
    if (!pre) return 0;
    const cup = calculatePreRecipeUnitCost(pre, ingredients, preRecipes);
    return cup * comp.quantity;
  }
};

/**
 * Level 2: Calculate Pre-Recipe Unit Cost (CUPR)
 */
export const calculatePreRecipeUnitCost = (
  preRecipe: PreRecipe,
  ingredients: Ingredient[],
  preRecipes: PreRecipe[] // recursive need
): number => {
  if (preRecipe.yieldQuantity === 0) return 0;

  let totalCost = 0;
  // Guard against circular dependency in real app (simplified here)
  preRecipe.components.forEach(comp => {
    totalCost += getComponentCost(comp, ingredients, preRecipes);
  });

  return totalCost / preRecipe.yieldQuantity;
};

/**
 * Level 3: Calculate Dish Pricing
 */
export const calculateDishPricing = (
  dish: Dish,
  ingredients: Ingredient[],
  preRecipes: PreRecipe[],
  settings: GlobalSettings
): CalculatedCost => {
  // 1. CNI (Costo Neto Ingredientes)
  let cni = 0;
  dish.components.forEach(comp => {
    cni += getComponentCost(comp, ingredients, preRecipes);
  });

  // 2. CMO (Costo Mano de Obra)
  // Rate is per hour, prep time is minutes
  const cmo = (settings.hourlyLaborRate / 60) * dish.preparationTimeMinutes;

  // 3. COI (Costos Indirectos)
  const coi = cni * (settings.indirectCostPercentage / 100);

  // Costo Total Producción
  const baseCost = cni + cmo + coi;

  // 4. MGD (Margen) & ISV (Impuesto)
  const margin = dish.targetMargin ?? settings.defaultMargin;
  const tax = dish.taxRate ?? settings.defaultTaxRate;

  // Formula: PFC = ((CNI + CMO + COI) * (1 + MGD)) / (1 - ISV)
  // Note: MGD is typically a markup on cost in this specific user formula context
  // User Formula: PFC = (CTP * (1 + MGD)) / (1 - ISV)
  
  // MGD input as percentage (e.g., 30 for 30%)
  const marginMultiplier = 1 + (margin / 100);
  
  // ISV input as percentage (e.g., 16 for 16%)
  // Denominator safety
  const taxDivisor = 1 - (tax / 100);
  
  const finalPrice = taxDivisor > 0 
    ? (baseCost * marginMultiplier) / taxDivisor 
    : 0;
  
  // Backwards calc for suggested price (Pre-tax) if needed, 
  // but strictly following PFC formula gives the final shelf price.
  const suggestedPrice = finalPrice * (1 - (tax/100)); // Rough estimate of pre-tax price

  return {
    cni,
    cmo,
    coi,
    baseCost,
    suggestedPrice,
    finalPrice
  };
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency }).format(amount);
};