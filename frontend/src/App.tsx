import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const PDV = lazy(() => import('./pages/PDV').then(module => ({ default: module.PDV })));
const Clientes = lazy(() => import('./pages/Clientes').then(module => ({ default: module.Clientes })));

const Loading = () => (
  <div className="h-screen flex items-center justify-center bg-gray-100 text-gray-400">
    Carregando sistema...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<PDV />} />
          <Route path="/clientes" element={<Clientes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;