import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Simulador from './pages/Simulador';
import Resultado from './pages/Resultado';
import Ruta from './pages/Ruta';
import Pyme from './pages/Pyme';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulador" element={<Simulador />} />
        <Route path="/resultado" element={<Resultado />} />
        <Route path="/ruta" element={<Ruta />} />
        <Route path="/pyme" element={<Pyme />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
