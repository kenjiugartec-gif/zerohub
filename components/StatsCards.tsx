
import React from 'react';
import { Container, YardEspacio, Movement } from '../types';
import { Package, TrendingUp, TrendingDown, LayoutGrid } from 'lucide-react';

interface StatsCardsProps {
  containers: Container[];
  espacios: YardEspacio[];
  movements: Movement[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ containers, espacios, movements }) => {
  const inStock = containers.filter(c => c.status === 'In').length;
  const capacity = espacios.length;
  const occupancyRate = capacity > 0 ? ((inStock / capacity) * 100).toFixed(1) : "0.0";
  const movementsToday = movements.filter(m => {
    const today = new Date().toISOString().split('T')[0];
    return m.timestamp.split('T')[0] === today;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="En Depósito" 
        value={inStock} 
        unit="unidades"
        icon={<Package className="text-blue-600" size={24} />}
        bgColor="bg-blue-50"
      />
      <StatCard 
        title="Ocupación" 
        value={`${occupancyRate}%`} 
        unit={`${inStock} / ${capacity} espacios`}
        icon={<LayoutGrid className="text-purple-600" size={24} />}
        bgColor="bg-purple-50"
      />
      <StatCard 
        title="Movimientos Hoy" 
        value={movementsToday} 
        unit="Gate-In / Out"
        icon={<TrendingUp className="text-green-600" size={24} />}
        bgColor="bg-green-50"
      />
      <StatCard 
        title="Promedio Estadía" 
        value="3.2" 
        unit="Días / Contenedor"
        icon={<TrendingDown className="text-amber-600" size={24} />}
        bgColor="bg-amber-50"
      />
    </div>
  );
};

const StatCard = ({ title, value, unit, icon, bgColor }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-800">{value}</h4>
      <p className="text-xs text-slate-500 mt-1">{unit}</p>
    </div>
    <div className={`p-3 rounded-xl ${bgColor}`}>
      {icon}
    </div>
  </div>
);

export default StatsCards;
