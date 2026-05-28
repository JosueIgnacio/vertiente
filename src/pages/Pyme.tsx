import {
  BarChart2,
  FileText,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Building2,
  TrendingDown,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';

const SERVICIOS = [
  {
    icon: <BarChart2 className="w-6 h-6" />,
    titulo: 'TCO por vehículo o grupo',
    desc: 'Analizamos cada segmento de tu flota: furgones, sedanes, camionetas. Te mostramos dónde conviene el cambio primero y dónde esperar.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    titulo: 'Evaluación de infraestructura de carga',
    desc: 'Revisamos la factibilidad técnica y eléctrica de tu instalación actual. Entregamos recomendación de solución de carga a medida.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    titulo: 'Informe personalizado',
    desc: 'Documento ejecutivo con todos los supuestos, cálculos, recomendaciones de modelos y plan de implementación por etapas.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    titulo: '1 a 2 reuniones de acompañamiento',
    desc: 'Presentamos el informe a tu equipo directivo y respondemos dudas técnicas, financieras y operacionales en reunión por videollamada.',
  },
];

const STATS = [
  { label: 'Ahorro promedio flota', value: '35–55%', sublabel: 'en costos operacionales vs combustión' },
  { label: 'ROI típico', value: '3–5 años', sublabel: 'punto de equilibrio para flotas urbanas' },
  { label: 'Reducción CO₂', value: '~70%', sublabel: 'en emisiones directas del vehículo' },
];

const FAQS = [
  {
    q: '¿Para cuántos vehículos aplica?',
    a: 'El diagnóstico base cubre flotas de 2 a 20 vehículos. Para flotas mayores, cotizamos por escala.',
  },
  {
    q: '¿Cuánto demora el diagnóstico?',
    a: 'Entregamos el informe en 5–7 días hábiles desde que recibimos los datos de tu flota.',
  },
  {
    q: '¿El diagnóstico me obliga a comprar algo?',
    a: 'No. Es un análisis independiente. No somos distribuidores de vehículos ni instaladores.',
  },
  {
    q: '¿Qué datos necesitan de mi empresa?',
    a: 'Consumo mensual de combustible por vehículo, km recorridos, tipo de uso y ubicación de la flota.',
  },
];

export default function Pyme() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero Pyme ── */}
        <section
          className="relative overflow-hidden py-20"
          style={{
            background: 'linear-gradient(135deg, #0F3D2E 0%, #16553A 50%, #1A6B47 100%)',
          }}
        >
          {/* Textura sutil */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 60px)',
            }}
          />

          <Container>
            <div className="relative max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-[#FACC15]" />
                <Badge
                  className="bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/30"
                >
                  Para empresas y pymes
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                Electrifica tu flota<br />
                <span className="text-[#4ADE80]">con números reales</span>
              </h1>

              <p className="text-white/75 text-lg max-w-xl mb-6 leading-relaxed">
                Diagnóstico profesional de tu flota vehicular. Te decimos exactamente cuánto ahorras, qué vehículos conviene cambiar primero y cómo hacerlo sin interrumpir la operación.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white">
                  <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">Precio diagnóstico base</p>
                  <p className="text-3xl font-extrabold">$99.990</p>
                  <p className="text-xs text-white/60 mt-1">Flota de 2–5 vehículos · Informe + 2 reuniones</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/diagnostico-pyme')}
                  className="bg-[#FACC15] text-[#0F3D2E] font-semibold px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-yellow-300 transition-colors cursor-pointer text-sm"
                >
                  Solicitar diagnóstico pyme
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Stats ── */}
        <section className="py-14 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {STATS.map((s, i) => (
                <StatCard
                  key={i}
                  label={s.label}
                  value={s.value}
                  sublabel={s.sublabel}
                  accent={i === 0}
                  icon={i === 0 ? <TrendingDown className="w-5 h-5" /> : i === 1 ? <BarChart2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                />
              ))}
            </div>
            <p className="text-xs text-[#9CA3AF] text-center mt-4">
              * Promedios referenciales para flotas urbanas. Tu diagnóstico tendrá los números exactos para tu caso.
            </p>
          </Container>
        </section>

        {/* ── Qué incluye ── */}
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-10">
              <Badge variant="verde" className="mb-4">¿Qué incluye el diagnóstico?</Badge>
              <h2 className="text-3xl font-bold text-[#0F3D2E]">Todo lo que necesitas para decidir</h2>
              <p className="text-[#6B7280] mt-2 max-w-md mx-auto text-sm">
                Sin letra chica. Sin compromisos de compra. Solo análisis independiente y honesto.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {SERVICIOS.map((s, i) => (
                <Card key={i} hover padding="md" className="flex flex-col gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#111827] mb-1">{s.titulo}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{s.desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Checklist */}
            <div
              className="rounded-2xl p-8 flex flex-col sm:flex-row items-start gap-8"
              style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}
            >
              <div className="flex-1">
                <h3 className="font-bold text-[#0F3D2E] text-lg mb-4">
                  El diagnóstico también incluye
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Análisis de rutas y autonomía necesaria',
                    'Comparativa de modelos disponibles en Chile',
                    'Estimación de costos de instalación de carga',
                    'Revisión de opciones de financiamiento y leasing',
                    'Cálculo de impacto en huella de carbono',
                    'Resumen ejecutivo para gerencia',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#374151]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 flex flex-col items-start gap-3">
                <div className="bg-white rounded-xl border border-[#BBF7D0] p-5 text-center">
                  <p className="text-3xl font-extrabold text-[#0F3D2E]">$99.990</p>
                  <p className="text-xs text-[#6B7280] mt-1">Flota 2–5 vehículos</p>
                  <div className="mt-3 border-t border-[#E5E7EB] pt-3">
                    <p className="text-sm font-semibold text-[#374151]">$149.990</p>
                    <p className="text-xs text-[#6B7280]">Flota 6–20 vehículos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/diagnostico-pyme')}
                  className="w-full bg-[#16A34A] text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#15803D] transition-colors cursor-pointer text-sm"
                >
                  Solicitar ahora
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Container>
        </section>

        {/* ── FAQs ── */}
        <section className="py-16 bg-[#F9FAFB]">
          <Container narrow>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-[#0F3D2E] mb-2">Preguntas frecuentes</h2>
              <p className="text-sm text-[#6B7280]">Lo que nos preguntan antes de contratar</p>
            </div>
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <Card key={i} padding="md">
                  <h3 className="font-semibold text-[#111827] text-sm mb-1.5">{faq.q}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{faq.a}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* ── CTA final ── */}
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-3xl font-bold text-[#0F3D2E] mb-3">
                ¿Listo para evaluar tu flota?
              </h2>
              <p className="text-[#6B7280] mb-8 text-sm leading-relaxed">
                En menos de una semana tienes el análisis completo para presentarle a tu gerencia. Sin compromisos de compra, con números reales.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/diagnostico-pyme')}
                  className="bg-[#0F3D2E] text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0a2d22] transition-colors cursor-pointer"
                >
                  Solicitar diagnóstico pyme
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Button variant="outline" size="lg" onClick={() => navigate('/simulador')}>
                  Primero quiero simular
                </Button>
              </div>
            </div>
          </Container>
        </section>

      </main>

      <Footer />
    </div>
  );
}
