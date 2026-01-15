import { useState, useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Plus, Trash2, Printer, ShoppingCart, UserPlus, X, CheckCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { finalizarVenda, buscarProdutos, buscarClientes, imprimirVenda } from '../services/api';
import type { ItemCarrinho, Produto, Cliente } from '../types';

export function PDV() {
    // === ESTADOS ===
    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

    // Cliente
    const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);

    // Modal de Cadastro de Cliente
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [novoClienteDados, setNovoClienteDados] = useState({
        nome: '',
        telefone: '',
        endereco: ''
    });

    // === NOVO ESTADO: Modal de Venda Concluída ===
    const [vendaConcluida, setVendaConcluida] = useState<any>(null);

    // Produto Atual
    const [produtoInput, setProdutoInput] = useState<any>(null);
    const [precoInput, setPrecoInput] = useState<number>(0);
    const [qtdInput, setQtdInput] = useState<number>(1);

    // Listas
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

        // Verifica se é um produto novo (flag __isNew__) ou existente
        if (produtoInput.__isNew__) {
            // É "Novo", mas vamos conferir se já existe na lista pelo nome (evitar duplicata visual)
            const produtoExistente = listaProdutos.find(
                p => p.nome.toLowerCase().trim() === produtoInput.label.toLowerCase().trim()
            );

            if (produtoExistente) {
                // Opa, já existe! Usa o ID dele
                idProdutoFinal = produtoExistente.id;
            } else {
                // Realmente novo
                idProdutoFinal = undefined;
            }
        } else {
            // Selecionou da lista
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

        // Limpa tudo e joga o foco de volta para o produto
        setProdutoInput(null);
        setPrecoInput(0);
        setQtdInput(1);
    };

    const removerDoCarrinho = (index: number) => {
        const novoCarrinho = [...carrinho];
        novoCarrinho.splice(index, 1);
        setCarrinho(novoCarrinho);
    };

    // === LÓGICA DE FINALIZAR (AGORA SÓ SALVA) ===
    const handleFinalizar = async () => {
        if (carrinho.length === 0) return alert("Carrinho vazio!");

        if (!clienteSelecionado) {
            alert("Selecione um cliente para continuar.");
            return;
        }

        // --- TRAVA DE SEGURANÇA ANTIDUPLICIDADE ---
        let idFinalCliente = undefined;

        // Cenário 1: Usuário selecionou um cliente existente (O valor é um número)
        if (typeof clienteSelecionado.value === 'number') {
            idFinalCliente = clienteSelecionado.value;
        }
        // Cenário 2: Usuário clicou em "Criar Novo" ou o valor é 'new'
        else {
            // Antes de mandar criar, vamos verificar se esse nome JÁ EXISTE na lista carregada
            const clienteExistente = listaClientes.find(
                c => c.nome.toLowerCase().trim() === clienteSelecionado.label.toLowerCase().trim()
            );

            if (clienteExistente) {
                // ACHOU! Usa o ID do existente em vez de criar outro
                console.log("Evitando duplicidade: Usando ID existente", clienteExistente.id);
                idFinalCliente = clienteExistente.id;
            } else {
                // Não achou, então é realmente novo (manda undefined pro Java criar)
                idFinalCliente = undefined;
            }
        }
        // ------------------------------------------

        const payload = {
            clienteId: idFinalCliente, // Usa o ID calculado acima
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

        // Console Log para você conferir o que está sendo enviado (Abra o F12 no navegador)
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

    // === LÓGICA DO BOTÃO IMPRIMIR (NO MODAL) ===
    const handleImprimirEFechar = async () => {
        if (vendaConcluida?.id) {
            try {
                // Chama o endpoint específico de impressão
                await imprimirVenda(vendaConcluida.id);
            } catch (e) {
                alert("Erro ao enviar comando para impressora.");
            }
        }
        setVendaConcluida(null); // Fecha o modal e volta pro caixa limpo
    };

    // === RENDERIZAÇÃO ===
    return (
        <div className="flex h-screen bg-gray-100 font-sans relative">
            <Sidebar />

            {/* === 1. MODAL DE CADASTRO DE CLIENTE === */}
            {showModalCliente && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 border-t-4 border-blue-600">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus size={24} className="text-blue-600" /> Novo Cliente
                            </h2>
                            <button onClick={() => setShowModalCliente(false)} className="text-gray-400 hover:text-red-500"><X /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Nome</label>
                                <input disabled value={novoClienteDados.nome} className="w-full bg-gray-100 border rounded p-2 text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Telefone *</label>
                                <input
                                    ref={telefoneRef}
                                    value={novoClienteDados.telefone}
                                    onChange={e => setNovoClienteDados({ ...novoClienteDados, telefone: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                    className="w-full border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Endereço Completo *</label>
                                <textarea
                                    value={novoClienteDados.endereco}
                                    onChange={e => setNovoClienteDados({ ...novoClienteDados, endereco: e.target.value })}
                                    placeholder="Rua, Número, Bairro..."
                                    className="w-full border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                />
                            </div>
                            <button onClick={salvarNovoClienteLocalmente} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors">
                                CONFIRMAR CADASTRO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === 2. MODAL DE VENDA CONCLUÍDA (Onde escolhe imprimir) === */}
            {vendaConcluida && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
                    <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-96 transform transition-all scale-100 border-t-4 border-green-500">

                        <div className="flex justify-center mb-4">
                            <CheckCircle size={64} className="text-green-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Venda #{vendaConcluida.id} Salva!</h2>
                        <p className="text-gray-500 mb-8">O que deseja fazer agora?</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleImprimirEFechar}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg flex justify-center items-center gap-2 text-lg shadow-lg"
                            >
                                <Printer size={24} /> IMPRIMIR NOTA
                            </button>

                            <button
                                onClick={() => setVendaConcluida(null)}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg"
                            >
                                Não imprimir (Nova Venda)
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* === TELA PRINCIPAL (COLUNA ESQUERDA) === */}
            <div className="w-2/3 p-6 flex flex-col gap-6">
                <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
                    <ShoppingCart /> Point Dog PDV
                </h1>

                {/* Card Cliente */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h2 className="text-lg font-semibold mb-4">1. Identificar Cliente</h2>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Nome do Cliente</label>
                            <CreatableSelect
                                isClearable
                                placeholder="Busque ou Digite para Cadastrar..."
                                value={clienteSelecionado}
                                onChange={handleClienteChange}
                                options={listaClientes.map(c => ({
                                    value: c.id,
                                    label: c.nome,
                                    telefone: c.telefone,
                                    endereco: c.endereco
                                }))}
                                formatCreateLabel={(input) => `Cadastrar NOVO: "${input}"`}
                            />
                        </div>
                    </div>
                    {clienteSelecionado && (
                        <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded flex justify-between">
                            <span>📞 {clienteSelecionado.telefone || novoClienteDados.telefone}</span>
                            <span>🏠 {clienteSelecionado.endereco || novoClienteDados.endereco}</span>
                        </div>
                    )}
                </div>

                {/* Card Produto */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 flex-1">
                    <h2 className="text-lg font-semibold mb-4">2. Adicionar Produtos</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Produto / Serviço</label>
                        <CreatableSelect
                            isClearable
                            autoFocus
                            placeholder="Busque ou digite para criar..."
                            value={produtoInput}
                            // Configuração da mensagem de criar novo
                            formatCreateLabel={(inputValue) => `✨ Cadastrar novo: "${inputValue}"`}

                            // Lógica de Seleção Inteligente
                            onChange={(val: any) => {
                                setProdutoInput(val);

                                if (val && !val.__isNew__) {
                                    // SE EXISTE: Pega o preço do cadastro
                                    const original = listaProdutos.find(p => p.id === val.value);
                                    if (original) setPrecoInput(original.preco);
                                    // Pula direto para a Quantidade (Agilidade)
                                    setTimeout(() => qtdRef.current?.focus(), 100);

                                } else if (val && val.__isNew__) {
                                    // SE É NOVO: Zera o preço e obriga a digitar
                                    setPrecoInput(0);
                                    // Foca no Preço
                                    setTimeout(() => precoRef.current?.focus(), 100);
                                }
                            }}
                            options={listaProdutos.map(p => ({ value: p.id, label: p.nome }))}
                        />
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                            <input
                                ref={precoRef}
                                type="number"
                                step="0.01"
                                className="w-full border rounded p-3 text-xl font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                                value={precoInput}
                                // Permite alterar o preço na hora, mesmo se o produto já existir
                                onChange={e => setPrecoInput(parseFloat(e.target.value))}
                                // Enter pula para Quantidade
                                onKeyDown={e => e.key === 'Enter' && qtdRef.current?.focus()}
                            />
                        </div>
                        <div className="w-1/4">
                            <label className="block text-sm font-medium mb-1">Qtd.</label>
                            <input
                                ref={qtdRef}
                                type="number"
                                className="w-full border rounded p-3 text-xl font-bold text-center focus:ring-2 focus:ring-green-500 outline-none"
                                value={qtdInput}
                                onChange={e => setQtdInput(parseFloat(e.target.value))}
                                // Enter aciona o botão Adicionar
                                onKeyDown={e => e.key === 'Enter' && btnAddRef.current?.click()}
                            />
                        </div>
                        <button
                            ref={btnAddRef}
                            onClick={adicionarAoCarrinho}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded flex-1 flex justify-center items-center gap-2 transition-transform active:scale-95"
                        >
                            <Plus size={24} /> ADICIONAR
                        </button>
                    </div>
                </div>
            </div>

            {/* === COLUNA DIREITA: CUPOM === */}
            <div className="w-1/3 bg-white border-l shadow-2xl flex flex-col">
                <div className="p-6 bg-gray-100 border-b border-gray-300">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Resumo do Pedido</h2>
                    <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 shadow-sm">
                        <p className="mb-1">
                            <span className="font-bold text-gray-800">Cliente:</span><br />
                            {clienteSelecionado?.label || 'Selecione um cliente...'}
                        </p>
                        {clienteSelecionado && (
                            <>
                                <p className="mb-1">
                                    <span className="font-bold text-gray-800">Tel:</span><br />
                                    {clienteSelecionado.telefone || novoClienteDados.telefone || '-'}
                                </p>
                                <p>
                                    <span className="font-bold text-gray-800">Endereço:</span><br />
                                    {clienteSelecionado.endereco || novoClienteDados.endereco || '-'}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Lista Rolável */}
                <div className="flex-1 overflow-auto p-4">
                    {carrinho.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">
                            <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Carrinho vazio</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-gray-500 border-b">
                                    <th className="pb-2">Item</th>
                                    <th className="pb-2 text-center">Qtd</th>
                                    <th className="pb-2 text-right">R$</th>
                                    <th className="w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrinho.map((item, index) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3">
                                            <div className="font-bold">{item.nome}</div>
                                            <div className="text-xs text-gray-400">Unit: R$ {item.preco.toFixed(2)}</div>
                                        </td>
                                        <td className="py-3 text-center">{item.quantidade}</td>
                                        <td className="py-3 text-right font-bold">{item.total.toFixed(2)}</td>
                                        <td className="py-3 text-right">
                                            <button onClick={() => removerDoCarrinho(index)} className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Rodapé Total */}
                <div className="p-6 bg-gray-800 text-white">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400">Total a Pagar</span>
                        <span className="text-4xl font-bold text-yellow-400">
                            R$ {carrinho.reduce((acc, item) => acc + item.total, 0).toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={handleFinalizar}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded text-xl flex justify-center items-center gap-3 transition-colors"
                    >
                        {/* Ícone Check pois agora é só Finalizar/Salvar */}
                        <CheckCircle /> FINALIZAR VENDA
                    </button>
                </div>
            </div>
        </div>
    );
}