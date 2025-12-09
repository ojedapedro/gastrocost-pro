export enum UnitType {
  KG = 'kg',
  GR = 'gr',
  L = 'L',
  ML = 'ml',
  UNIT = 'un',
  LB = 'lb',
  OZ = 'oz'
}

// Level 1: Ingredients
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  purchaseUnit: string; // e.g., "Sack"
  standardUnit: UnitType; // e.g., "kg"
  conversionFactor: number; // How many Standard Units in one Purchase Unit?
  wasteFactor: number; // 0 to 1 (e.g., 0.1 for 10%)
  currentStock: number; // In Standard Units
  minStock: number; // In Standard Units
  
  // Costing
  weightedAverageCost: number; // Cost per Purchase Unit
  lastCost: number; // For alert comparison
}

export interface PurchaseLog {
  id: string;
  ingredientId: string;
  date: string;
  quantity: number; // In Purchase Units
  totalCost: number;
  supplier: string;
}

// Level 2: Pre-Recipes
export interface RecipeComponent {
  id: string; // Ingredient ID or PreRecipe ID
  type: 'ingredient' | 'pre-recipe';
  quantity: number; // In Standard Unit of the component
}

export interface PreRecipe {
  id: string;
  name: string;
  unit: UnitType;
  yieldQuantity: number; // Total output amount
  components: RecipeComponent[];
}

// Level 3: Final Dishes (Menu Items)
export interface Dish {
  id: string;
  name: string;
  category: string;
  components: RecipeComponent[];
  preparationTimeMinutes: number;
  
  // Pricing Overrides (Optional, otherwise use global)
  targetMargin?: number;
  taxRate?: number;
}

// Configuration
export interface GlobalSettings {
  hourlyLaborRate: number;
  indirectCostPercentage: number; // COI
  defaultMargin: number; // MGD
  defaultTaxRate: number; // ISV
  currency: string;
  costAlertThreshold: number; // Percentage (e.g., 10)
}

export interface CalculatedCost {
  cni: number; // Costo Neto Ingredientes
  cmo: number; // Mano de Obra
  coi: number; // Costos Indirectos
  baseCost: number; // Sum of above
  suggestedPrice: number; // Before Tax
  finalPrice: number; // PFC (With Tax)
}
