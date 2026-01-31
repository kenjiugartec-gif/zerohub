
import React, { useState, useMemo } from 'react';
import { YardConfig } from '../App';
import { EirConfig, Container } from '../types';
import EirReceipt from './EirReceipt';
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle, 
  Layers, 
  Grid, 
  List, 
  X,
  Building2,
  FileText,
  Smartphone,
  CreditCard,
  MapPin,
  Check,
  CheckCircle2,
  ImageIcon,
  Hash,
  Eye,
  Maximize,
  Layout,
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  Download,
  Upload,
  Clock,
  Briefcase,
  Terminal,
  HelpCircle
} from 'lucide-react';

interface SettingsProps {
  config: YardConfig;
  onUpdate: (newConfig: YardConfig) => void;
  activeContainersCount: number;
  eirConfig: EirConfig;
  onUpdateEir: (newEir: EirConfig) => void;
}

// Datos de prueba para la vista previa completa
const MOCK_CONTAINER: Container = {
  id: 'MSKU123456-7',
  client: 'IMPORTADORA ANDINA SPA',
  receptionNote: 'GR-880022',
  eirNumber: 'EIR-SAMPLE-001',
  vessel: 'MAERSK ESSEN',
  voyage: '201E',
  bl: 'BL-99112233',
  shippingLine: 'MAERSK LINE',
  weight: 28500,
  tare: 2250,
  size: "40'",
  type: 'Dry',
  entryDate: new Date().toISOString(),
  status: 'In',
  location: { block: 'A', bay: '01', row: 1, tier: 1 },
  transport: {
    truckPlate: 'ABCD-12',
    driverName: 'JUAN PÉREZ GONZÁLEZ',
    driverId: '12.345.678-9',
    driverType: 'Nacional',
    company: 'TRANSPORTES DEL SUR'
  },
  loadType: 'FCL'
};

const Settings: React.FC<SettingsProps> = ({ config, onUpdate, activeContainersCount, eirConfig, onUpdateEir }) => {
  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'layout' | 'eir' | 'system'>('terminal');
  const [localConfig, setLocalConfig] = useState<YardConfig>(config);
  const [localEir, setLocalEir] = useState<EirConfig>(eirConfig);
  const [newBlockName, setNewBlockName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const handleAddBlock = () => {
    if (!newBlockName) return;
    const name = newBlockName.toUpperCase().trim();
    if (localConfig.blocks.includes(name)) return;
    setLocalConfig({
      ...localConfig,
      blocks: [...localConfig.blocks, name].sort()
    });
    setNewBlockName('');
  };

  const handleRemoveBlock = (name: string) => {
    if (localConfig.blocks.length <= 1) return;
    const newBlocks = localConfig.blocks.filter(b => b !== name);
    let newLclBlock = localConfig.lclBlock;
    if (name === localConfig.lclBlock) {
       newLclBlock = newBlocks[newBlocks.length - 1];
    }
    setLocalConfig({ ...localConfig, blocks: newBlocks, lclBlock: newLclBlock });
  };

  const handleSaveAll = () => {
    if (activeContainersCount > 0) {
      const dimensionsChanged = 
        localConfig.baysCount !== config.baysCount || 
        localConfig.rowsCount !== config.rowsCount || 
        localConfig.tiersCount !== config.tiersCount ||
        localConfig.blocks.length < config.blocks.length;

      if (dimensionsChanged && !window.confirm("Hay unidades activas. Modificar la estructura podría causar inconsistencias visuales. ¿Desea continuar?")) {
        return;
      }
    }
    onUpdate(localConfig);
    onUpdateEir(localEir);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* NAVEGACIÓN LATERAL INTERNA */}
      <aside className="w-full lg:w-72 shrink-0 space-y-2">
        <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-white shadow-xl shadow-slate-200">
           <div className="flex items-center gap-3 mb-4">
              <Terminal size={20} className="text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Sistema ZH-25</h3>
           </div>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
             Configuración central de parámetros operativos y de identidad del terminal.
           </p>
        </div>

        <nav className="space-y-1">
          <SettingsNavButton 
            active={activeSubTab === 'terminal'} 
            onClick={() => setActiveSubTab('terminal')} 
            icon={<Briefcase size={18} />} 
            label="Identidad Terminal" 
            desc="Razón social y códigos"
          />
          <SettingsNavButton 
            active={activeSubTab === 'layout'} 
            onClick={() => setActiveSubTab('layout')} 
            icon={<Layout size={18} />} 
            label="Estructura Patio" 
            desc="Bloques, bays y baroti"
          />
          <SettingsNavButton 
            active={activeSubTab === 'eir'} 
            onClick={() => setActiveSubTab('eir')} 
            icon={<FileText size={18} />} 
            label="Branding EIR" 
            desc="Documentos y firmas"
          />
          <SettingsNavButton 
            active={activeSubTab === 'system'} 
            onClick={() => setActiveSubTab('system')} 
            icon={<Database size={18} />} 
            label="Datos y Seguridad" 
            desc="Backups y mantenimiento"
          />
        </nav>

        <div className="pt-8 px-4">
           <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado de Datos</span>
           </div>
           <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[94%]"></div>
           </div>
           <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Sincronización: Activa (94.2%)</p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 space-y-8">
        
        {/* SECCIÓN 1: IDENTIDAD TERMINAL */}
        {activeSubTab === 'terminal' && (
          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-10 md:p-14 space-y-12">
              <SectionHeader 
                icon={<Building2 className="text-indigo-600" />} 
                title="Identidad Institucional" 
                desc="Parámetros legales y comerciales del terminal de contenedores." 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EirInput label="Razón Social Empresa" icon={<Building2 size={18}/>} value={localEir.companyName} onChange={v => setLocalEir({...localEir, companyName: v})} />
                <EirInput label="RUT / Identificación Tributaria" icon={<CreditCard size={18}/>} value={localEir.companyTaxId} onChange={v => setLocalEir({...localEir, companyTaxId: v})} />
                <div className="md:col-span-2">
                  <EirInput label="Dirección Operativa Principal" icon={<MapPin size={18}/>} value={localEir.companyAddress} onChange={v => setLocalEir({...localEir, companyAddress: v})} />
                </div>
                <EirInput label="Teléfono Central" icon={<Smartphone size={18}/>} value={localEir.companyPhone} onChange={v => setLocalEir({...localEir, companyPhone: v})} />
                <EirInput label="Código de Terminal ZH" icon={<Grid size={18}/>} value={localEir.terminalCode} onChange={v => setLocalEir({...localEir, terminalCode: v})} />
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <HelpCircle size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                 <div>
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Sobre la Identidad Terminal</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Estos datos se utilizan para el encabezado de todos los documentos oficiales, exportaciones de Excel y reportes de inventario que emite el sistema ZeroHub.</p>
                 </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 2: ESTRUCTURA PATIO */}
        {activeSubTab === 'layout' && (
          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-10 md:p-14 space-y-12">
              <SectionHeader 
                icon={<Layout className="text-indigo-600" />} 
                title="Estructura de Almacenaje" 
                desc="Defina la arquitectura física de su patio de contenedores." 
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} /> Gestión de Bloques
                    </h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Bloques Activos: {localConfig.blocks.length}</span>
                  </div>

                  <div className="flex gap-3">
                    <input 
                      type="text" maxLength={2} placeholder="EJ: D"
                      className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                      value={newBlockName}
                      onChange={(e) => setNewBlockName(e.target.value)}
                    />
                    <button onClick={handleAddBlock} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                      Añadir
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {localConfig.blocks.map(block => (
                      <div key={block} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-indigo-300 transition-all">
                        <span className="text-lg font-black text-slate-900 font-roboto">BLOQUE {block}</span>
                        <button onClick={() => handleRemoveBlock(block)} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                     <label className="block text-[9px] font-black text-indigo-600 uppercase tracking-widest">Bloque Reservado LCL</label>
                     <select 
                       value={localConfig.lclBlock}
                       onChange={(e) => setLocalConfig({...localConfig, lclBlock: e.target.value})}
                       className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none appearance-none cursor-pointer"
                     >
                       {localConfig.blocks.map(b => <option key={b} value={b}>BLOQUE {b}</option>)}
                     </select>
                     <p className="text-[9px] text-slate-400 font-medium">El bloque LCL se destaca en el mapa con colores distintivos para carga suelta.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Grid size={14} /> Dimensiones Baroti
                  </h4>
                  <div className="space-y-4">
                    <DimensionInput label="Bahías (Bays)" value={localConfig.baysCount} onChange={(v) => setLocalConfig({...localConfig, baysCount: v})} />
                    <DimensionInput label="Filas (Rows)" value={localConfig.rowsCount} onChange={(v) => setLocalConfig({...localConfig, rowsCount: v})} />
                    <DimensionInput label="Niveles (Tiers)" value={localConfig.tiersCount} onChange={(v) => setLocalConfig({...localConfig, tiersCount: v})} />
                  </div>
                  
                  {activeContainersCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex gap-4 text-amber-700">
                      <AlertTriangle className="shrink-0" size={20} />
                      <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight">
                        Advertencia: Reducir dimensiones con {activeContainersCount} unidades en patio puede ocultar unidades fuera del nuevo rango.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 3: BRANDING EIR */}
        {activeSubTab === 'eir' && (
          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-10 md:p-14 space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <SectionHeader 
                  icon={<FileText className="text-indigo-600" />} 
                  title="Personalización Documental" 
                  desc="Ajuste el formato y contenido de los comprobantes EIR." 
                />
                <button 
                  onClick={() => setShowFullPreview(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                >
                  <Maximize size={16} /> Ver PDF Muestra
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                <div className="xl:col-span-6 space-y-8">
                  <EirInput label="Prefijo de Comprobante" icon={<Hash size={18}/>} value={localEir.eirPrefix} onChange={v => setLocalEir({...localEir, eirPrefix: v.toUpperCase()})} />
                  <EirInput label="URL Logo Corporativo (Web)" icon={<ImageIcon size={18}/>} value={localEir.logoUrl || ''} onChange={v => setLocalEir({...localEir, logoUrl: v})} />
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Notas Legales al Pie</label>
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs outline-none focus:border-indigo-600 focus:bg-white h-48 resize-none transition-all shadow-inner leading-relaxed"
                      value={localEir.footerNotes}
                      onChange={e => setLocalEir({...localEir, footerNotes: e.target.value})}
                      placeholder="Términos legales de responsabilidad..."
                    ></textarea>
                  </div>
                </div>

                <div className="xl:col-span-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Eye size={16} /> Previsualización Dinámica
                  </h4>
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-inner relative overflow-hidden group">
                     <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-slate-100">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                           <div className="space-y-3">
                              {localEir.logoUrl ? (
                                <img src={localEir.logoUrl} className="h-10 w-auto" alt="Preview Logo" />
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                              )}
                              <h5 className="text-sm font-black text-slate-900 uppercase">{localEir.companyName || 'EMPRESA'}</h5>
                           </div>
                           <div className="text-right">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">EIR N°</span>
                              <div className="bg-slate-900 text-white px-3 py-1 rounded-md font-mono text-sm font-black mt-1">
                                {localEir.eirPrefix || 'EIR'}-001
                              </div>
                           </div>
                        </div>
                        <div className="space-y-4 py-2 opacity-50">
                           <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                           <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="h-8 bg-slate-50 rounded-lg"></div>
                              <div className="h-8 bg-slate-50 rounded-lg"></div>
                           </div>
                        </div>
                        <div className="border-t border-slate-100 pt-4">
                           <p className="text-[7px] text-slate-300 font-bold uppercase line-clamp-3 leading-relaxed">
                             {localEir.footerNotes || 'Sin notas configuradas...'}
                           </p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 4: DATOS Y SEGURIDAD */}
        {activeSubTab === 'system' && (
          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-10 md:p-14 space-y-12">
              <SectionHeader 
                icon={<Database className="text-indigo-600" />} 
                title="Gestión de Datos & Seguridad" 
                desc="Administración de copias de seguridad y mantenimiento del sistema." 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Download size={24} /></div>
                      <div>
                         <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">Exportar Base de Datos</h5>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Descarga completa en formato JSON</p>
                      </div>
                   </div>
                   <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                      Generar Backup Ahora
                   </button>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Upload size={24} /></div>
                      <div>
                         <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">Restaurar Sistema</h5>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cargar archivo de respaldo ZH</p>
                      </div>
                   </div>
                   <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                      Seleccionar Archivo
                   </button>
                </div>

                <div className="md:col-span-2 p-8 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-between gap-8">
                   <div className="flex items-center gap-5">
                      <div className="p-4 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200"><Trash2 size={28} /></div>
                      <div>
                         <h5 className="text-base font-black text-red-900 uppercase tracking-tight">Zona de Mantenimiento Crítico</h5>
                         <p className="text-[10px] text-red-600 font-bold uppercase mt-1 tracking-widest">Purgar inventario y resetear posiciones de patio</p>
                      </div>
                   </div>
                   <button className="px-10 py-5 bg-white text-red-600 border border-red-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">
                      Purgar Sistema
                   </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BOTÓN GLOBAL DE GUARDADO */}
        <div className="flex justify-end pt-4 pb-20">
          <button 
            onClick={handleSaveAll}
            className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center gap-4 shadow-2xl hover:-translate-y-1 active:scale-95 group"
          >
            <Save size={20} className="group-hover:animate-bounce" /> Aplicar Cambios Globales
          </button>
        </div>
      </main>

      {/* MODALES & OVERLAYS */}
      {showFullPreview && (
        <EirReceipt container={MOCK_CONTAINER} config={localEir} onClose={() => setShowFullPreview(false)} />
      )}

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"></div>
          <div className="bg-white p-14 rounded-[3rem] shadow-2xl relative z-10 flex flex-col items-center gap-10 transform animate-in zoom-in-95 duration-500 border border-slate-100 max-w-sm w-full mx-4 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner relative">
              <Check size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">¡Configuración Exitosa!</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Los parámetros operativos han sido actualizados en la base de datos local del terminal.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTES AUXILIARES INTERNOS ---

const SettingsNavButton = ({ active, onClick, icon, label, desc }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 text-left group ${
      active ? 'bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100' : 'hover:bg-slate-100/50'
    }`}
  >
    <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-600'}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <h4 className={`text-xs font-black uppercase tracking-tight mb-0.5 ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</h4>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{desc}</p>
    </div>
  </button>
);

const SectionHeader = ({ icon, title, desc }: any) => (
  <header className="flex items-center gap-6">
    <div className="p-4 bg-slate-100 rounded-2xl shadow-inner text-indigo-600">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{title}</h2>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{desc}</p>
    </div>
  </header>
);

const DimensionInput = ({ label, value, onChange }: any) => (
  <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-all group shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
        <Hash size={16} />
      </div>
      <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{label}</p>
    </div>
    <div className="flex items-center gap-3">
      <button 
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-black text-lg hover:bg-red-50 hover:text-red-600 transition-all"
      >-</button>
      <span className="w-10 text-center font-black text-xl text-slate-900 font-mono">{value}</span>
      <button 
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-black text-lg hover:bg-green-50 hover:text-green-600 transition-all"
      >+</button>
    </div>
  </div>
);

const EirInput = ({ label, icon, value, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
        {icon}
      </div>
      <input 
        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Ingrese ${label.toLowerCase()}...`}
      />
    </div>
  </div>
);

export default Settings;
