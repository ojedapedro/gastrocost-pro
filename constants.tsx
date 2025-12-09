import React from 'react';
import { UnitType, Ingredient, PreRecipe, Dish, GlobalSettings } from './types';

export const INITIAL_SETTINGS: GlobalSettings = {
  hourlyLaborRate: 15.00, // $15/hr
  indirectCostPercentage: 25, // 25% overhead
  defaultMargin: 30, // 30% profit markup
  defaultTaxRate: 16, // 16% VAT/Tax
  currency: 'USD',
  costAlertThreshold: 10,
};

export const MOCK_INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    name: 'Harina de Trigo',
    category: 'Secos',
    purchaseUnit: 'Saco 25kg',
    standardUnit: UnitType.KG,
    conversionFactor: 25,
    wasteFactor: 0.02,
    currentStock: 50,
    minStock: 10,
    weightedAverageCost: 25.00, // Cost per Sack
    lastCost: 22.00 // Was cheaper before
  },
  {
    id: '2',
    name: 'Tomate Saladet',
    category: 'Frescos',
    purchaseUnit: 'Caja 10kg',
    standardUnit: UnitType.KG,
    conversionFactor: 10,
    wasteFactor: 0.15, // 15% waste
    currentStock: 5,
    minStock: 8, // Low stock!
    weightedAverageCost: 18.00,
    lastCost: 18.00
  },
  {
    id: '3',
    name: 'Carne Molida',
    category: 'Proteína',
    purchaseUnit: 'kg',
    standardUnit: UnitType.KG,
    conversionFactor: 1,
    wasteFactor: 0.05,
    currentStock: 12,
    minStock: 5,
    weightedAverageCost: 8.50,
    lastCost: 8.50
  }
];

export const MOCK_PRE_RECIPES: PreRecipe[] = [
  {
    id: 'p1',
    name: 'Salsa Pomodoro Base',
    unit: UnitType.L,
    yieldQuantity: 5, // Makes 5 Liters
    components: [
      { id: '2', type: 'ingredient', quantity: 6 } // Uses 6kg tomatoes (due to cooking reduction)
    ]
  }
];

export const MOCK_DISHES: Dish[] = [
  {
    id: 'd1',
    name: 'Pasta Boloñesa',
    category: 'Principal',
    preparationTimeMinutes: 15,
    components: [
      { id: '1', type: 'ingredient', quantity: 0.15 }, // 150g flour (if making pasta scratch)
      { id: '3', type: 'ingredient', quantity: 0.20 }, // 200g meat
      { id: 'p1', type: 'pre-recipe', quantity: 0.25 } // 250ml sauce
    ]
  }
];
