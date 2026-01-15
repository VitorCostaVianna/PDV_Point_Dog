import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PDV } from './pages/PDV';
import { Clientes } from './pages/Clientes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PDV />} />
        <Route path="/clientes" element={<Clientes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;