import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Container from './Container';

export default function Footer() {
  return (
    <footer className="bg-[#0F3D2E] text-white mt-20">
      <Container>
        <div className="py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Logo size="md" variant="dark" />
            <p className="text-sm text-white/60 max-w-xs">
              tu camino a la electromovilidad
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-6 text-sm text-white/70">
            <Link to="/simulador" className="hover:text-white transition-colors no-underline">
              Simulador
            </Link>
            <Link to="/pyme" className="hover:text-white transition-colors no-underline">
              Empresas y pymes
            </Link>
            <Link to="/ruta" className="hover:text-white transition-colors no-underline">
              Ruta recomendada
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 py-4">
          <p className="text-xs text-white/40 text-center">
            © 2025 evmarket · Datos referenciales, no constituyen asesoría financiera
          </p>
        </div>
      </Container>
    </footer>
  );
}
