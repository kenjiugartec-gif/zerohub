
import React, { useState } from 'react';
import { YardConfig } from '../App';
import { EirConfig, Container } from '../types';
import EirReceipt from './EirReceipt';
// Added CheckCircle2 to imports
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
  Layout
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
  const [localConfig, setLocalConfig] = useState<YardConfig>(config);
  const [localEir, setLocalEir] = useState<EirConfig>(eirConfig);
  const [newBlockName, setNewBlockName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const handleAddBlock = () => {
    if (!newBlockName) return;
    const name = newBlockName.toUpperCase().trim();
    if (localConfig.blocks.includes(name)) {
      alert("El bloque ya existe.");
      return;
    }
    setLocalConfig({
      ...localConfig,
      blocks: [...localConfig.blocks, name].sort()
    });
    setNewBlockName('');
  };

  const handleRemoveBlock = (name: string) => {
    if (localConfig.blocks.length <= 1) {
      alert("Debe haber al menos un bloque.");
      return;
    }
    const newBlocks = localConfig.blocks.filter(b => b !== name);
    // Si borramos el bloque LCL, reasignamos al último disponible
    let newLclBlock = localConfig.lclBlock;
    if (name === localConfig.lclBlock) {
       newLclBlock = newBlocks[newBlocks.length - 1];
    }
    setLocalConfig({
      ...localConfig,
      blocks: newBlocks,
      lclBlock: newLclBlock
    });
  };

  const handleSaveAll = () => {
    if (activeContainersCount > 0) {
      const dimensionsChanged = 
        localConfig.baysCount !== config.baysCount || 
        localConfig.rowsCount !== config.rowsCount || 
        localConfig.tiersCount !== config.tiersCount ||
        localConfig.blocks.length < config.blocks.length;

      if (dimensionsChanged && !window.confirm("Hay contenedores activos en el patio. Modificar la estructura podría causar inconsistencias visuales en las posiciones actuales si se reducen dimensiones. ¿Desea continuar?")) {
        return;
      }
    }
    onUpdate(localConfig);
    onUpdateEir(localEir);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  return (
    <div className="relative pb-24">
      <div className="space-y-10">
        {/* CONFIGURACIÓN YARD ESTRUCTURA */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">
            <header className="flex items-center gap-5 border-b border-slate-100 pb-8">
              <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                <Layout size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Configuraciones de Patio</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Estructura Logística y Baroti</p>
              </div>
            </header>

            {activeContainersCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex gap-4 text-amber-700 items-center">
                <AlertTriangle className="shrink-0" size={24} />
                <p className="text-[11px] font-black uppercase tracking-tight leading-relaxed">
                  Nota Operativa: Hay {activeContainersCount} unidades activas. Los cambios en dimensiones se aplicarán a la vista de mapa inmediatamente.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-indigo-600 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">
                  <Grid size={16} /> 1. Bloques de Almacenaje
                </h3>
                
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    maxLength={2}
                    placeholder="Ej: D"
                    className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                  />
                  <button onClick={handleAddBlock} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
                    Añadir
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {localConfig.blocks.map(block => (
                    <div key={block} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-indigo-200 transition-all shadow-sm">
                      <span className="text-xl font-black text-slate-900">Bloque {block}</span>
                      <button onClick={() => handleRemoveBlock(block)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 bg-white shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Asignación de Bloque LCL */}
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl space-y-4">
                  <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                     <Layers size={14} /> Asignación Zona LCL
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">Seleccione el bloque destinado a operaciones de carga suelta.</p>
                  <select 
                     value={localConfig.lclBlock}
                     onChange={(e) => setLocalConfig({...localConfig, lclBlock: e.target.value})}
                     className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl font-bold text-slate-800 text-sm focus:border-indigo-600 outline-none uppercase"
                  >
                     {localConfig.blocks.map(b => (
                       <option key={b} value={b}>Bloque {b}</option>
                     ))}
                  </select>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-indigo-600 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">
                  <List size={16} /> 2. Dimensiones de Estiba
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <DimensionInput label="Bahías (Bays)" value={localConfig.baysCount} onChange={(v) => setLocalConfig({...localConfig, baysCount: v})} />
                  <DimensionInput label="Filas (Rows)" value={localConfig.rowsCount} onChange={(v) => setLocalConfig({...localConfig, rowsCount: v})} />
                  <DimensionInput label="Niveles (Tiers)" value={localConfig.tiersCount} onChange={(v) => setLocalConfig({...localConfig, tiersCount: v})} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONFIGURACIÓN DOCUMENTO EIR CON VISTA PREVIA */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Configuración de Comprobantes</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Identidad Corporativa en Documentos EIR</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullPreview(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Maximize size={16} /> Ver Vista Previa Completa
              </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
              {/* Formulario EIR */}
              <div className="xl:col-span-7 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <EirInput label="Razón Social Empresa" icon={<Building2 size={18}/>} value={localEir.companyName} onChange={v => setLocalEir({...localEir, companyName: v})} />
                  <EirInput label="RUT / Tax ID" icon={<CreditCard size={18}/>} value={localEir.companyTaxId} onChange={v => setLocalEir({...localEir, companyTaxId: v})} />
                  <div className="md:col-span-2">
                    <EirInput label="Dirección Legal" icon={<MapPin size={18}/>} value={localEir.companyAddress} onChange={v => setLocalEir({...localEir, companyAddress: v})} />
                  </div>
                  <EirInput label="Teléfono de Contacto" icon={<Smartphone size={18}/>} value={localEir.companyPhone} onChange={v => setLocalEir({...localEir, companyPhone: v})} />
                  <EirInput label="Código de Terminal" icon={<Grid size={18}/>} value={localEir.terminalCode} onChange={v => setLocalEir({...localEir, terminalCode: v})} />
                  <EirInput label="Prefijo EIR" icon={<Hash size={18}/>} value={localEir.eirPrefix} onChange={v => setLocalEir({...localEir, eirPrefix: v.toUpperCase()})} />
                  <EirInput label="URL Logo (Opcional)" icon={<ImageIcon size={18}/>} value={localEir.logoUrl || ''} onChange={v => setLocalEir({...localEir, logoUrl: v})} />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Notas al Pie y Condiciones Generales</label>
                  <textarea 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs outline-none focus:border-indigo-600 focus:bg-white h-32 resize-none transition-all shadow-inner"
                    value={localEir.footerNotes}
                    onChange={e => setLocalEir({...localEir, footerNotes: e.target.value})}
                    placeholder="Escriba los términos legales que aparecerán al final de cada EIR..."
                  ></textarea>
                </div>
              </div>

              {/* Vista Previa en Vivo (Estilo Documento) */}
              <div className="xl:col-span-5">
                <div className="sticky top-8 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">
                     <Eye size={16} /> Simulación de Documento
                  </h3>
                  
                  <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 space-y-6 shadow-2xl shadow-slate-200/50 pointer-events-none select-none overflow-hidden relative border-t-[12px] border-t-slate-900">
                    <div className="flex justify-between items-start gap-6 relative z-10">
                      <div className="flex-1 space-y-4">
                        {localEir.logoUrl ? (
                          <div className="h-16 flex items-center">
                            <img src={localEir.logoUrl} alt="Logo" className="max-h-full w-auto object-contain" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                             <ImageIcon size={32} />
                          </div>
                        )}
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-900 leading-none uppercase truncate">{localEir.companyName || 'Nombre Empresa'}</h4>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            <p className="truncate">{localEir.companyAddress || 'Calle Principal #123, Ciudad'}</p>
                            <p>RUT: {localEir.companyTaxId || 'XX.XXX.XXX-X'} | TEL: {localEir.companyPhone || '+56 9...'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">EIR RECEPCIÓN</div>
                        <div className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-mono text-lg font-black shadow-lg">
                          {localEir.eirPrefix || 'EIR'}-00123
                        </div>
                        <p className="text-[8px] font-black text-slate-300 uppercase mt-3 tracking-widest">ZH CODE: {localEir.terminalCode || '---'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100/50">
                       <div className="space-y-1">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Contenedor</p>
                          <p className="text-[10px] font-bold text-slate-900 font-mono">{MOCK_CONTAINER.id}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Tipo</p>
                          <p className="text-[10px] font-bold text-slate-900">{MOCK_CONTAINER.size} {MOCK_CONTAINER.type}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Cliente</p>
                          <p className="text-[10px] font-bold text-slate-900 truncate">{MOCK_CONTAINER.client}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Nave / Viaje</p>
                          <p className="text-[10px] font-bold text-slate-900">{MOCK_CONTAINER.vessel} / {MOCK_CONTAINER.voyage}</p>
                       </div>
                       <div className="col-span-2 space-y-1">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Transporte</p>
                          <p className="text-[10px] font-bold text-slate-900">{MOCK_CONTAINER.transport.truckPlate} | {MOCK_CONTAINER.transport.driverName}</p>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest line-clamp-3 leading-relaxed">
                        {localEir.footerNotes || 'Términos y condiciones legales para la recepción de contenedores y carga suelta en terminal de depósito...'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 flex items-start gap-4">
                     <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                     <p className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">
                       Los cambios realizados aquí se verán reflejados automáticamente en todos los comprobantes emitidos desde el módulo de recepción.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTÓN GUARDAR TODO */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
          <button 
            onClick={handleSaveAll}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-2xl hover:-translate-y-1 active:translate-y-0.5"
          >
            <Save size={24} /> Guardar Configuraciones
          </button>
        </div>
      </div>

      {/* MODAL VISTA PREVIA COMPLETA */}
      {showFullPreview && (
        <EirReceipt 
          container={MOCK_CONTAINER}
          config={localEir}
          onClose={() => setShowFullPreview(false)}
        />
      )}

      {/* MENSAJE EMERGENTE: "Muy Bien Hecho" */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowSuccess(false)}></div>
          <div className="bg-white p-14 rounded-[3rem] shadow-2xl relative z-10 flex flex-col items-center gap-10 transform animate-in zoom-in-95 duration-500 border border-slate-100 max-w-sm w-full mx-4">
            <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner relative">
              <Check size={56} className="animate-in zoom-in-50 duration-700" />
            </div>
            
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">¡Muy Bien Hecho!</h3>
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed">La configuración operativa y documental se ha actualizado exitosamente</p>
            </div>

            <button 
              onClick={() => setShowSuccess(false)}
              className="px-14 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EirInput = ({ label, icon, value, onChange }: { label: string, icon: any, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        {icon}
      </div>
      <input 
        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Ingrese ${label.toLowerCase()}...`}
      />
    </div>
  </div>
);

const DimensionInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
  <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-all group shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
        <Hash size={18} />
      </div>
      <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{label}</p>
    </div>
    <div className="flex items-center gap-4">
      <button 
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 font-black text-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
      >
        -
      </button>
      <span className="w-10 text-center font-black text-2xl text-slate-900 font-mono">{value}</span>
      <button 
        onClick={() => onChange(value + 1)}
        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 font-black text-xl hover:bg-green-50 hover:text-green-600 transition-all shadow-sm"
      >
        +
      </button>
    </div>
  </div>
);

export default Settings;
