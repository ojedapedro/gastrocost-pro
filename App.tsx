import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ChefHat, 
  UtensilsCrossed, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Search,
  FileText,
  Trash2,
  X,
  Eye
} from 'lucide-react';
import { 
  Ingredient, 
  PreRecipe, 
  Dish, 
  GlobalSettings, 
  UnitType, 
  RecipeComponent 
} from './types';
import { 
  INITIAL_SETTINGS, 
  MOCK_INGREDIENTS, 
  MOCK_PRE_RECIPES, 
  MOCK_DISHES 
} from './constants';
import { 
  calculateCUE, 
  calculateDishPricing, 
  formatCurrency, 
  calculatePreRecipeUnitCost,
  getComponentCost
} from './utils/calculations';
import IngredientModal from './components/IngredientModal';
import CostCard from './components/CostCard';

// ----- SUB-COMPONENTS (Simplified for Single App file flow) -----

const Header = ({ title }: { title: string }) => (
  <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 no-print">
    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
    <div className="flex items-center gap-4">
      <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">v1.0.0</div>
    </div>
  </header>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

interface DishDetailModalProps {
  dish: Dish;
  ingredients: Ingredient[];
  preRecipes: PreRecipe[];
  settings: GlobalSettings;
  onClose: () => void;
}

const DishDetailModal: React.FC<DishDetailModalProps> = ({ dish, ingredients, preRecipes, settings, onClose }) => {
  const pricing = calculateDishPricing(dish, ingredients, preRecipes, settings);
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0 print:z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-2xl print:bg-white print:border-b-2 print:border-black">
           <div>
             <h2 className="text-2xl font-bold text-slate-900">{dish.name}</h2>
             <span className="text-slate-500 text-sm print:text-black">{dish.category} &bull; {dish.preparationTimeMinutes} min prep</span>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors print:hidden">
             <X size={24} className="text-slate-500" />
           </button>
        </div>

        <div className="p-8 space-y-8">
           {/* Ingredients Table */}
           <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UtensilsCrossed size={20} className="text-brand-500 print:text-black"/> Desglose de Receta
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden print:border-black">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 print:bg-slate-100 print:text-black print:border-black">
                    <tr>
                      <th className="px-4 py-3 text-left">Componente</th>
                      <th className="px-4 py-3 text-center">Tipo</th>
                      <th className="px-4 py-3 text-right">Cantidad</th>
                      <th className="px-4 py-3 text-right">Costo Unitario</th>
                      <th className="px-4 py-3 text-right">Costo Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                    {dish.components.map((comp, idx) => {
                      const isIng = comp.type === 'ingredient';
                      const item = isIng 
                        ? ingredients.find(i => i.id === comp.id)
                        : preRecipes.find(p => p.id === comp.id);
                      
                      const unitCost = isIng 
                        ? calculateCUE(item as Ingredient)
                        : calculatePreRecipeUnitCost(item as PreRecipe, ingredients, preRecipes);
                        
                      const totalCost = getComponentCost(comp, ingredients, preRecipes);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-700 print:text-black">{item?.name || 'Desconocido'}</td>
                          <td className="px-4 py-3 text-center print:text-black">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${isIng ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} print:border print:border-black print:bg-white print:text-black`}>
                              {isIng ? 'Insumo' : 'Pre-Receta'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 print:text-black">
                             {comp.quantity} {isIng ? (item as Ingredient)?.standardUnit : (item as PreRecipe)?.unit}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500 print:text-black">
                             {formatCurrency(unitCost, settings.currency)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 print:text-black">
                             {formatCurrency(totalCost, settings.currency)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold text-slate-800 print:bg-white print:border-t-2 print:border-black">
                      <td colSpan={4} className="px-4 py-3 text-right">Total Ingredientes (CNI)</td>
                      <td className="px-4 py-3 text-right text-blue-600 print:text-black">{formatCurrency(pricing.cni, settings.currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>

           {/* Cost Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
              <div className="space-y-4">
                 <h3 className="text-lg font-bold text-slate-800 mb-4">Estructura de Costos</h3>
                 
                 <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <span className="text-slate-600 print:text-black">Materia Prima (CNI)</span>
                    <span className="font-semibold print:text-black">{formatCurrency(pricing.cni, settings.currency)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-slate-600 print:text-black">Mano de Obra (CMO)</span>
                       <span className="text-xs text-slate-400 print:text-gray-600">{dish.preparationTimeMinutes} min @ {formatCurrency(settings.hourlyLaborRate, settings.currency)}/hr</span>
                    </div>
                    <span className="font-semibold print:text-black">{formatCurrency(pricing.cmo, settings.currency)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-slate-600 print:text-black">Costos Indirectos (COI)</span>
                       <span className="text-xs text-slate-400 print:text-gray-600">{settings.indirectCostPercentage}% del CNI</span>
                    </div>
                    <span className="font-semibold print:text-black">{formatCurrency(pricing.coi, settings.currency)}</span>
                 </div>
                 
                 <div className="flex justify-between items-center p-4 bg-slate-100 rounded-xl mt-2 print:bg-white print:border print:border-black">
                    <span className="font-bold text-slate-800 print:text-black">Costo Total Producción</span>
                    <span className="font-bold text-xl text-slate-900 print:text-black">{formatCurrency(pricing.baseCost, settings.currency)}</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-lg font-bold text-slate-800 mb-4">Rentabilidad y Precio</h3>
                 
                 <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 print:bg-white print:text-black print:border print:border-black">
                    <div className="flex justify-between items-center opacity-80 print:opacity-100">
                       <span>Costo Base</span>
                       <span>{formatCurrency(pricing.baseCost, settings.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-80 print:opacity-100">
                       <span>Margen Ganancia ({settings.defaultMargin}%)</span>
                       <span>{formatCurrency(pricing.finalPrice - pricing.baseCost - (pricing.finalPrice * settings.defaultTaxRate/100), settings.currency)}</span>
                    </div>
                     <div className="flex justify-between items-center opacity-80 print:opacity-100">
                       <span>Impuesto ({settings.defaultTaxRate}%)</span>
                       <span>{formatCurrency(pricing.finalPrice * (settings.defaultTaxRate/100), settings.currency)}</span>
                    </div>
                    <div className="h-px bg-white/20 my-2 print:bg-black"></div>
                    <div className="flex justify-between items-end">
                       <span className="font-bold text-lg">Precio Sugerido</span>
                       <span className="font-bold text-3xl text-brand-400 print:text-black">{formatCurrency(pricing.finalPrice, settings.currency)}</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 print:hidden">
                   <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <span className="text-xs text-green-600 font-bold uppercase block mb-1">Rentabilidad Real</span>
                      <span className="text-xl font-bold text-green-700">
                        { pricing.finalPrice > 0 
                          ? (( (pricing.finalPrice / (1 + settings.defaultTaxRate/100)) - pricing.baseCost ) / (pricing.finalPrice / (1 + settings.defaultTaxRate/100)) * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                   </div>
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <span className="text-xs text-blue-600 font-bold uppercase block mb-1">Costo % (Food Cost)</span>
                      <span className="text-xl font-bold text-blue-700">
                        { pricing.finalPrice > 0
                          ? ((pricing.cni / (pricing.finalPrice / (1 + settings.defaultTaxRate/100))) * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                   </div>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 print:hidden">
           <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-100">
             Cerrar
           </button>
           <button onClick={() => window.print()} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 flex items-center gap-2">
             <FileText size={18}/> Imprimir Reporte
           </button>
        </div>
      </div>
    </div>
  );
}

// ----- MAIN APP -----

const App = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ingredients' | 'prerecipes' | 'menu' | 'settings'>('dashboard');
  
  // Application State
  const [ingredients, setIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS);
  const [preRecipes, setPreRecipes] = useState<PreRecipe[]>(MOCK_PRE_RECIPES);
  const [dishes, setDishes] = useState<Dish[]>(MOCK_DISHES);
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);
  
  // UI State
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Actions ---

  const handleSaveIngredient = (newIng: Ingredient) => {
    if (ingredients.find(i => i.id === newIng.id)) {
      setIngredients(ingredients.map(i => i.id === newIng.id ? newIng : i));
    } else {
      setIngredients([...ingredients, newIng]);
    }
  };

  const handlePurchase = (id: string, qty: number, cost: number) => {
    const ing = ingredients.find(i => i.id === id);
    if (!ing) return;

    // Weighted Average Calculation
    const oldTotalValue = ing.currentStock * (ing.weightedAverageCost / ing.conversionFactor); // Approx value in stock
    // Wait - WAC is stored per PURCHASE UNIT.
    // Stock is stored in STANDARD UNIT.
    // Let's standardise value to Total Money invested.
    // Current Inventory Value = (Stock / Conversion) * WAC
    const currentInventoryInPurchaseUnits = ing.currentStock / ing.conversionFactor;
    const currentTotalValue = currentInventoryInPurchaseUnits * ing.weightedAverageCost;
    
    const newTotalValue = currentTotalValue + cost;
    const newTotalStockPurchaseUnits = currentInventoryInPurchaseUnits + qty;
    
    // New WAC per Purchase Unit
    const newWAC = newTotalValue / newTotalStockPurchaseUnits;
    
    // Update Ingredient
    const updatedIng: Ingredient = {
      ...ing,
      currentStock: ing.currentStock + (qty * ing.conversionFactor),
      weightedAverageCost: newWAC,
      lastCost: ing.weightedAverageCost // Store previous for alert
    };

    setIngredients(ingredients.map(i => i.id === id ? updatedIng : i));
  };

  const deleteIngredient = (id: string) => {
    if(confirm('¿Estás seguro de eliminar este insumo?')) {
        setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  // --- Derived Data for Dashboard ---
  const lowStockItems = ingredients.filter(i => i.currentStock <= i.minStock);
  const costAlerts = ingredients.filter(i => {
    if (i.lastCost === 0) return false;
    const increase = ((i.weightedAverageCost - i.lastCost) / i.lastCost) * 100;
    return increase >= settings.costAlertThreshold;
  });

  // --- Views Renders ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Alertas de Stock</p>
            <p className="text-2xl font-bold text-slate-900">{lowStockItems.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Incrementos Costo</p>
            <p className="text-2xl font-bold text-slate-900">{costAlerts.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><UtensilsCrossed size={24} /></div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Platos Activos</p>
            <p className="text-2xl font-bold text-slate-900">{dishes.length}</p>
          </div>
        </div>
      </div>

      {(lowStockItems.length > 0 || costAlerts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {lowStockItems.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
               <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
                 <AlertTriangle size={16} className="text-red-600" />
                 <h3 className="font-semibold text-red-800 text-sm">Stock Crítico</h3>
               </div>
               <div className="p-0">
                 {lowStockItems.map(i => (
                   <div key={i.id} className="flex justify-between items-center px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50">
                     <span className="font-medium text-slate-700">{i.name}</span>
                     <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">{i.currentStock.toFixed(2)} {i.standardUnit}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}
           {costAlerts.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
               <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center gap-2">
                 <TrendingUp size={16} className="text-amber-600" />
                 <h3 className="font-semibold text-amber-800 text-sm">Variación de Costos (+{settings.costAlertThreshold}%)</h3>
               </div>
               <div className="p-0">
                 {costAlerts.map(i => {
                   const pct = ((i.weightedAverageCost - i.lastCost) / i.lastCost) * 100;
                   return (
                    <div key={i.id} className="flex justify-between items-center px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <span className="font-medium text-slate-700">{i.name}</span>
                      <div className="text-right">
                         <span className="block text-xs font-bold text-amber-600">+{pct.toFixed(1)}%</span>
                         <span className="block text-[10px] text-slate-400">Ahora: {formatCurrency(i.weightedAverageCost, settings.currency)}</span>
                      </div>
                    </div>
                   )
                 })}
               </div>
             </div>
           )}
        </div>
      )}
    </div>
  );

  const renderIngredients = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar insumo..." 
            className="pl-10 pr-4 py-2 border rounded-xl text-sm w-64 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingIngredient(undefined); setIsIngredientModalOpen(true); }}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo Insumo
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Insumo</th>
              <th className="px-6 py-4 text-center">Unidad Compra</th>
              <th className="px-6 py-4 text-center">Merma</th>
              <th className="px-6 py-4 text-right">Costo UC</th>
              <th className="px-6 py-4 text-right font-bold text-brand-600">Costo UME (Real)</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ingredients.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(ing => (
              <tr key={ing.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{ing.name} <span className="text-xs text-slate-400 font-normal block">{ing.category}</span></td>
                <td className="px-6 py-4 text-center text-slate-500">{ing.purchaseUnit}</td>
                <td className="px-6 py-4 text-center text-slate-500">{(ing.wasteFactor * 100).toFixed(0)}%</td>
                <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(ing.weightedAverageCost, settings.currency)}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800 bg-blue-50/50">
                  {formatCurrency(calculateCUE(ing), settings.currency)} / {ing.standardUnit}
                </td>
                <td className="px-6 py-4 text-center">
                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${ing.currentStock <= ing.minStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                     {ing.currentStock.toFixed(1)} {ing.standardUnit}
                   </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => { setEditingIngredient(ing); setIsIngredientModalOpen(true); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500">
                    <Settings size={16} />
                  </button>
                  <button onClick={() => deleteIngredient(ing.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Simple builder component for Menu and Pre-Recipes
  const RecipeEditor = ({ 
    initialName, 
    initialComponents,
    onSave,
    type 
  }: { 
    initialName?: string, 
    initialComponents?: RecipeComponent[],
    onSave: (name: string, comps: RecipeComponent[], extra: any) => void,
    type: 'dish' | 'pre-recipe'
  }) => {
    const [name, setName] = useState(initialName || '');
    const [comps, setComps] = useState<RecipeComponent[]>(initialComponents || []);
    const [yieldQty, setYieldQty] = useState(1);
    const [prepTime, setPrepTime] = useState(15);
    const [unit, setUnit] = useState<UnitType>(UnitType.KG);

    // Temp state for adding row
    const [selId, setSelId] = useState('');
    const [selType, setSelType] = useState<'ingredient' | 'pre-recipe'>('ingredient');
    const [selQty, setSelQty] = useState(1);

    const addComponent = () => {
      if (!selId) return;
      setComps([...comps, { id: selId, type: selType, quantity: selQty }]);
      setSelId('');
      setSelQty(1);
    };

    const removeComponent = (idx: number) => {
       const n = [...comps];
       n.splice(idx, 1);
       setComps(n);
    };

    // Calculate live cost
    const tempDish: Dish = { 
        id: 'temp', name, category: '', preparationTimeMinutes: prepTime, components: comps 
    };
    const cost = calculateDishPricing(tempDish, ingredients, preRecipes, settings);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la {type === 'dish' ? 'Receta' : 'Pre-Receta'}</label>
                <input className="w-full border rounded-lg p-2" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Salsa Especial..." />
              </div>
              
              {type === 'dish' ? (
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Tiempo Preparación (Minutos)</label>
                   <input type="number" className="w-full border rounded-lg p-2" value={prepTime} onChange={e => setPrepTime(parseFloat(e.target.value))} />
                 </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Rendimiento (Cantidad)</label>
                     <input type="number" className="w-full border rounded-lg p-2" value={yieldQty} onChange={e => setYieldQty(parseFloat(e.target.value))} />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Unidad Resultante</label>
                     <select className="w-full border rounded-lg p-2" value={unit} onChange={e => setUnit(e.target.value as UnitType)}>
                        {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                     </select>
                   </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Agregar Componentes</h4>
                <div className="flex gap-2 mb-2">
                  <select className="border rounded-lg p-2 text-sm w-24" value={selType} onChange={e => setSelType(e.target.value as any)}>
                    <option value="ingredient">Insumo</option>
                    {type === 'dish' && <option value="pre-recipe">Pre-Receta</option>}
                  </select>
                  <select className="border rounded-lg p-2 text-sm flex-1" value={selId} onChange={e => setSelId(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {selType === 'ingredient' 
                      ? ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)
                      : preRecipes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                    }
                  </select>
                  <input type="number" step="0.001" className="border rounded-lg p-2 text-sm w-20" placeholder="Cant." value={selQty} onChange={e => setSelQty(parseFloat(e.target.value))} />
                  <button onClick={addComponent} className="bg-brand-600 text-white rounded-lg px-3 hover:bg-brand-700"><Plus size={16} /></button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto mt-4">
                  {comps.map((c, idx) => {
                     const itemName = c.type === 'ingredient' 
                        ? ingredients.find(i => i.id === c.id)?.name 
                        : preRecipes.find(p => p.id === c.id)?.name;
                     return (
                        <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white border rounded">
                           <span>{c.quantity} x {itemName}</span>
                           <button onClick={() => removeComponent(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                        </div>
                     )
                  })}
                  {comps.length === 0 && <p className="text-center text-slate-400 text-xs py-2">Sin ingredientes</p>}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
                <CostCard cost={cost} settings={settings} />
                
                <button 
                  disabled={!name || comps.length === 0}
                  onClick={() => onSave(name, comps, { yieldQty, unit, prepTime })}
                  className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Guardar {type === 'dish' ? 'Plato' : 'Pre-Receta'}
                </button>
            </div>
         </div>
      </div>
    );
  }

  // Wrapper for menu view to handle list vs editor
  const MenuManager = () => {
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    if (viewMode === 'create') {
       return (
         <div>
            <button onClick={() => setViewMode('list')} className="mb-4 text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1">← Volver al Menú</button>
            <RecipeEditor 
               type="dish" 
               onSave={(name, comps, extra) => {
                  const newDish: Dish = {
                    id: crypto.randomUUID(),
                    name, 
                    components: comps,
                    preparationTimeMinutes: extra.prepTime,
                    category: 'General'
                  };
                  setDishes([...dishes, newDish]);
                  setViewMode('list');
               }} 
            />
         </div>
       )
    }

    return (
      <div className="space-y-6">
         {selectedDish && (
            <DishDetailModal 
              dish={selectedDish} 
              ingredients={ingredients} 
              preRecipes={preRecipes} 
              settings={settings}
              onClose={() => setSelectedDish(null)}
            />
         )}

         <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-800">Menú Actual</h2>
             <button onClick={() => setViewMode('create')} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
               <Plus size={18} /> Crear Plato
             </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map(dish => {
              const cost = calculateDishPricing(dish, ingredients, preRecipes, settings);
              return (
                <div key={dish.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{dish.name}</h3>
                        <span className="text-xs text-slate-400">{dish.components.length} ingredientes</span>
                      </div>
                      <div className="bg-slate-100 text-slate-600 p-2 rounded-lg">
                        <FileText size={18} />
                      </div>
                   </div>
                   
                   <div className="space-y-2 border-t border-slate-100 pt-3 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Costo Base</span>
                        <span className="font-medium">{formatCurrency(cost.baseCost, settings.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Margen {settings.defaultMargin}%</span>
                        <span className="text-green-600 font-medium">{formatCurrency(cost.finalPrice - cost.baseCost - (cost.finalPrice * (settings.defaultTaxRate/100)), settings.currency)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-slate-200">
                        <span className="font-bold text-slate-700">Precio Venta</span>
                        <span className="font-bold text-xl text-brand-600">{formatCurrency(cost.finalPrice, settings.currency)}</span>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => setSelectedDish(dish)}
                     className="w-full mt-4 py-2 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-sm font-medium hover:bg-brand-100 flex items-center justify-center gap-2"
                   >
                     <Eye size={16} /> Ver Detalles / Imprimir
                   </button>
                </div>
              )
            })}
         </div>
      </div>
    );
  }

  const PreRecipeManager = () => {
    // Similar simplified logic for PreRecipes...
    // For brevity in this exercise, I'll allow creation via the RecipeEditor but customized.
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    
    if (viewMode === 'create') {
        return (
          <div>
             <button onClick={() => setViewMode('list')} className="mb-4 text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1">← Volver</button>
             <RecipeEditor 
                type="pre-recipe" 
                onSave={(name, comps, extra) => {
                   const newPre: PreRecipe = {
                     id: crypto.randomUUID(),
                     name,
                     components: comps,
                     yieldQuantity: extra.yieldQty,
                     unit: extra.unit
                   };
                   setPreRecipes([...preRecipes, newPre]);
                   setViewMode('list');
                }} 
             />
          </div>
        )
     }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Preparaciones Intermedias</h2>
                <button onClick={() => setViewMode('create')} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Plus size={18} /> Nueva Pre-Receta
                </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Rendimiento</th>
                            <th className="px-6 py-4 text-right">Costo Total Lote</th>
                            <th className="px-6 py-4 text-right font-bold text-brand-600">Costo Unitario (CUPR)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {preRecipes.map(pre => {
                            const unitCost = calculatePreRecipeUnitCost(pre, ingredients, preRecipes);
                            return (
                                <tr key={pre.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">{pre.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{pre.yieldQuantity} {pre.unit}</td>
                                    <td className="px-6 py-4 text-right text-slate-500">{formatCurrency(unitCost * pre.yieldQuantity, settings.currency)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(unitCost, settings.currency)} / {pre.unit}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
  }

  const SettingsView = () => (
      <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings className="text-slate-400" /> Configuración Global
          </h2>
          <div className="grid grid-cols-1 gap-6">
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tasa Mano Obra ($/hr)</label>
                    <input type="number" className="w-full border rounded-lg p-2" value={settings.hourlyLaborRate} onChange={e => setSettings({...settings, hourlyLaborRate: parseFloat(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Costos Indirectos (%)</label>
                    <input type="number" className="w-full border rounded-lg p-2" value={settings.indirectCostPercentage} onChange={e => setSettings({...settings, indirectCostPercentage: parseFloat(e.target.value)})} />
                 </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Margen Ganancia (%)</label>
                    <input type="number" className="w-full border rounded-lg p-2" value={settings.defaultMargin} onChange={e => setSettings({...settings, defaultMargin: parseFloat(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Impuesto Venta (%)</label>
                    <input type="number" className="w-full border rounded-lg p-2" value={settings.defaultTaxRate} onChange={e => setSettings({...settings, defaultTaxRate: parseFloat(e.target.value)})} />
                 </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Moneda</label>
                <select className="w-full border rounded-lg p-2" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})}>
                    <option value="USD">USD ($)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="EUR">EUR (€)</option>
                </select>
             </div>
             <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                Los cambios en estos valores actualizarán automáticamente el cálculo de precios de todos los platos del menú.
             </div>
          </div>
      </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-4 print:hidden">
        <div className="flex items-center gap-3 px-4 mb-10 mt-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
          <span className="font-bold text-xl text-slate-800">GastroCost</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={ChefHat} label="Insumos & Stock" active={currentView === 'ingredients'} onClick={() => setCurrentView('ingredients')} />
          <SidebarItem icon={TrendingUp} label="Pre-Recetas" active={currentView === 'prerecipes'} onClick={() => setCurrentView('prerecipes')} />
          <SidebarItem icon={UtensilsCrossed} label="Menú / Costeo" active={currentView === 'menu'} onClick={() => setCurrentView('menu')} />
          <SidebarItem icon={Settings} label="Configuración" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:block">
        <Header title={
          currentView === 'dashboard' ? 'Panel de Control' :
          currentView === 'ingredients' ? 'Gestión de Insumos' :
          currentView === 'prerecipes' ? 'Preparaciones Intermedias' :
          currentView === 'menu' ? 'Ingeniería de Menú' : 'Configuración'
        } />
        
        <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'ingredients' && renderIngredients()}
          {currentView === 'menu' && <MenuManager />}
          {currentView === 'prerecipes' && <PreRecipeManager />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Modals */}
      <IngredientModal 
        isOpen={isIngredientModalOpen} 
        onClose={() => setIsIngredientModalOpen(false)}
        onSave={handleSaveIngredient}
        onPurchase={handlePurchase}
        ingredient={editingIngredient}
      />
    </div>
  );
};

export default App;