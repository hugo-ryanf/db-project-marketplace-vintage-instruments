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
