import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { buscarClientes, buscarHistoricoCliente } from '../services/api';
import { Search, User, Phone, MapPin, ShoppingBag, Calendar } from 'lucide-react';
import type { Cliente } from '../types';

export function Clientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [busca, setBusca] = useState('');
    const [selecionado, setSelecionado] = useState<Cliente | null>(null);
    const [historico, setHistorico] = useState<any[]>([]);

    useEffect(() => {
        carregarClientes();
    }, []);

    // Quando seleciona um cliente, busca o histórico dele
    useEffect(() => {
        if (selecionado && selecionado.id) {
            buscarHistoricoCliente(selecionado.id).then(setHistorico);
        } else {
            setHistorico([]);
        }
    }, [selecionado]);

    async function carregarClientes() {
        const dados = await buscarClientes();
        setClientes(dados);
    }

    // Filtro de busca
    const clientesFiltrados = clientes.filter(c => 
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.telefone?.includes(busca)
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />

            {/* === COLUNA 1: LISTA DE CLIENTES === */}
            <div className="w-1/3 bg-white border-r flex flex-col">
                <div className="p-6 border-b bg-gray-50">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="text-blue-600"/> Clientes
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                        <input 
                            className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Buscar por nome ou telefone..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {clientesFiltrados.map(cliente => (
                        <div 
                            key={cliente.id}
                            onClick={() => setSelecionado(cliente)}
                            className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${
                                selecionado?.id === cliente.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                            }`}
                        >
                            <p className="font-bold text-gray-800">{cliente.nome}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone size={12}/> {cliente.telefone}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* === COLUNA 2: DETALHES E HISTÓRICO === */}
            <div className="flex-1 p-8 overflow-y-auto">
                {selecionado ? (
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Cartão de Info do Cliente */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-500">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">{selecionado.nome}</h2>
                            <div className="grid grid-cols-2 gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Phone className="text-blue-500"/>
                                    <span className="text-lg">{selecionado.telefone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="text-red-500"/>
                                    <span className="text-lg">{selecionado.endereco}</span>
                                </div>
                            </div>
                        </div>

                        {/* Histórico */}
                        <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <ShoppingBag /> Histórico de Pedidos ({historico.length})
                        </h3>

                        <div className="space-y-4">
                            {historico.map((pedido) => (
                                <div key={pedido.id} className="bg-white rounded-lg shadow border overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-lg text-blue-900">Pedido #{pedido.id}</span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar size={14}/> 
                                                {new Date(pedido.dataHora).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <span className="font-bold text-green-600 text-xl">
                                            R$ {pedido.total.toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    <div className="p-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-400">
                                                    <th className="pb-2">Produto / Serviço</th>
                                                    <th className="pb-2">Qtd</th>
                                                    <th className="pb-2 text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedido.itens.map((item: any) => (
                                                    <tr key={item.id} className="border-b last:border-0">
                                                        <td className="py-2">{item.produto.nome}</td>
                                                        <td className="py-2">{item.quantidade}</td>
                                                        <td className="py-2 text-right">
                                                            R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                            
                            {historico.length === 0 && (
                                <p className="text-gray-400 text-center py-10 bg-white rounded-lg border border-dashed">
                                    Nenhuma compra realizada ainda.
                                </p>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center text-gray-400 opacity-50">
                        <User size={100} className="mb-4"/>
                        <p className="text-2xl">Selecione um cliente para ver o histórico</p>
                    </div>
                )}
            </div>
        </div>
    );
}