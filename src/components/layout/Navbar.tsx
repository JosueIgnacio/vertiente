import { Link, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import Container from './Container';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-[#0F3D2E] font-semibold' : 'text-[#374151] hover:text-[#0F3D2E]';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="no-underline">
            <Logo size="md" />
          </Link>

          {/* Links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              to="/simulador"
              className={`text-sm transition-colors duration-150 no-underline ${isActive('/simulador')}`}
            >
              Simulador
            </Link>
            <Link
              to="/pyme"
              className={`text-sm transition-colors duration-150 no-underline ${isActive('/pyme')}`}
            >
              Empresas
            </Link>
          </div>

          {/* CTA */}
          <Link to="/simulador">
            <Button size="sm" variant="primary">
              Realiza tu diagnóstico
            </Button>
          </Link>
        </nav>
      </Container>
    </header>
  );
}
