import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BarChart2, Map, Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

// ── Sección Hero ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-24">
      {/* Fondo decorativo — degradé verde muy suave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(22,163,74,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Línea curva decorativa */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04]"
        style={{
          background:
            'conic-gradient(from 180deg at 70% 30%, #16A34A, #0F3D2E, #FACC15, #16A34A)',
          borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%',
        }}
      />

      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6 relative">
          {/* Pill badge */}
          <Badge variant="verde" className="text-xs px-4 py-1.5">
            <Zap className="w-3 h-3" />
            electromovilidad sin chamullo
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold text-[#0F3D2E] leading-[1.08] tracking-tight">
            ¿Te conviene cambiarte<br />
            <span className="text-[#16A34A]">a un vehículo eléctrico?</span>
          </h1>

          {/* Sub */}
          <p className="text-lg sm:text-xl text-[#6B7280] max-w-xl leading-relaxed">
            Calcula tu ahorro, compara costos y recibe una ruta simple para dar el salto. Con números reales, sin letras chicas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link to="/simulador">
              <Button size="lg" variant="primary" className="gap-2">
                Calcular mi ahorro
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/pyme">
              <Button size="lg" variant="outline">
                Soy empresa / pyme
              </Button>
            </Link>
          </div>

          {/* Social proof mínimo */}
          <div className="flex items-center gap-6 mt-4 text-sm text-[#9CA3AF]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              Gratis, sin registro
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              Datos reales del mercado chileno
            </span>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="mt-16 max-w-2xl mx-auto relative">
          <div className="bg-[#F9FAFB] rounded-3xl border border-[#E5E7EB] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.07)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-[#9CA3AF]">vertiente — resultado simulación</span>
            </div>
            {/* Mini stat mockup */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Ahorro mensual', value: '$43.125', color: 'text-[#15803D]' },
                { label: 'Ahorro 5 años', value: '$2.587.500', color: 'text-[#0F3D2E]' },
                { label: 'Punto de equilibrio', value: '3,2 años', color: 'text-[#374151]' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-3 border border-[#E5E7EB]">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            {/* Mini chart bars */}
            <div className="h-24 flex items-end gap-1 px-2">
              {[40, 55, 62, 70, 76, 82, 87, 90, 93, 95, 97, 98].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${h * 0.9}%`,
                      background: i < 4 ? '#9CA3AF' : '#16A34A',
                      opacity: 0.7 + i * 0.02,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#9CA3AF] px-2">
              <span>Mes 1</span>
              <span className="text-[#FACC15] font-semibold">◆ Punto equilibrio</span>
              <span>Mes 60</span>
            </div>
          </div>
          {/* Glow */}
          <div
            aria-hidden
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 blur-2xl rounded-full"
            style={{ background: 'rgba(22,163,74,0.15)' }}
          />
        </div>
      </Container>
    </section>
  );
}

// ── Sección Cómo funciona ─────────────────────────────────────────────────────
function ComoFunciona() {
  const pasos = [
    {
      num: '01',
      icon: <Zap className="w-6 h-6" />,
      titulo: 'Ingresa tus datos',
      desc: 'Tu uso actual, cuánto gastas en combustible y qué auto eléctrico te interesa. Tarda menos de 2 minutos.',
    },
    {
      num: '02',
      icon: <BarChart2 className="w-6 h-6" />,
      titulo: 'Compara combustión vs eléctrico',
      desc: 'Te mostramos el costo total real de cada opción en el tiempo, con el punto exacto donde el eléctrico gana.',
    },
    {
      num: '03',
      icon: <Map className="w-6 h-6" />,
      titulo: 'Recibe tu ruta y proveedores',
      desc: 'Un plan de 5 pasos adaptado a tu caso: cargador, financiamiento, y contacto directo con proveedores.',
    },
  ];

  return (
    <section className="py-20 bg-[#F9FAFB]">
      <Container>
        <div className="text-center mb-12">
          <Badge variant="verde" className="mb-4">Cómo funciona</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F3D2E] tracking-tight">
            Simple, claro, sin vueltas
          </h2>
          <p className="text-[#6B7280] mt-3 max-w-md mx-auto">
            Tres pasos para saber si el cambio a eléctrico tiene sentido para ti.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pasos.map((paso, i) => (
            <Card key={i} hover className="relative flex flex-col gap-4">
              {/* Número decorativo */}
              <span
                className="absolute top-4 right-5 text-6xl font-black text-[#0F3D2E] opacity-[0.04] select-none leading-none"
              >
                {paso.num}
              </span>
              {/* Ícono */}
              <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                {paso.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] text-base mb-1">{paso.titulo}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{paso.desc}</p>
              </div>
              {/* Connector arrow (solo en primeros 2) */}
              {i < 2 && (
                <ChevronRight className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D1FAE5] z-10" />
              )}
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link to="/simulador">
            <Button size="lg" variant="primary">
              Empezar ahora — es gratis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}

// ── Sección Pyme ──────────────────────────────────────────────────────────────
function PymeBanner() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0F3D2E 0%, #1A5C44 60%, #16A34A 100%)',
          }}
        >
          {/* Decoración */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)',
            }}
          />

          <div className="relative px-8 py-12 sm:px-14 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FACC15]" />
                <span className="text-[#FACC15] text-sm font-semibold tracking-wide uppercase">
                  Para empresas y pymes
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">
                Diagnóstico de flota<br />desde $99.990
              </h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                Evaluamos cada vehículo de tu flota, calculamos el TCO por grupo, analizamos la factibilidad de carga y te entregamos un informe personalizado con acompañamiento.
              </p>
              <ul className="flex flex-col gap-1.5 mt-1">
                {[
                  'TCO por vehículo o grupo de vehículos',
                  'Evaluación de infraestructura de carga',
                  'Informe personalizado + 2 reuniones de acompañamiento',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0">
              <Link to="/pyme">
                <Button size="lg" className="bg-[#FACC15] text-[#0F3D2E] hover:bg-yellow-300 font-semibold whitespace-nowrap">
                  Solicitar diagnóstico pyme
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Página completa ───────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ComoFunciona />
        <PymeBanner />
      </main>
      <Footer />
    </div>
  );
}
