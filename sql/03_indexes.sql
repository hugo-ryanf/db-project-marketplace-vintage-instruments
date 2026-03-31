-- Índices para otimizar as consultas mais frequentes

-- instrumentos: filtros de busca no catálogo
CREATE INDEX idx_instrumentos_categoria      ON instrumentos (categoria);
CREATE INDEX idx_instrumentos_preco          ON instrumentos (preco);
CREATE INDEX idx_instrumentos_fabricado      ON instrumentos (fabricado_em_serido);
CREATE INDEX idx_instrumentos_qtd_estoque    ON instrumentos (qtd_estoque);

-- clientes: busca e agrupamentos em relatórios
CREATE INDEX idx_clientes_cidade             ON clientes (lower(cidade));
CREATE INDEX idx_clientes_estado             ON clientes (estado);

-- compras: joins e relatório mensal por vendedor
CREATE INDEX idx_compras_id_cliente          ON compras (id_cliente);
CREATE INDEX idx_compras_id_vendedor         ON compras (id_vendedor);
CREATE INDEX idx_compras_data_compra         ON compras (data_compra);

-- itens_compra: joins com compras e instrumentos
CREATE INDEX idx_itens_compra_id_compra      ON itens_compra (id_compra);
CREATE INDEX idx_itens_compra_id_instrumento ON itens_compra (id_instrumento);

-- pagamentos: join com compras
CREATE INDEX idx_pagamentos_id_compra        ON pagamentos (id_compra);
