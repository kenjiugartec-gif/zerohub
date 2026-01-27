
import React from 'react';
import { Movement, TransportInfo, Container } from '../types';
import { ArrowUpRight, ArrowDownLeft, Clock, Truck, RefreshCw, AlertCircle, Package } from 'lucide-react';

interface MovementLogProps {
  movements: Movement[];
  limit?: number;
  type?: 'Gate-In' | 'Gate-Out' | 'Correction' | 'Relocation';
}

const MovementLog: React.FC<MovementLogProps> = ({ movements, limit, type }) => {
  let displayMovements = movements;
  if (type) displayMovements = displayMovements.filter(m => m.type === type);
  if (limit) displayMovements = displayMovements.slice(0, limit);

  if (displayMovements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Clock size={40} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">No se registran movimientos</p>
      </div>
    );
  }

  const isTransportInfo = (details: any): details is TransportInfo => {
    return details && (details as TransportInfo).truckPlate !== undefined;
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'Gate-In': return <ArrowDownLeft size={14} />;
      case 'Gate-Out': return <ArrowUpRight size={14} />;
      case 'Relocation': return <RefreshCw size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'Gate-In': return 'bg-green-100 text-green-600';
      case 'Gate-Out': return 'bg-red-100 text-red-600';
      case 'Relocation': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Movimiento</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Unidad</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Fecha y Hora</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Transporte</th>
            {!limit && <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Detalles Adicionales</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {displayMovements.map((m) => {
            const transport = isTransportInfo(m.details) ? m.details : null;
            const relocation = !transport ? (m.details as { reason: string; from: string; to: string }) : null;

            return (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${getMovementColor(m.type)}`}>
                      {getMovementIcon(m.type)}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tight ${getMovementColor(m.type).split(' ')[1]}`}>
                      {m.type}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Package size={12} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{m.containerId}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">
                      {new Date(m.timestamp).toLocaleDateString('es-CL')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {new Date(m.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {transport ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1 rounded-md"><Truck size={12} className="text-slate-500" /></div>
                      <span className="text-sm font-mono font-bold text-slate-600 uppercase">{transport.truckPlate}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-indigo-400 uppercase">Re-Ubicación</span>
                  )}
                </td>
                {!limit && (
                  <td className="px-4 py-4">
                    {transport ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{transport.driverName}</span>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{transport.company}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-600">{relocation?.reason}</span>
                        <span className="text-[8px] text-slate-400 font-black uppercase">De: {relocation?.from} | A: {relocation?.to}</span>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MovementLog;
