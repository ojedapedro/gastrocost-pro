import React from 'react';
import { CalculatedCost, GlobalSettings } from '../types';
import { formatCurrency } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CostCardProps {
  cost: CalculatedCost;
  settings: GlobalSettings;
}

const CostCard: React.FC<CostCardProps> = ({ cost, settings }) => {
  const data = [
    { name: 'Ingredientes (CNI)', value: cost.cni, color: '#3b82f6' },
    { name: 'Mano de Obra (CMO)', value: cost.cmo, color: '#f59e0b' },
    { name: 'Indirectos (COI)', value: cost.coi, color: '#10b981' },
    { name: 'Margen', value: cost.finalPrice - cost.baseCost - (cost.finalPrice * (settings.defaultTaxRate / 100)), color: '#8b5cf6' } // Simplified visual margin
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Análisis de Precio</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">CNI (Ingredientes)</span>
            <span className="font-bold text-slate-800">{formatCurrency(cost.cni, settings.currency)}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">CMO (Mano de Obra)</span>
            <span className="font-bold text-slate-800">{formatCurrency(cost.cmo, settings.currency)}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">COI (Indirectos)</span>
            <span className="font-bold text-slate-800">{formatCurrency(cost.coi, settings.currency)}</span>
          </div>
          
          <div className="border-t border-slate-200 my-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Costo Base</span>
              <span className="font-bold text-slate-900">{formatCurrency(cost.baseCost, settings.currency)}</span>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-xl mt-4">
             <div className="flex justify-between items-end mb-1">
                <span className="text-sm text-slate-400">Precio Sugerido (PFC)</span>
                <span className="text-2xl font-bold">{formatCurrency(cost.finalPrice, settings.currency)}</span>
             </div>
             <div className="text-xs text-slate-400 text-right">Incluye {settings.defaultTaxRate}% ISV</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value, settings.currency)} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CostCard;
