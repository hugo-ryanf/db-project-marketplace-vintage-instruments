-- View: Vendas mensais agrupadas por vendedor
-- Usada no relatório mensal de desempenho de vendas

CREATE OR REPLACE VIEW vw_vendas_mensais_por_vendedor AS
SELECT
    v.id                                        AS id_vendedor,
    v.nome                                      AS vendedor,
    EXTRACT(YEAR  FROM c.data_compra)::INTEGER  AS ano,
    EXTRACT(MONTH FROM c.data_compra)::INTEGER  AS mes,
    COUNT(c.id)                                 AS qtd_vendas,
    SUM(c.valor_total)                          AS total_vendas,
    AVG(c.valor_total)                          AS ticket_medio
FROM vendedores v
JOIN compras c ON c.id_vendedor = v.id
GROUP BY
    v.id,
    v.nome,
    EXTRACT(YEAR  FROM c.data_compra),
    EXTRACT(MONTH FROM c.data_compra)
ORDER BY ano DESC, mes DESC, total_vendas DESC;
