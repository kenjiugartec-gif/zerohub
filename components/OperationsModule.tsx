
import React, { useState } from 'react';
import { Container } from '../types';
import { 
  Briefcase, 
  Layers, 
  Search, 
  Package, 
  ArrowUpDown, 
  FileSpreadsheet, 
  Download,
  Clock,
  Calendar,
  MapPin,
  Scale
} from 'lucide-react';

interface OperationsModuleProps {
  containers: Container[];
}

const OperationsModule: React.FC<OperationsModuleProps> = ({ containers }) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'other'>('storage');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para calcular los días de estadía (incluyendo el día de hoy como día 1)
  const calculateDays = (entryDateString: string) => {
    const entry = new Date(entryDateString);
    const now = new Date();
    
    // Normalizar a medianoche para contar días completos
    entry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    // Diferencia en milisegundos
    const diffTime = Math.abs(now.getTime() - entry.getTime());
    // Convertir a días y redondear hacia arriba
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Sumar 1 para incluir el día de hoy (según requerimiento)
    return diffDays + 1;
  };

  const filteredContainers = containers.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.bl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 rounded-xl text-indigo-500 shadow-xl shadow-slate-200">
            <Briefcase size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestión Operativa</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Control de Patio y Servicios</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('storage')}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
              activeTab === 'storage' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Almacenamiento</span>
          </button>
          <button 
            className="px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 text-slate-300 cursor-not-allowed"
            disabled
          >
            <Package size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Servicios (Próx.)</span>
          </button>
        </div>
      </header>

      {activeTab === 'storage' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Inventario en Piso</h3>
             </div>
             <div className="flex items-center gap-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="BUSCAR UNIDAD / CLIENTE..."
                   className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase outline-none focus:border-indigo-600"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <button className="p-2 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <Download size={16} />
               </button>
             </div>
           </div>

           <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left whitespace-nowrap">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha/Hora Ingreso</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contenedor</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo/Carga</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Peso Bruto</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty Días</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ubicación</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logística (BL/Nave)</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Recepción</th>
                   <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Días Libres</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredContainers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Package size={32} className="opacity-20" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">No hay unidades en almacenaje</span>
                        </div>
                      </td>
                    </tr>
                 ) : (
                   filteredContainers.map(c => {
                     const daysInYard = calculateDays(c.entryDate);
                     // Simulación de días libres (por defecto 7)
                     const freeDays = 7;
                     const isOverdue = daysInYard > freeDays;
                     
                     return (
                       <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-700 font-mono">
                               {new Date(c.entryDate).toLocaleDateString()}
                             </span>
                             <span className="text-[9px] font-bold text-slate-400">
                               {new Date(c.entryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs font-black text-slate-900 font-mono">{c.id}</span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-700 uppercase">{c.size} {c.type}</span>
                             <span className={`text-[9px] font-black uppercase tracking-wider ${c.loadType === 'LCL' ? 'text-purple-500' : 'text-blue-500'}`}>
                               {c.loadType}
                             </span>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <span className="text-[10px] font-bold text-slate-700 font-mono">
                             {(c.weight || c.cargoWeight || 0).toLocaleString()} KG
                           </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs ${isOverdue ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-green-50 text-green-600 ring-1 ring-green-100'}`}>
                             {daysInYard}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-800 uppercase font-mono bg-slate-100 px-2 py-1 rounded w-fit">
                             <MapPin size={10} />
                             {c.location.block}-{c.location.bay}-{c.location.row}-{c.location.tier}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="max-w-[150px] truncate">
                             <span className="text-[10px] font-bold text-slate-700 uppercase" title={c.client}>{c.client}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-col max-w-[150px]">
                             <span className="text-[10px] font-bold text-slate-700 font-mono truncate" title={c.bl}>{c.bl}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase truncate" title={c.vessel}>{c.vessel || 'N/A'}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-slate-700 uppercase">OPERADOR</span>
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">GATE-IN</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <span className="text-[10px] font-black text-slate-500 uppercase">{freeDays} DÍAS</span>
                         </td>
                       </tr>
                     );
                   })
                 )}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default OperationsModule;
