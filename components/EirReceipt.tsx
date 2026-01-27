
import React from 'react';
import { Container, EirConfig } from '../types';
import { Printer, X, ShieldCheck, MapPin, Truck, Package, Anchor, CheckCircle2, FileDown } from 'lucide-react';

interface EirReceiptProps {
  container: Container;
  config: EirConfig;
  onClose: () => void;
}

const EirReceipt: React.FC<EirReceiptProps> = ({ container, config, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('eir-printable');
    if (!element) return;
    
    const options = {
      margin: 10,
      filename: `EIR_${container.id}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(options).from(element).save();
    } else {
      console.error("La librería html2pdf no está cargada.");
      alert("Error al generar PDF: La librería de descarga no se pudo cargar. Por favor use la opción de imprimir.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col my-8 print:m-0 print:shadow-none print:rounded-none">
        {/* Barra de Herramientas (No se imprime) */}
        <header className="px-8 py-5 bg-slate-900 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Comprobante de Recepción</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Operativo: {container.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <FileDown size={16} /> Descargar PDF
            </button>
            <button 
              onClick={handlePrint}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Printer size={16} /> Imprimir
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        {/* Contenido del Documento (EIR) */}
        <div className="p-12 space-y-10 print:p-8" id="eir-printable">
          {/* Cabecera Empresa */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
            <div className="flex items-start gap-6">
              {config.logoUrl && (
                <img src={config.logoUrl} alt="Logo" className="h-16 w-auto object-contain print:h-12" />
              )}
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase print:text-2xl">{config.companyName}</h1>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{config.companyAddress}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RUT: {config.companyTaxId} | TEL: {config.companyPhone}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">TERMINAL CODE: {config.terminalCode}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 print:text-xl">EIR RECEPCIÓN</h2>
              <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded font-mono font-black text-xl">
                {container.eirNumber || `${config.eirPrefix}-000000`}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest">Fecha: {new Date(container.entryDate).toLocaleString()}</p>
            </div>
          </div>

          {/* Grid de Datos */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-10">
            {/* Sección 1: Contenedor */}
            <div className="space-y-4">
               <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                 <Package size={14} className="text-indigo-600" /> Datos de la Unidad
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Número Sigla" value={container.id} bold />
                  <DetailField label="Tipo / Medida" value={`${container.size} ${container.type}`} />
                  <DetailField label="Línea Naviera" value={container.shippingLine} />
                  <DetailField label="Carga" value={container.loadType} />
                  <DetailField label="Tara (KG)" value={`${container.tare.toLocaleString()} KG`} />
                  <DetailField label="Peso Bruto (KG)" value={`${container.weight.toLocaleString()} KG`} />
               </div>
            </div>

            {/* Sección 2: Logística Marítima */}
            <div className="space-y-4">
               <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                 <Anchor size={14} className="text-indigo-600" /> Logística Marítima
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Nave / Buque" value={container.vessel} />
                  <DetailField label="Viaje" value={container.voyage} />
                  <DetailField label="N° Bill of Lading (BL)" value={container.bl} />
                  <DetailField label="Cliente / Consignatario" value={container.client} />
                  <DetailField label="Guía de Recepción" value={container.receptionNote} />
                  <DetailField label="Condición" value="IN-DEPOT" />
               </div>
            </div>

            {/* Sección 3: Transporte */}
            <div className="space-y-4">
               <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                 <Truck size={14} className="text-indigo-600" /> Información Transporte
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Patente Camión" value={container.transport.truckPlate} bold />
                  <DetailField label="Empresa Transporte" value={container.transport.company} />
                  <DetailField label="Nombre Chofer" value={container.transport.driverName} />
                  <DetailField label="ID Chofer" value={container.transport.driverId} />
               </div>
            </div>

            {/* Sección 4: Ubicación Yard */}
            <div className="space-y-4">
               <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-2">
                 <MapPin size={14} className="text-indigo-600" /> Ubicación en Patio
               </h4>
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posición Baroti</p>
                    <p className="text-3xl font-black text-slate-900 font-mono">
                      {container.location.block}-{container.location.bay}-{container.location.row}-{container.location.tier}
                    </p>
                  </div>
                  <div className="text-right">
                    <ShieldCheck size={32} className="text-green-500 opacity-30" />
                  </div>
               </div>
            </div>
          </div>

          {/* Sección de Validación Digital (En lugar de firmas físicas) */}
          <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Documento validado por sistema de control ZEROHUB</span>
             </div>
             <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">
                Copia electrónica oficial del terminal
             </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-8 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase whitespace-pre-wrap">
              {config.footerNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailField = ({ label, value, bold }: { label: string, value: string | number | undefined, bold?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
    <span className={`text-[11px] uppercase ${bold ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
      {value || 'N/A'}
    </span>
  </div>
);

export default EirReceipt;