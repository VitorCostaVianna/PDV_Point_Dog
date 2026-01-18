import { useState, useEffect, useRef, useMemo } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Plus, Trash2, Printer, ShoppingCart, UserPlus, X, CheckCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { finalizarVenda, buscarProdutos, buscarClientes, imprimirVenda } from '../services/api';
import type { ItemCarrinho, Produto, Cliente } from '../types';

export function PDV() {
    // === ESTADOS ===
    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [novoClienteDados, setNovoClienteDados] = useState({ nome: '', telefone: '', endereco: '' });
    const [vendaConcluida, setVendaConcluida] = useState<any>(null);
    const [produtoInput, setProdutoInput] = useState<any>(null);
    const [precoInput, setPrecoInput] = useState<number>(0);
    const [qtdInput, setQtdInput] = useState<number>(1);
    const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
    const [listaClientes, setListaClientes] = useState<Cliente[]>([]);

    // Refs
    const precoRef = useRef<HTMLInputElement>(null);
    const qtdRef = useRef<HTMLInputElement>(null);
    const btnAddRef = useRef<HTMLButtonElement>(null);
    const telefoneRef = useRef<HTMLInputElement>(null);

    useEffect(() => { carregarDados(); }, []);

    async function carregarDados() {
        setListaProdutos(await buscarProdutos());
        setListaClientes(await buscarClientes());
    }
    
    const opcoesProdutos = useMemo(() => 
        listaProdutos.map(p => ({ value: p.id, label: p.nome })), 
    [listaProdutos]);

    const opcoesClientes = useMemo(() => 
        listaClientes.map(c => ({ 
            value: c.id, 
            label: c.nome, 
            telefone: c.telefone, 
            endereco: c.endereco 
        })), 
    [listaClientes]);

    // === LÓGICA DO CLIENTE ===
    const handleClienteChange = (newValue: any) => {
        if (newValue && newValue.__isNew__) {
            setNovoClienteDados({ nome: newValue.label, telefone: '', endereco: '' });
            setShowModalCliente(true);
            setTimeout(() => telefoneRef.current?.focus(), 100);
        } else {
            setClienteSelecionado(newValue);
        }
    };

    const salvarNovoClienteLocalmente = () => {
        if (!novoClienteDados.telefone || !novoClienteDados.endereco) {
            alert("Endereço e Telefone são obrigatórios!");
            return;
        }
        const clienteTemp = {
            value: 'new',
            label: novoClienteDados.nome,
            isNew: true,
            ...novoClienteDados
        };
        setClienteSelecionado(clienteTemp);
        setShowModalCliente(false);
    };

    // === LÓGICA DO CARRINHO ===
    const adicionarAoCarrinho = () => {
        if (!produtoInput) return;

        let idProdutoFinal = undefined;

        if (produtoInput.__isNew__) {
            const produtoExistente = listaProdutos.find(
                p => p.nome.toLowerCase().trim() === produtoInput.label.toLowerCase().trim()
            );

            if (produtoExistente) {
                idProdutoFinal = produtoExistente.id;
            } else {
                idProdutoFinal = undefined;
            }
        } else {
            idProdutoFinal = produtoInput.value;
        }

        const novoItem: ItemCarrinho = {
            produtoId: idProdutoFinal,
            nome: produtoInput.label,
            preco: precoInput,
            quantidade: qtdInput,
            total: precoInput * qtdInput
        };

        setCarrinho([...carrinho, novoItem]);
        setProdutoInput(null);
        setPrecoInput(0);
        setQtdInput(1);
    };

    const removerDoCarrinho = (index: number) => {
        const novoCarrinho = [...carrinho];
        novoCarrinho.splice(index, 1);
        setCarrinho(novoCarrinho);
    };

    // === LÓGICA DE FINALIZAR ===
    const handleFinalizar = async () => {
        if (carrinho.length === 0) return alert("Carrinho vazio!");
        if (!clienteSelecionado) return alert("Selecione um cliente para continuar.");

        let idFinalCliente = undefined;

        if (typeof clienteSelecionado.value === 'number') {
            idFinalCliente = clienteSelecionado.value;
        } else {
            const clienteExistente = listaClientes.find(
                c => c.nome.toLowerCase().trim() === clienteSelecionado.label.toLowerCase().trim()
            );

            if (clienteExistente) {
                idFinalCliente = clienteExistente.id;
            } else {
                idFinalCliente = undefined;
            }
        }

        const payload = {
            clienteId: idFinalCliente,
            clienteNome: clienteSelecionado.label,
            clienteTelefone: clienteSelecionado.telefone,
            clienteEndereco: clienteSelecionado.endereco,
            itens: carrinho.map(item => ({
                produtoId: item.produtoId,
                nome: item.nome,
                preco: item.preco,
                quantidade: item.quantidade
            }))
        };

        console.log("Enviando Venda:", payload);

        try {
            const pedidoSalvo = await finalizarVenda(payload);
            setVendaConcluida(pedidoSalvo);
            setCarrinho([]);
            setClienteSelecionado(null);
            carregarDados();
        } catch (error: any) {
            console.error(error);
            alert("Erro: " + (error.response?.data?.message || "Erro desconhecido"));
        }
    };

    const handleImprimirEFechar = async () => {
        if (vendaConcluida?.id) {
            try {
                await imprimirVenda(vendaConcluida.id);
            } catch (e) {
                alert("Erro ao enviar comando para impressora.");
            }
        }
        setVendaConcluida(null);
    };

    // === RENDERIZAÇÃO ===
    return (
        <div className="flex h-screen bg-gray-50 font-sans relative">
            <Sidebar />

            {/* === 1. MODAL DE CADASTRO DE CLIENTE === */}
            {showModalCliente && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border-t-8 border-[#F28322]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                <UserPlus size={24} className="text-[#F28322]" /> Novo Cliente
                            </h2>
                            <button onClick={() => setShowModalCliente(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Nome</label>
                                <input disabled value={novoClienteDados.nome} className="w-full bg-gray-100 border-0 rounded-lg p-3 text-gray-700 font-semibold" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Telefone *</label>
                                <input
                                    ref={telefoneRef}
                                    value={novoClienteDados.telefone}
                                    onChange={e => setNovoClienteDados({ ...novoClienteDados, telefone: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F28322] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Endereço Completo *</label>
                                <textarea
                                    value={novoClienteDados.endereco}
                                    onChange={e => setNovoClienteDados({ ...novoClienteDados, endereco: e.target.value })}
                                    placeholder="Rua, Número, Bairro..."
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F28322] outline-none h-24 resize-none transition-all"
                                />
                            </div>
                            <button onClick={salvarNovoClienteLocalmente} className="w-full bg-[#F28322] hover:bg-[#d9751e] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95">
                                CONFIRMAR CADASTRO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === 2. MODAL DE VENDA CONCLUÍDA === */}
            {vendaConcluida && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60]">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-96 transform transition-all scale-100 border-t-8 border-[#F28322]">

                        <div className="flex justify-center mb-4">
                            <CheckCircle size={64} className="text-[#F28322]" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Venda #{vendaConcluida.id} Salva!</h2>
                        <p className="text-gray-500 mb-8">O que deseja fazer agora?</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleImprimirEFechar}
                                className="w-full bg-[#F28322] hover:bg-[#d9751e] text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                <Printer size={24} /> IMPRIMIR NOTA
                            </button>

                            <button
                                onClick={() => setVendaConcluida(null)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-colors"
                            >
                                Não imprimir (Nova Venda)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === TELA PRINCIPAL (COLUNA ESQUERDA) === */}
            <div className="w-2/3 p-6 flex flex-col gap-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-[#F28322]"><ShoppingCart /></span> Point Dog
                </h1>

                {}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-8 border-l-[#F28322]">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">1. Identificar Cliente</h2>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nome do Cliente</label>
                            
                            {}
                            <CreatableSelect
                                isClearable
                                placeholder="Busque ou Digite para Cadastrar..."
                                value={clienteSelecionado}
                                onChange={handleClienteChange}
                                options={opcoesClientes} 
                                formatCreateLabel={(input) => `✨ Cadastrar NOVO: "${input}"`}
                                className="text-lg"
                            />

                        </div>
                    </div>
                    {clienteSelecionado && (
                        <div className="mt-3 text-sm text-gray-700 bg-orange-50 border border-orange-100 p-3 rounded-lg flex justify-between items-center">
                            <span className="flex items-center gap-2"><span className="text-[#F28322]">📞</span> {clienteSelecionado.telefone || novoClienteDados.telefone}</span>
                            <span className="flex items-center gap-2"><span className="text-[#F28322]">🏠</span> {clienteSelecionado.endereco || novoClienteDados.endereco}</span>
                        </div>
                    )}
                </div>

                {}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-8 border-l-[#F28322] flex-1">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">2. Adicionar Produtos</h2>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Produto</label>
                        
                        <CreatableSelect
                            isClearable
                            autoFocus
                            placeholder="Busque ou digite para criar..."
                            value={produtoInput}
                            formatCreateLabel={(inputValue) => `✨ Novo Produto: "${inputValue}"`}
                            onChange={(val: any) => {
                                setProdutoInput(val);
                                if (val && !val.__isNew__) {
                                    const original = listaProdutos.find(p => p.id === val.value);
                                    if (original) setPrecoInput(original.preco);
                                    setTimeout(() => qtdRef.current?.focus(), 100);
                                } else if (val && val.__isNew__) {
                                    setPrecoInput(0);
                                    setTimeout(() => precoRef.current?.focus(), 100);
                                }
                            }}
                            options={opcoesProdutos}
                            className="text-lg"
                        />

                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="w-1/3">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Preço (R$)</label>
                            <input
                                ref={precoRef}
                                type="number"
                                step="0.01"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xl font-bold text-gray-700 focus:ring-2 focus:ring-[#F28322] outline-none transition-all"
                                value={precoInput}
                                onChange={e => setPrecoInput(parseFloat(e.target.value))}
                                onKeyDown={e => e.key === 'Enter' && qtdRef.current?.focus()}
                            />
                        </div>
                        <div className="w-1/4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Qtd.</label>
                            <input
                                ref={qtdRef}
                                type="number"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xl font-bold text-center focus:ring-2 focus:ring-[#F28322] outline-none transition-all"
                                value={qtdInput}
                                onChange={e => setQtdInput(parseFloat(e.target.value))}
                                onKeyDown={e => e.key === 'Enter' && btnAddRef.current?.click()}
                            />
                        </div>
                        <button
                            ref={btnAddRef}
                            onClick={adicionarAoCarrinho}
                            className="bg-[#F28322] hover:bg-[#d9751e] text-white font-bold p-3 rounded-xl flex-1 flex justify-center items-center gap-2 shadow-md transform active:scale-95 transition-all mt-6"
                        >
                            <Plus size={24} /> ADICIONAR
                        </button>
                    </div>
                </div>
            </div>

            {}
            <div className="w-1/3 bg-white border-l border-gray-200 shadow-2xl flex flex-col z-10">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Resumo do Pedido</h2>
                    <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="mb-2 pb-2 border-b border-gray-100">
                            <span className="font-bold text-gray-400 text-xs uppercase">Cliente</span><br />
                            <span className="text-lg font-medium text-gray-800">{clienteSelecionado?.label || 'Selecione um cliente...'}</span>
                        </p>
                        {clienteSelecionado && (
                            <>
                                <p className="mb-1">
                                    <span className="font-bold text-gray-400 text-xs uppercase">Telefone</span><br />
                                    {clienteSelecionado.telefone || novoClienteDados.telefone || '-'}
                                </p>
                                <p className="mt-2">
                                    <span className="font-bold text-gray-400 text-xs uppercase">Endereço</span><br />
                                    {clienteSelecionado.endereco || novoClienteDados.endereco || '-'}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {}
                <div className="flex-1 overflow-auto p-4 bg-gray-50/50">
                    {carrinho.length === 0 ? (
                        <div className="text-center text-gray-300 mt-20">
                            <ShoppingCart size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="font-light text-xl">Carrinho vazio</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {carrinho.map((item, index) => (
                                <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-orange-200 transition-colors">
                                    <div>
                                        <div className="font-bold text-gray-700">{item.nome}</div>
                                        <div className="text-xs text-gray-400">{item.quantidade}x R$ {item.preco.toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800">R$ {item.total.toFixed(2)}</span>
                                        <button onClick={() => removerDoCarrinho(index)} className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {}
                <div className="p-6 bg-gray-900 text-white">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Total a Pagar</span>
                        <span className="text-4xl font-bold text-[#F28322]">
                            R$ {carrinho.reduce((acc, item) => acc + item.total, 0).toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={handleFinalizar}
                        className="w-full bg-[#F28322] hover:bg-[#d9751e] text-white font-bold py-4 rounded-xl text-xl flex justify-center items-center gap-3 shadow-lg transform active:scale-95 transition-all"
                    >
                        <CheckCircle /> FINALIZAR VENDA
                    </button>
                </div>
            </div>
        </div>
    );
}