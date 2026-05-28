import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import type { ComprobantePayload } from './Analisis';
import { formatCLP, formatCLPMillon } from '../lib/format';

// ── Tipo pyme ─────────────────────────────────────────────────────────────────

interface ComprobantePayloadPyme {
  folio: string;
  fecha: string;
  empresa: string;
  contactoNombre: string;
  contactoEmail: string;
  tipo: 'banco' | 'proveedor';
  entidad: { nombre: string; linea?: string; casilla: string };
  montoProyecto: number;
  totalVehiculos?: number;
  lineas: { descripcion: string; cantidad: number; monto?: number }[];
}

type AnyPayload = ComprobantePayload | ComprobantePayloadPyme;

function isPymePayload(p: AnyPayload): p is ComprobantePayloadPyme {
  return 'empresa' in p;
}

// ── Decodificación del payload ────────────────────────────────────────────────

function decodePayload(encoded: string): AnyPayload {
  // Invertir encodeURIComponent + btoa aplicados en encodePayload
  const json = decodeURIComponent(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
  return JSON.parse(json) as AnyPayload;
}

// ── Generador de PDF ──────────────────────────────────────────────────────────

function descargarPDF(data: ComprobantePayload) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210; // ancho A4 mm

  // Membrete
  doc.setFillColor(15, 61, 46);   // #0F3D2E
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('evmarket', 16, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprobante de interés en vehículo eléctrico', 16, 20);
  doc.text(`Folio: ${data.folio}`, W - 16, 12, { align: 'right' });
  doc.text(`Fecha: ${data.fecha}`, W - 16, 20, { align: 'right' });

  // Línea separadora
  doc.setDrawColor(200, 200, 200);
  let y = 36;

  // Sección cliente
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', 16, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Nombre: ${data.nombre}`, 16, y); y += 5;
  if (data.email) { doc.text(`Email: ${data.email}`, 16, y); y += 5; }

  y += 4;
  doc.line(16, y, W - 16, y);
  y += 6;

  // Sección proveedor
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PROVEEDOR', 16, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Nombre: ${data.proveedor.nombre}`, 16, y); y += 5;
  doc.text(`Teléfono: ${data.proveedor.telefono}`, 16, y); y += 5;
  doc.text(`Correo: ${data.proveedor.correo}`, 16, y); y += 5;
  doc.text(`Asunto: ${data.proveedor.leadCasilla}`, 16, y); y += 5;

  y += 4;
  doc.line(16, y, W - 16, y);
  y += 6;

  // Tabla productos
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('MODELOS DE INTERÉS', 16, y);
  y += 5;

  // Cabecera tabla
  doc.setFillColor(240, 253, 244);
  doc.rect(16, y - 1, W - 32, 8, 'F');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(8);
  doc.text('Marca', 18, y + 4);
  doc.text('Modelo', 50, y + 4);
  doc.text('Carrocería', 90, y + 4);
  doc.text('Precio', W - 20, y + 4, { align: 'right' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  data.productos.forEach((prod) => {
    doc.setTextColor(30, 30, 30);
    doc.text(prod.marca,      18,      y);
    doc.text(prod.modelo,     50,      y);
    doc.text(prod.carroceria, 90,      y);
    doc.text(formatCLPMillon(prod.precio), W - 20, y, { align: 'right' });
    y += 7;
    doc.setDrawColor(220, 220, 220);
    doc.line(16, y - 2, W - 16, y - 2);
  });

  y += 8;

  // Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Comprobante referencial. No constituye contrato de compraventa. Las cotizaciones definitivas son emitidas por el proveedor.',
    16, y, { maxWidth: W - 32 }
  );

  doc.save('comprobante-evmarket.pdf');
}

// ── PDF pyme ──────────────────────────────────────────────────────────────────

function descargarPDFPyme(data: ComprobantePayloadPyme) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;

  // Membrete
  doc.setFillColor(15, 61, 46);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('evmarket', 16, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    data.tipo === 'banco'
      ? 'Comprobante de interés en financiamiento verde'
      : 'Comprobante de interés en vehículos eléctricos — Pyme',
    16, 20,
  );
  doc.text(`Folio: ${data.folio}`, W - 16, 12, { align: 'right' });
  doc.text(`Fecha: ${data.fecha}`, W - 16, 20, { align: 'right' });

  let y = 38;
  doc.setDrawColor(200, 200, 200);

  // Empresa
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPRESA', 16, y); y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Nombre: ${data.empresa}`, 16, y); y += 5;
  if (data.contactoNombre) { doc.text(`Contacto: ${data.contactoNombre}`, 16, y); y += 5; }
  if (data.contactoEmail) { doc.text(`Email: ${data.contactoEmail}`, 16, y); y += 5; }
  y += 3;
  doc.line(16, y, W - 16, y); y += 6;

  // Entidad (banco o proveedor)
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text(data.tipo === 'banco' ? 'BANCO' : 'PROVEEDOR', 16, y); y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Nombre: ${data.entidad.nombre}`, 16, y); y += 5;
  if (data.entidad.linea) { doc.text(`Línea: ${data.entidad.linea}`, 16, y); y += 5; }
  doc.text(`Casilla: ${data.entidad.casilla}`, 16, y); y += 5;
  y += 3;
  doc.line(16, y, W - 16, y); y += 6;

  // Líneas del proyecto
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DEL PROYECTO', 16, y); y += 5;

  // Cabecera tabla
  doc.setFillColor(240, 253, 244);
  doc.rect(16, y - 1, W - 32, 8, 'F');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(8);
  doc.text('Descripción', 18, y + 4);
  doc.text('Cant.', 140, y + 4);
  doc.text('Valor', W - 20, y + 4, { align: 'right' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  let totalMonto = 0;
  data.lineas.forEach((l) => {
    doc.setTextColor(30, 30, 30);
    doc.text(l.descripcion.substring(0, 55), 18, y);
    doc.text(l.cantidad.toString(), 140, y);
    const monto = l.monto ?? 0;
    totalMonto += monto * l.cantidad;
    doc.text(monto > 0 ? formatCLPMillon(monto) : '—', W - 20, y, { align: 'right' });
    y += 7;
    doc.setDrawColor(220, 220, 220);
    doc.line(16, y - 2, W - 16, y - 2);
  });

  // Total
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 61, 46);
  doc.text('Monto total del proyecto:', 16, y);
  doc.text(formatCLP(data.montoProyecto), W - 20, y, { align: 'right' });
  y += 10;

  // Disclaimer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Comprobante referencial. No constituye contrato de compraventa ni oferta formal de financiamiento. Las cotizaciones definitivas son emitidas por la entidad correspondiente.',
    16, y, { maxWidth: W - 32 },
  );

  doc.save(`comprobante-pyme-evmarket-${data.folio}.pdf`);
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function Comprobante() {
  const [params] = useSearchParams();
  const encoded = params.get('d');

  if (!encoded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#111827] mb-2">Comprobante no encontrado</p>
          <p className="text-sm text-[#6B7280]">El enlace no contiene datos válidos.</p>
        </div>
      </div>
    );
  }

  let data: AnyPayload;
  try {
    data = decodePayload(encoded);
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#111827] mb-2">Error al leer el comprobante</p>
          <p className="text-sm text-[#6B7280]">Los datos del QR no pudieron decodificarse. Intenta escanear el QR nuevamente.</p>
        </div>
      </div>
    );
  }

  // ── Vista pyme ─────────────────────────────────────────────────────────────
  if (isPymePayload(data)) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-10 px-4">
        <div className="max-w-lg mx-auto">

          {/* Membrete */}
          <div className="bg-[#0F3D2E] rounded-2xl px-6 py-5 mb-6 flex items-start justify-between">
            <div>
              <p className="text-white font-bold text-xl">evmarket</p>
              <p className="text-[#A7F3D0] text-xs mt-0.5">
                {data.tipo === 'banco'
                  ? 'Comprobante de interés en financiamiento verde'
                  : 'Comprobante de interés en vehículos eléctricos — Pyme'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-sm font-bold">{data.folio}</p>
              <p className="text-[#A7F3D0] text-xs mt-0.5">{data.fecha}</p>
            </div>
          </div>

          {/* Empresa */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">Empresa</p>
            <p className="text-sm font-semibold text-[#111827]">{data.empresa}</p>
            {data.contactoNombre && (
              <p className="text-xs text-[#6B7280] mt-0.5">Contacto: {data.contactoNombre}</p>
            )}
            {data.contactoEmail && (
              <p className="text-xs text-[#6B7280]">{data.contactoEmail}</p>
            )}
          </div>

          {/* Entidad */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">
              {data.tipo === 'banco' ? 'Banco' : 'Proveedor'}
            </p>
            <p className="text-sm font-semibold text-[#111827]">{data.entidad.nombre}</p>
            {data.entidad.linea && (
              <p className="text-xs text-[#6B7280] mt-0.5">{data.entidad.linea}</p>
            )}
            <div className="mt-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-1.5">
              <p className="text-[10px] text-[#9CA3AF]">Casilla de contacto</p>
              <p className="text-xs text-[#374151] font-medium break-all">{data.entidad.casilla}</p>
            </div>
          </div>

          {/* Líneas */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-3">
              Detalle del proyecto
            </p>
            <div className="flex flex-col gap-2">
              {data.lineas.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 bg-[#F9FAFB] rounded-xl px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#111827]">{l.descripcion}</p>
                    <p className="text-[10px] text-[#6B7280]">Cant.: {l.cantidad}</p>
                  </div>
                  {l.monto !== undefined && (
                    <p className="text-sm font-bold text-[#0F3D2E] shrink-0">
                      {formatCLPMillon(l.monto)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E7EB]">
              <span className="text-xs font-semibold text-[#374151]">Monto total del proyecto</span>
              <span className="text-base font-bold text-[#0F3D2E]">
                {formatCLP(data.montoProyecto)}
              </span>
            </div>
          </div>

          {/* Botón PDF */}
          <button
            onClick={() => descargarPDFPyme(data as ComprobantePayloadPyme)}
            className="w-full flex items-center justify-center gap-2 bg-[#0F3D2E] hover:bg-[#16A34A] text-white font-semibold py-3.5 rounded-2xl transition-colors shadow-sm text-sm mb-4 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar comprobante PDF
          </button>

          {/* Disclaimer */}
          <p className="text-[10px] text-[#9CA3AF] text-center leading-relaxed">
            Comprobante referencial. No constituye contrato de compraventa ni oferta formal de
            financiamiento. Las cotizaciones definitivas son emitidas por la entidad correspondiente.
          </p>

        </div>
      </div>
    );
  }

  // ── Vista persona natural (sin cambios) ────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Membrete */}
        <div className="bg-[#0F3D2E] rounded-2xl px-6 py-5 mb-6 flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-xl">evmarket</p>
            <p className="text-[#A7F3D0] text-xs mt-0.5">Comprobante de interés en vehículo eléctrico</p>
          </div>
          <div className="text-right">
            <p className="text-white font-mono text-sm font-bold">{data.folio}</p>
            <p className="text-[#A7F3D0] text-xs mt-0.5">{data.fecha}</p>
          </div>
        </div>

        {/* Cliente */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">Cliente</p>
          <p className="text-sm font-semibold text-[#111827]">{data.nombre}</p>
          {data.email && <p className="text-xs text-[#6B7280] mt-0.5">{data.email}</p>}
        </div>

        {/* Proveedor */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">Proveedor</p>
          <p className="text-sm font-semibold text-[#111827]">{data.proveedor.nombre}</p>
          <p className="text-xs text-[#6B7280] mt-1">{data.proveedor.telefono}</p>
          <p className="text-xs text-[#6B7280]">{data.proveedor.correo}</p>
          <div className="mt-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-1.5">
            <p className="text-[10px] text-[#9CA3AF]">Asunto del mensaje</p>
            <p className="text-xs text-[#374151] font-medium">{data.proveedor.leadCasilla}</p>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-3">Modelos de interés</p>
          <div className="flex flex-col gap-2">
            {data.productos.map((prod, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-[#F9FAFB] rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111827]">{prod.marca} {prod.modelo}</p>
                  <p className="text-[10px] text-[#6B7280]">{prod.carroceria}</p>
                </div>
                <p className="text-sm font-bold text-[#0F3D2E] shrink-0">{formatCLPMillon(prod.precio)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botón PDF */}
        <button
          onClick={() => descargarPDF(data as ComprobantePayload)}
          className="w-full flex items-center justify-center gap-2 bg-[#0F3D2E] hover:bg-[#16A34A] text-white font-semibold py-3.5 rounded-2xl transition-colors shadow-sm text-sm mb-4 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Descargar comprobante PDF
        </button>

        {/* Disclaimer */}
        <p className="text-[10px] text-[#9CA3AF] text-center leading-relaxed">
          Comprobante referencial. No constituye contrato de compraventa.
          Las cotizaciones definitivas son emitidas por el proveedor.
        </p>

      </div>
    </div>
  );
}
