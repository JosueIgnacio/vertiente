import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Simulador from './pages/Simulador';
import Resultado from './pages/Resultado';
import Analisis from './pages/Analisis';
import Pyme from './pages/Pyme';
import PymeDiagnostico from './pages/PymeDiagnostico';
import Comprobante from './pages/Comprobante';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulador" element={<Simulador />} />
        <Route path="/resultado" element={<Resultado />} />
        <Route path="/analisis" element={<Analisis />} />
        <Route path="/pyme" element={<Pyme />} />
        <Route path="/diagnostico-pyme" element={<PymeDiagnostico />} />
        <Route path="/comprobante" element={<Comprobante />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
