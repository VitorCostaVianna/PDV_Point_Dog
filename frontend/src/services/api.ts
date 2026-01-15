import axios from 'axios';
import type { VendaDTO } from '../types';


const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const finalizarVenda = async (dados: VendaDTO) => {
  const response = await api.post('/vendas', dados);
  return response.data;
};

// NOVA FUNÇÃO
export const imprimirVenda = async (id: number) => {
  await api.post(`/vendas/${id}/imprimir`);
};

// Futuramente você criará os endpoints GET no Java para preencher estas listas
export const buscarProdutos = async () => {
    // Por enquanto retorna vazio se o endpoint não existir, para não travar a tela
    try {
        const response = await api.get('/produtos'); 
        return response.data;
    } catch (e) {
        return [];
    }
};

export const buscarClientes = async () => {
    try {
        const response = await api.get('/clientes');
        return response.data;
    } catch (e) {
        return [];
    }
};

export const buscarHistoricoCliente = async (clienteId: number) => {
    try {
        const response = await api.get(`/clientes/${clienteId}/historico`);
        return response.data;
    } catch (e) {
        console.error("Erro ao buscar histórico", e);
        return [];
    }
};

export default api;