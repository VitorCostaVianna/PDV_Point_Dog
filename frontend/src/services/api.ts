import axios from 'axios';
import type { VendaDTO } from '../types';


const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const finalizarVenda = async (dados: VendaDTO) => {
  const response = await api.post('/vendas', dados);
  return response.data;
};

export const imprimirVenda = async (id: number) => {
  await api.post(`/vendas/${id}/imprimir`);
};

export const buscarProdutos = async () => {
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