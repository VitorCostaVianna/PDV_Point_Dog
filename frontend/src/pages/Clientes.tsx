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

    const clientesFiltrados = clientes.filter(c => {
        const termo = busca.toLowerCase().trim();
        
        const matchNome = c.nome.toLowerCase().includes(termo);

        const matchEndereco = c.endereco?.toLowerCase().includes(termo);

        const telClienteLimpo = c.telefone ? c.telefone.replace(/\D/g, '') : '';
        const buscaLimpa = termo.replace(/\D/g, '');
        const matchTelefone = (buscaLimpa.length > 0 && telClienteLimpo.includes(buscaLimpa)) || 
                              (c.telefone && c.telefone.includes(termo));

        return matchNome || matchTelefone || matchEndereco;
    });

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            {}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-[#F28322]"><User /></span> Clientes
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                        <input 
                            className="w-full pl-10 p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-[#F28322] transition-all"
                            placeholder="Nome, Telefone ou Endereço..."
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
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                                selecionado?.id === cliente.id 
                                ? 'bg-orange-50 border-l-4 border-[#F28322]' 
                                : 'hover:bg-gray-50'
                            }`}
                        >
                            <p className="font-bold text-gray-800">{cliente.nome}</p>
                            
                            {}
                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                                <Phone size={12} className={selecionado?.id === cliente.id ? "text-[#F28322]" : "text-gray-400"}/> 
                                {cliente.telefone}
                            </p>

                            {}
                            <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                <MapPin size={10}/> 
                                {cliente.endereco}
                            </p>
                        </div>
                    ))}
                    
                    {clientesFiltrados.length === 0 && (
                        <div className="text-center text-gray-300 mt-10 p-4">
                            <User size={48} className="mx-auto mb-2 opacity-20"/>
                            <p>Nenhum cliente encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* === COLUNA 2: DETALHES E HISTÓRICO === */}
            <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
                {selecionado ? (
                    <div className="max-w-4xl mx-auto">
                        
                        {}
                        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border-t-8 border-[#F28322]">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{selecionado.nome}</h2>
                            <div className="grid grid-cols-2 gap-4 text-gray-600">
                                <div className="flex items-center gap-3 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        <Phone className="text-[#F28322]" size={20}/>
                                    </div>
                                    <span className="text-lg font-medium">{selecionado.telefone}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        <MapPin className="text-[#F28322]" size={20}/>
                                    </div>
                                    <span className="text-lg font-medium">{selecionado.endereco}</span>
                                </div>
                            </div>
                        </div>

                        {/* Histórico */}
                        <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <ShoppingBag className="text-[#F28322]"/> Histórico de Pedidos ({historico.length})
                        </h3>

                        <div className="space-y-4">
                            {historico.map((pedido) => (
                                <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-orange-200 transition-colors">
                                    <div className="bg-[#fff8f2] p-4 border-b border-orange-100 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-lg text-[#F28322]">Pedido #{pedido.id}</span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar size={14}/> 
                                                {new Date(pedido.dataHora).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <span className="font-bold text-gray-800 text-xl">
                                            R$ {pedido.total.toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    <div className="p-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-400">
                                                    <th className="pb-2 font-medium">Produto / Serviço</th>
                                                    <th className="pb-2 font-medium">Qtd</th>
                                                    <th className="pb-2 text-right font-medium">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedido.itens.map((item: any) => (
                                                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                                                        <td className="py-2 text-gray-700">{item.produto.nome}</td>
                                                        <td className="py-2 text-gray-500">{item.quantidade}</td>
                                                        <td className="py-2 text-right font-medium text-gray-700">
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
                                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <ShoppingBag size={48} className="mx-auto mb-3 text-gray-200"/>
                                    <p className="text-gray-400 font-medium">Nenhuma compra realizada ainda.</p>
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center text-gray-300">
                        <User size={100} className="mb-6 opacity-20"/>
                        <p className="text-2xl font-light">Selecione um cliente para ver o histórico</p>
                    </div>
                )}
            </div>
        </div>
    );
}