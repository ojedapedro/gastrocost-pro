import React, { useState } from 'react';
import { Ingredient, UnitType } from '../types';
import { X, Save, ShoppingCart } from 'lucide-react';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ing: Ingredient) => void;
  onPurchase: (ingId: string, qty: number, cost: number) => void;
  ingredient?: Ingredient; // If present, edit mode or purchase mode
}

const IngredientModal: React.FC<IngredientModalProps> = ({ isOpen, onClose, onSave, onPurchase, ingredient }) => {
  const [mode, setMode] = useState<'edit' | 'purchase'>('edit');
  const [formData, setFormData] = useState<Ingredient>(ingredient || {
    id: crypto.randomUUID(),
    name: '',
    category: '',
    purchaseUnit: '',
    standardUnit: UnitType.KG,
    conversionFactor: 1,
    wasteFactor: 0,
    currentStock: 0,
    minStock: 0,
    weightedAverageCost: 0,
    lastCost: 0
  });

  // Purchase form state
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [purchaseCost, setPurchaseCost] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit') {
      onSave(formData);
    } else if (ingredient) {
      onPurchase(ingredient.id, purchaseQty, purchaseCost);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div className="flex gap-4">
            <button 
              onClick={() => setMode('edit')}
              className={`text-sm font-semibold pb-1 border-b-2 ${mode === 'edit' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'}`}
            >
              {ingredient ? 'Editar Insumo' : 'Nuevo Insumo'}
            </button>
            {ingredient && (
              <button 
                onClick={() => setMode('purchase')}
                className={`text-sm font-semibold pb-1 border-b-2 ${mode === 'purchase' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'}`}
              >
                Registrar Compra
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'edit' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nombre</label>
                  <input required className="w-full border rounded-lg p-2 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Categoría</label>
                  <input required className="w-full border rounded-lg p-2 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Unidad Compra (UC)</label>
                  <input placeholder="Ej: Saco" required className="w-full border rounded-lg p-2 text-sm" value={formData.purchaseUnit} onChange={e => setFormData({...formData, purchaseUnit: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1">Unidad Estandar (UME)</label>
                   <select className="w-full border rounded-lg p-2 text-sm" value={formData.standardUnit} onChange={e => setFormData({...formData, standardUnit: e.target.value as UnitType})}>
                     {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Factor Conv. (UME por UC)</label>
                  <input type="number" step="0.01" required className="w-full border rounded-lg p-2 text-sm" value={formData.conversionFactor} onChange={e => setFormData({...formData, conversionFactor: parseFloat(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1">Merma (0-1)</label>
                   <input type="number" step="0.01" max="1" min="0" required className="w-full border rounded-lg p-2 text-sm" value={formData.wasteFactor} onChange={e => setFormData({...formData, wasteFactor: parseFloat(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1">Stock Mín (UME)</label>
                   <input type="number" required className="w-full border rounded-lg p-2 text-sm" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseFloat(e.target.value)})} />
                </div>
              </div>
              
              {!ingredient && (
                 <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Costo Inicial (Por UC)</label>
                    <input type="number" step="0.01" required className="w-full border rounded-lg p-2 text-sm" value={formData.weightedAverageCost} onChange={e => setFormData({...formData, weightedAverageCost: parseFloat(e.target.value)})} />
                 </div>
              )}
            </>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <h4 className="font-semibold text-blue-900 mb-2">Ingreso de Inventario</h4>
               <p className="text-sm text-blue-700 mb-4">Está registrando una compra para <strong>{formData.name}</strong>. Esto actualizará el Costo Promedio Ponderado.</p>
               
               <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1">Cantidad ({formData.purchaseUnit})</label>
                   <input type="number" min="0" required className="w-full border rounded-lg p-2 text-sm" value={purchaseQty} onChange={e => setPurchaseQty(parseFloat(e.target.value))} />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1">Costo Total Compra</label>
                   <input type="number" min="0" step="0.01" required className="w-full border rounded-lg p-2 text-sm" value={purchaseCost} onChange={e => setPurchaseCost(parseFloat(e.target.value))} />
                 </div>
                 <div className="text-right text-sm text-slate-500">
                   Nuevo Costo Unitario Estimado: {(purchaseCost / purchaseQty || 0).toFixed(2)} / {formData.purchaseUnit}
                 </div>
               </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg flex items-center gap-2">
              {mode === 'edit' ? <Save size={16} /> : <ShoppingCart size={16} />}
              {mode === 'edit' ? 'Guardar Cambios' : 'Registrar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientModal;
