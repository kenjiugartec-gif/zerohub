
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { YardEspacio, Container, MaterialType, ContainerType, LoadType } from '../types';
import { YardConfig } from '../App';
import { 
  Search, 
  Package, 
  Layers, 
  MapPin,
  RefreshCw,
  X,
  Edit3,
  Save,
  Undo2,
  Calendar,
  Box,
  FileDigit,
  ArrowRight,
  Focus,
  Snowflake,
  PackageOpen,
  Cylinder,
  Maximize,
  Droplets,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';

// --- FUNCIONES DE UTILIDAD ---

const getLocalISOString = (isoDate?: string) => {
  const date = isoDate ? new Date(isoDate) : new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 19);
};

const capitalizeProper = (val: string) => {
  if (!val) return '';
  return val
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const MATERIAL_TYPES: MaterialType[] = ['Cajas', 'Bobinas', 'Pallets', 'Sacos', 'Planchas'];

const getTypeIcon = (type: ContainerType) => {
  switch (type) {
    case 'Dry': return <Box size={10} />;
    case 'Reefer': return <Snowflake size={10} className="text-blue-400" />;
    case 'Open Top': return <PackageOpen size={10} />;
    case 'Flat Rack': return <Maximize size={10} />;
    case 'Tank': return <Droplets size={10} className="text-cyan-400" />;
    default: return <Box size={10} />;
  }
};

// --- COMPONENTE PRINCIPAL ---

interface YardMapProps {
  espacios: YardEspacio[];
  containers: Container[];
  yardConfig: YardConfig;
  onEspacioClick: (espacio: YardEspacio) => void;
  onDeleteLocation: (containerId: string) => void;
  onRelocate: (containerId: string, newEspacio: YardEspacio) => void;
  onUpdateContainer: (updatedContainer: Container) => void;
}

type ZoneFilter = 'All' | 'FCL' | 'LCL';

const YardMap: React.FC<YardMapProps> = ({ espacios, containers, yardConfig, onEspacioClick, onDeleteLocation, onRelocate, onUpdateContainer }) => {
  const [activeBlock, setActiveBlock] = useState<string>('A');
  const [activeBay, setActiveBay] = useState<string>('01');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState<Container | null>(null);
  const [relocatingId, setRelocatingId] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('All');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Container | null>(null);

  // Usar el bloque LCL configurado o fallback al último bloque si no existe la propiedad
  const lclBlock = useMemo(() => yardConfig.lclBlock || yardConfig.blocks[yardConfig.blocks.length - 1], [yardConfig]);
  
  // Si estamos relocalizando, detectamos automáticamente el tipo para filtrar
  useEffect(() => {
    if (relocatingId) {
      const container = containers.find(c => c.id === relocatingId);
      if (container) {
        setZoneFilter(container.loadType);
        // Saltamos al bloque sugerido si no estamos en él
        if (container.loadType === 'LCL' && activeBlock !== lclBlock) {
          setActiveBlock(lclBlock);
        }
      }
    } else {
      setZoneFilter('All');
    }
  }, [relocatingId, containers, lclBlock]);

  const blocks = useMemo(() => Array.from(new Set(espacios.map(s => s.block))).sort(), [espacios]);
  const bays = useMemo(() => Array.from(new Set(espacios.filter(s => s.block === activeBlock).map(s => s.bay))).sort(), [espacios, activeBlock]);
  const currentEspacios = useMemo(() => espacios.filter(s => s.block === activeBlock && s.bay === activeBay), [espacios, activeBlock, activeBay]);
  const rows = useMemo(() => Array.from(new Set(currentEspacios.map(s => s.row))).sort((a: any, b: any) => a - b), [currentEspacios]);
  const tiers = useMemo(() => Array.from(new Set(currentEspacios.map(s => s.tier))).sort((a: any, b: any) => b - a), [currentEspacios]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return containers.filter(c => 
      c.status === 'In' && (
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, containers]);

  const handleContainerClick = (container: Container) => {
    if (relocatingId) return;
    setShowModal(container);
    setEditData({ ...container });
    setIsEditing(false);
  };

  const handleEmptyEspacioClick = (espacio: YardEspacio) => {
    if (relocatingId) {
      onRelocate(relocatingId, espacio);
      setRelocatingId(null);
    } else {
      onEspacioClick(espacio);
    }
  };

  const handleSaveChanges = () => {
    if (editData) {
      onUpdateContainer(editData);
      setShowModal(editData);
      setIsEditing(false);
    }
  };

  const jumpToContainer = (container: Container) => {
    setActiveBlock(container.location.block);
    setActiveBay(container.location.bay);
    // No limpiamos el searchQuery para mantener el resaltado
  };

  return (
    <div className="space-y-6">
      {relocatingId && (
        <div className="bg-indigo-600 text-white p-5 rounded-lg flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4 duration-500 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-md backdrop-blur-md">
               <RefreshCw className="animate-spin" size={20} />
            </div>
            <div>
               <span className="text-xs font-black uppercase tracking-widest block">Modo Re-ubicación Activo</span>
               <p className="text-[10px] font-bold text-indigo-100 uppercase mt-0.5">Moviendo unidad {relocatingId} • Zona sugerida: {zoneFilter}</p>
            </div>
          </div>
          <button onClick={() => setRelocatingId(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-all text-[10px] font-black uppercase tracking-widest">Cancelar</button>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-8 mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3 flex-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Bloque del Depósito</label>
               <div className="flex flex-wrap gap-2">
                  {blocks.map(block => (
                    <button
                      key={block}
                      onClick={() => { setActiveBlock(block); setActiveBay(bays[0] || '01'); }}
                      className={`relative px-8 py-3 rounded-md font-black text-sm transition-all border ${activeBlock === block ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'}`}
                    >
                      {block === lclBlock && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white"></div>
                      )}
                      BLOQUE {block}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                 <Filter size={10} /> Filtro de Zona Operativa
               </label>
               <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
                  {(['All', 'FCL', 'LCL'] as ZoneFilter[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setZoneFilter(f)}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${zoneFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {f === 'All' ? 'TODOS' : f}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Bahías Disponibles (Bays)</label>
            <div className="flex flex-wrap bg-slate-50 p-2 rounded-lg gap-2 border border-slate-200 no-scrollbar overflow-x-auto">
              {bays.map(b => {
                const bayEspacios = espacios.filter(s => s.block === activeBlock && s.bay === b);
                const occupiedCount = bayEspacios.filter(s => s.containerId).length;
                const totalCount = bayEspacios.length;
                const occupancyPct = (occupiedCount / totalCount) * 100;
                const isActive = activeBay === b;

                return (
                  <button
                    key={b}
                    onClick={() => setActiveBay(b)}
                    className={`relative group px-5 py-3 rounded-md transition-all duration-300 overflow-hidden min-w-[100px] border ${isActive ? 'bg-white border-slate-200 shadow-md' : 'bg-transparent border-transparent hover:border-slate-200 text-slate-500'}`}
                  >
                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`} style={{ width: `${occupancyPct}%` }}></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>Bay {b}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9px] font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{occupiedCount}</span>
                        <span className="text-[8px] font-bold text-slate-300">/</span>
                        <span className="text-[9px] font-bold text-slate-400">{totalCount}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Search size={12} /> Filtro de Unidades (ID / Cliente)
            </label>
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="BUSCAR O FILTRAR EN MAPA..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold uppercase focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {searchResults.length > 0 && searchQuery.length >= 2 && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300 max-h-64 overflow-y-auto no-scrollbar border-t-4 border-t-indigo-600 relative z-[60]">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coincidencias Globales: {searchResults.length}</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {searchResults.slice(0, 10).map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => jumpToContainer(c)}
                      className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-md text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Package size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-900 uppercase font-mono">{c.id}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{c.client}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Posición</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase">{c.location.block}-{c.location.bay}-{c.location.row}-{c.location.tier}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                  {searchResults.length > 10 && (
                     <div className="p-3 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                        ... y {searchResults.length - 10} más
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LEYENDA DE ZONAS */}
        <div className="flex items-center gap-6 mb-4 px-2">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Zona FCL (Varios Bloques)</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.4)]"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Zona LCL (Bloque {lclBlock})</span>
           </div>
        </div>

        <div className="overflow-x-auto py-6 no-scrollbar">
          <div className="inline-block min-w-full align-middle">
            <table className="border-separate border-spacing-2 mx-auto">
              <thead>
                <tr>
                  <th className="w-12"></th>
                  {rows.map(rowNum => (
                    <th key={rowNum} className="pb-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase font-roboto">R{rowNum}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiers.map(tierNum => (
                  <tr key={tierNum}>
                    <td className="pr-4 text-right align-middle">
                       <div className="text-[10px] font-black text-slate-400 uppercase font-roboto">T{tierNum}</div>
                    </td>
                    {rows.map(rowNum => {
                      const espacio = currentEspacios.find(s => s.row === rowNum && s.tier === tierNum);
                      if (!espacio) return <td key={rowNum}></td>;

                      const container = containers.find(c => c.id === espacio.containerId && c.status === 'In');
                      const isMatch = searchQuery && searchQuery.length > 1 && (
                        container?.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        container?.client.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      // Si hay búsqueda activa, filtramos visualmente los que no coinciden
                      const isFilteredOut = searchQuery.length > 1 && container && !isMatch;

                      // Lógica de filtrado visual (zonas y ocupación)
                      const isLclZone = espacio.block === lclBlock;
                      const isSuggested = !container && (
                        (zoneFilter === 'LCL' && isLclZone) || 
                        (zoneFilter === 'FCL' && !isLclZone)
                      );
                      const isDimmed = !isSuggested && !container && zoneFilter !== 'All';

                      return (
                        <td key={rowNum}>
                          <button
                            disabled={relocatingId && container !== undefined}
                            onClick={() => container ? handleContainerClick(container) : handleEmptyEspacioClick(espacio)}
                            className={`
                              relative w-28 h-20 rounded-sm flex flex-col items-center justify-center border transition-all duration-300
                              ${container 
                                ? (isMatch 
                                  ? 'bg-indigo-600 border-indigo-700 shadow-2xl ring-4 ring-indigo-500/20 text-white z-20 scale-105' 
                                  : (isFilteredOut 
                                      ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 grayscale scale-95' 
                                      : (container.loadType === 'LCL' 
                                          ? 'bg-purple-700 border-purple-800 text-white hover:bg-purple-600 shadow-md' 
                                          : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white shadow-md'))) 
                                : (isSuggested 
                                    ? `bg-white border-dashed ${isLclZone ? 'border-purple-400 ring-4 ring-purple-500/10' : 'border-indigo-400 ring-4 ring-indigo-500/10'} hover:bg-indigo-50/50 shadow-inner` 
                                    : (isDimmed 
                                        ? 'bg-slate-50 border-slate-100 opacity-20 scale-95 grayscale' 
                                        : 'bg-white border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50'))}
                              ${relocatingId && isSuggested ? 'ring-2 ring-indigo-500 ring-offset-2 animate-pulse scale-105' : ''}
                            `}
                          >
                            {container ? (
                              <>
                                <div className="absolute top-1 right-1 opacity-20">
                                  {isMatch ? <Focus size={10} className="text-white" /> : <Package size={10} />}
                                </div>
                                <span className={`text-[10px] font-mono font-black uppercase tracking-tight truncate w-full px-2 text-center`}>
                                  {container.loadType === 'LCL' ? 'LCL CARGO' : container.id.split('-')[0]}
                                </span>
                                <span className={`text-[8px] font-bold uppercase mt-1 truncate w-full px-2 text-center ${isMatch ? 'text-indigo-100' : 'text-slate-400'}`}>
                                  {container.loadType === 'LCL' ? container.client : `${container.size} | ${container.type}`}
                                </span>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isSuggested ? (isLclZone ? 'text-purple-600' : 'text-indigo-600') : 'text-slate-300'}`}>
                                  {isSuggested ? 'Sugerido' : (relocatingId ? 'Mover' : 'Libre')}
                                </span>
                                {isSuggested && <CheckCircle2 size={12} className={isLclZone ? 'text-purple-500' : 'text-indigo-500'} />}
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
           <div className="flex items-center gap-3">
              <Info size={16} className="text-indigo-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Los bloques se auto-asignan según flujo: Bloques A-B (FCL) | Bloque {lclBlock} (LCL)</p>
           </div>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                 <span className="text-[8px] font-black text-slate-400 uppercase">FCL</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                 <span className="text-[8px] font-black text-slate-400 uppercase">LCL</span>
              </div>
           </div>
        </div>
      </div>

      {showModal && editData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e293b] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-700/50">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-md text-white shadow-xl ${showModal.loadType === 'LCL' ? 'bg-purple-600 shadow-purple-500/20' : 'bg-slate-700 shadow-slate-900/40'}`}>
                      <Package size={28} />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight font-mono">{showModal.id}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${showModal.loadType === 'LCL' ? 'text-purple-400' : 'text-indigo-400'}`}>{showModal.loadType === 'LCL' ? 'CARGA LCL' : showModal.shippingLine}</p>
                        <span className="flex items-center gap-2 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest bg-slate-700/50 text-white border border-white/5">
                          {showModal.loadType === 'LCL' ? <Layers size={10} /> : getTypeIcon(showModal.type)}
                          {showModal.loadType === 'LCL' ? 'SUELTA' : showModal.type}
                        </span>
                      </div>
                   </div>
                </div>
                {!isEditing && (
                  <button onClick={() => setShowModal(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <DarkDetail label="Bloque" value={showModal.location.block} />
                 <DarkDetail label="Posición" value={`${showModal.location.bay}-${showModal.location.row}-${showModal.location.tier}`} />
                 
                 <EditableDarkDetail 
                  label="N° Guía Recepción" 
                  value={editData.receptionNote} 
                  isEditing={isEditing}
                  onChange={(v) => setEditData({...editData, receptionNote: v.toUpperCase()})}
                 />

                 <EditableDarkDetail 
                  label="N° EIR" 
                  value={editData.eirNumber || ''} 
                  isEditing={isEditing}
                  onChange={(v) => setEditData({...editData, eirNumber: v.toUpperCase()})}
                 />
                 
                 <EditableDarkDetail 
                  label="Cliente" 
                  value={editData.client} 
                  isEditing={isEditing}
                  autoCapitalize
                  onChange={(v) => setEditData({...editData, client: v})}
                 />
                 
                 {showModal.loadType === 'FCL' ? (
                   <>
                    <DarkDetail label="Tipo/Size" value={`${showModal.size} ${showModal.type}`} />
                    <EditableDarkDetail 
                      label="BL" 
                      value={editData.bl} 
                      isEditing={isEditing}
                      onChange={(v) => setEditData({...editData, bl: v.toUpperCase()})}
                    />
                    <DarkDetail label="Nave/Viaje" value={`${showModal.vessel} / ${showModal.voyage}`} />
                    
                    <EditableDarkDetail 
                      label="Tara (KG)" 
                      value={editData.tare?.toString()} 
                      isEditing={isEditing}
                      type="number"
                      onChange={(v) => setEditData({...editData, tare: parseInt(v) || 0})}
                    />
                    
                    <EditableDarkDetail 
                      label="P. Bruto (KG)" 
                      value={editData.weight?.toString()} 
                      isEditing={isEditing}
                      type="number"
                      onChange={(v) => setEditData({...editData, weight: parseInt(v) || 0})}
                    />
                   </>
                 ) : (
                   <>
                    <MaterialSelect 
                      value={editData.materialType} 
                      onChange={(v) => setEditData({...editData, materialType: v})} 
                      isEditing={isEditing} 
                    />
                    <EditableDarkDetail 
                      label="Bultos" 
                      value={editData.cargoQuantity?.toString() || '0'} 
                      isEditing={isEditing}
                      type="number"
                      onChange={(v) => setEditData({...editData, cargoQuantity: parseInt(v) || 0})}
                    />
                    <EditableDarkDetail 
                      label="Peso Carga (KG)" 
                      value={editData.cargoWeight?.toString() || '0'} 
                      isEditing={isEditing}
                      type="number"
                      onChange={(v) => setEditData({...editData, cargoWeight: parseInt(v) || 0})}
                    />
                   </>
                 )}
                 
                 <EditableDarkDetail 
                  label="Fecha/Hora Ingreso" 
                  value={editData.entryDate} 
                  isEditing={isEditing}
                  type="datetime-local"
                  onChange={(v) => setEditData({...editData, entryDate: new Date(v).toISOString()})}
                 />
                 
                 <EditableDarkDetail 
                  label="Patente Camión" 
                  value={editData.transport.truckPlate} 
                  isEditing={isEditing}
                  onChange={(v) => setEditData({...editData, transport: { ...editData.transport, truckPlate: v.toUpperCase() }})}
                 />
              </div>

              <div className="pt-6 grid grid-cols-3 gap-3">
                 {isEditing ? (
                   <>
                    <button 
                      onClick={handleSaveChanges}
                      className="py-4 bg-green-600 text-white rounded-md font-black text-[10px] uppercase hover:bg-green-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={14} />
                      Guardar
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({ ...showModal });
                      }}
                      className="py-4 bg-slate-700 text-white rounded-md font-black text-[10px] uppercase hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Undo2 size={14} />
                      Cancelar
                    </button>
                    <div></div>
                   </>
                 ) : (
                   <>
                    <button 
                      onClick={() => {
                        onDeleteLocation(showModal.id);
                        setShowModal(null);
                      }}
                      className="py-4 bg-red-600/10 text-red-400 rounded-md font-black text-[10px] uppercase border border-red-600/20 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-900/10"
                    >
                      Eliminar
                    </button>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="py-4 bg-amber-600/10 text-amber-400 rounded-md font-black text-[10px] uppercase border border-amber-600/20 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                    <button 
                      onClick={() => {
                        setRelocatingId(showModal.id);
                        setShowModal(null);
                      }}
                      className="py-4 bg-indigo-600/10 text-indigo-400 rounded-md font-black text-[10px] uppercase border border-indigo-600/20 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Re-Ubicar
                    </button>
                   </>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const DarkDetail = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700/50 shadow-inner">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
    <p className="text-sm font-bold text-white uppercase font-mono truncate">{value || 'N/A'}</p>
  </div>
);

const EditableDarkDetail = ({ label, value, isEditing, onChange, type = "text", autoCapitalize = false }: { label: string, value: string, isEditing: boolean, onChange: (v: string) => void, type?: string, autoCapitalize?: boolean }) => {
  const displayValue = type === "datetime-local" ? getLocalISOString(value) : value;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (val: string) => {
    if (autoCapitalize) {
      onChange(capitalizeProper(val));
    } else {
      onChange(val);
    }
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      if (typeof (inputRef.current as any).showPicker === 'function') {
        (inputRef.current as any).showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className={`p-4 rounded-md border transition-all ${isEditing ? 'bg-slate-700 border-indigo-500 ring-1 ring-indigo-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {isEditing && type === 'datetime-local' && (
          <button onClick={handleIconClick} className="text-slate-500 hover:text-indigo-400">
            <Calendar size={12} />
          </button>
        )}
      </div>
      {isEditing ? (
        <input 
          ref={inputRef}
          type={type}
          step={type === 'datetime-local' ? "1" : undefined}
          className="w-full bg-transparent text-sm font-bold text-white uppercase font-mono outline-none border-b border-white/10 pb-0.5 focus:border-indigo-400 transition-colors"
          value={displayValue || ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : (
        <p className="text-sm font-bold text-white uppercase font-mono truncate">
          {type === "datetime-local" ? new Date(value).toLocaleString() : (value || 'N/A')}
        </p>
      )}
    </div>
  );
};

const MaterialSelect = ({ value, onChange, isEditing }: { value?: MaterialType, onChange: (v: MaterialType) => void, isEditing: boolean }) => {
  if (!isEditing) {
    return <DarkDetail label="Tipo de Material" value={value || 'No Especificado'} />;
  }
  return (
    <div className="p-4 rounded-md border bg-slate-700 border-indigo-500 ring-1 ring-indigo-500/30">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo de Material</p>
      <select 
        className="w-full bg-transparent text-sm font-bold text-white uppercase font-mono outline-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value as MaterialType)}
      >
        <option value="" className="bg-slate-800">-- Seleccionar --</option>
        {MATERIAL_TYPES.map(t => (
          <option key={t} value={t} className="bg-slate-800">{t}</option>
        ))}
      </select>
    </div>
  );
};

export default YardMap;
