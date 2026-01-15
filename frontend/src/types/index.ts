export interface Cliente {
  id?: number;
  nome: string;
  telefone?: string;
  endereco?: string;
}

export interface Produto {
  id?: number;
  nome: string;
  preco: number;
}

export interface ItemCarrinho {
  produtoId?: number;
  nome: string;
  preco: number;
  quantidade: number;
  total: number;
}

export interface VendaDTO {
  clienteId?: number;
  clienteNome: string;
  clienteTelefone?: string;
  itens: {
    produtoId?: number;
    nome: string;
    preco: number;
    quantidade: number;
  }[];
}