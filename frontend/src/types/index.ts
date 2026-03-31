export interface Instrumento {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ano_fabricacao: number;
  categoria: string;
  marca: string;
  qtd_estoque: number;
  fabricado_em_serido: boolean;
}

export interface InstrumentoPayload {
  nome: string;
  descricao?: string;
  preco: number;
  ano_fabricacao: number;
  categoria: string;
  marca: string;
  qtd_estoque?: number;
  fabricado_em_serido?: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  cidade: string;
  estado: string;
  torce_flamengo: boolean;
  assiste_op: boolean;
}

export interface ClientePayload {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  cidade: string;
  estado: string;
  torce_flamengo?: boolean;
  assiste_op?: boolean;
}

export interface RelatorioInstrumentoPorCategoria {
  categoria: string;
  qtd_instrumentos: number;
  total_estoque: number;
  valor_total: number;
  preco_medio: number;
}

export interface RelatorioClientePorEstado {
  estado: string;
  qtd_clientes: number;
  qtd_flamengo: number;
  qtd_one_piece: number;
}

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  cpf: string;
  data_admissao: string | null;
}

export interface VendedorPayload {
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  data_admissao?: string;
}

export interface RelatorioVendasMensais {
  id_vendedor: number;
  vendedor: string;
  ano: number;
  mes: number;
  qtd_vendas: number;
  total_vendas: number;
  ticket_medio: number;
}

export interface FormaPagamento {
  id: number;
  descricao: string;
}

export interface ItemCompra {
  id_instrumento: number;
  nome: string;
  qtd_item: number;
  preco_unitario: number;
}

export interface Compra {
  id: number;
  data_compra: string;
  valor_total: number;
  status_compra: string;
  desconto_aplicado: number;
  vendedor: string;
  forma_pagamento: string;
  status_pagamento: string;
  itens: ItemCompra[];
}
