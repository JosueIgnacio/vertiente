import { Link } from 'react-router-dom';
import {
  Plug,
  Car,
  Wrench,
  CreditCard,
  Users,
  Download,
  MessageSquare,
  Bookmark,
  Building2,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const PASOS = [
  {
    num: 1,
    icon: <Plug className="w-5 h-5" />,
    titulo: 'Validar factibilidad de carga',
    desc: 'Verifica si tu vivienda o empresa puede instalar un cargador. Revisa la capacidad del tablero eléctrico y las condiciones del estacionamiento.',
    detalle: [
      'Consulta con tu administrador si vives en edificio',
      'Revisa la capacidad del empalme eléctrico (mínimo 5,75 kW recomendado)',
      'Considera un cargador Nivel 2 (7–11 kW) para carga nocturna eficiente',
    ],
    estado: 'activo',
    badge: 'Primer paso crítico',
    badgeVariant: 'verde' as const,
  },
  {
    num: 2,
    icon: <Car className="w-5 h-5" />,
    titulo: 'Comparar modelos eléctricos recomendados',
    desc: 'Con tu perfil de uso definido, evalúa qué modelo se ajusta mejor a tu presupuesto, autonomía necesaria y disponibilidad de servicio técnico.',
    detalle: [
      'BYD Dolphin y ORA 03: mejor relación precio/autonomía para ciudad',
      'MG 4: opción con mayor autonomía para uso mixto ciudad/carretera',
      'Verifica disponibilidad de repuestos y red de talleres autorizados',
    ],
    estado: 'pendiente',
    badge: 'Recomendado',
    badgeVariant: 'verde' as const,
  },
  {
    num: 3,
    icon: <Wrench className="w-5 h-5" />,
    titulo: 'Cotizar instalación del cargador',
    desc: 'Una instalación domiciliaria tipo Wall Box en Chile oscila entre $600.000 y $1.200.000. Incluye instalación eléctrica y el equipo.',
    detalle: [
      'Solicita al menos 3 cotizaciones a instaladores certificados SEC',
      'Verifica que incluya certificación eléctrica y garantía de instalación',
      'Pregunta por subsidios disponibles (revisar CORFO y Minenergia)',
    ],
    estado: 'pendiente',
    badge: '$600K – $1,2M referencial',
    badgeVariant: 'amarillo' as const,
  },
  {
    num: 4,
    icon: <CreditCard className="w-5 h-5" />,
    titulo: 'Evaluar financiamiento, leasing o renting',
    desc: 'Hay alternativas que mejoran el flujo de caja y permiten acceder a un VE sin desembolso inicial alto. El renting puede incluir mantención.',
    detalle: [
      'Crédito automotriz bancario: tasas entre 0,7% – 1,2% mensual',
      'Leasing: opción recomendada para empresas con implicancias tributarias',
      'Renting operativo: incluye mantención, seguro y cargador en cuota',
    ],
    estado: 'pendiente',
    badge: 'Para empresas: evalúa leasing',
    badgeVariant: 'gris' as const,
  },
  {
    num: 5,
    icon: <Users className="w-5 h-5" />,
    titulo: 'Conectar con proveedores y dar el salto',
    desc: 'Con toda la información clara, es el momento de contactar distribuidores, cotizar en firme y programar la transición.',
    detalle: [
      'Solicita test drive y cotización en firme al distribuidor',
      'Coordina instalación del cargador antes de recibir el vehículo',
      'Inscríbete en el registro de vehículos eléctricos del Ministerio de Energía',
    ],
    estado: 'pendiente',
    badge: 'Paso final',
    badgeVariant: 'gris' as const,
  },
];

const CTAS = [
  {
    icon: <Download className="w-5 h-5" />,
    titulo: 'Descargar informe personalizado',
    desc: 'PDF con tu análisis TCO, ruta recomendada y modelos sugeridos',
    precio: '$3.990',
    color: 'border-[#16A34A] bg-[#F0FDF4]',
    textColor: 'text-[#15803D]',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    titulo: 'Solicitar contacto con proveedor',
    desc: 'Te conectamos con distribuidores e instaladores verificados en tu región',
    precio: 'Gratis',
    color: 'border-[#0F3D2E] bg-[#F0FDF4]',
    textColor: 'text-[#0F3D2E]',
  },
  {
    icon: <Bookmark className="w-5 h-5" />,
    titulo: 'Guardar mi simulación',
    desc: 'Recibe tu análisis por correo para revisarlo cuando quieras',
    precio: 'Gratis',
    color: 'border-[#E5E7EB]',
    textColor: 'text-[#374151]',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    titulo: 'Quiero asesoría pyme',
    desc: 'Diagnóstico completo para tu flota con informe y acompañamiento',
    precio: 'Desde $99.990',
    color: 'border-[#FACC15] bg-[#FEFCE8]',
    textColor: 'text-[#92400E]',
  },
];

export default function Ruta() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-1 py-10">
        <Container>

          {/* Header */}
          <div className="mb-10">
            <Link to="/resultado" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#0F3D2E] mb-4 transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" />
              Volver a mi resultado
            </Link>
            <Badge variant="verde" className="mb-3">Tu ruta recomendada</Badge>
            <h1 className="text-3xl font-bold text-[#0F3D2E] mb-2">
              Próximos pasos para dar el salto
            </h1>
            <p className="text-[#6B7280] max-w-xl">
              Una ruta clara y ordenada basada en tu perfil. Sin improvisación, sin sorpresas.
            </p>
          </div>

          {/* Pasos */}
          <div className="flex flex-col gap-4 mb-14">
            {PASOS.map((paso, i) => (
              <div key={i} className="flex gap-4 items-start">
                {/* Línea vertical + círculo */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center shrink-0
                      ${paso.estado === 'activo'
                        ? 'bg-[#0F3D2E] text-white'
                        : 'bg-white border-2 border-[#E5E7EB] text-[#9CA3AF]'
                      }
                    `}
                  >
                    {paso.icon}
                  </div>
                  {i < PASOS.length - 1 && (
                    <div className="w-0.5 h-8 bg-[#E5E7EB] mt-1" />
                  )}
                </div>

                {/* Contenido */}
                <Card
                  hover
                  className={`flex-1 mb-0 ${paso.estado === 'activo' ? 'border-[#16A34A]' : ''}`}
                  padding="md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
                        Paso {paso.num}
                      </span>
                      <Badge variant={paso.badgeVariant}>{paso.badge}</Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#111827] text-base mb-1">{paso.titulo}</h3>
                  <p className="text-sm text-[#6B7280] mb-3 leading-relaxed">{paso.desc}</p>
                  <ul className="flex flex-col gap-1">
                    {paso.detalle.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-[#374151]">
                        <ChevronRight className="w-3 h-3 text-[#16A34A] shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#0F3D2E] mb-2">¿Qué quieres hacer ahora?</h2>
            <p className="text-sm text-[#6B7280] mb-6">Elige la siguiente acción que mejor se adapte a tu momento.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CTAS.map((cta, i) => (
                <button
                  key={i}
                  type="button"
                  className={`
                    text-left rounded-2xl border p-5 cursor-pointer
                    transition-all duration-150
                    hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)]
                    hover:-translate-y-0.5
                    ${cta.color}
                  `}
                >
                  <div className={`flex items-center gap-2 mb-2 ${cta.textColor}`}>
                    {cta.icon}
                    <span className="font-semibold text-sm">{cta.titulo}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">{cta.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${cta.textColor}`}>{cta.precio}</span>
                    <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
