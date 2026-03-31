-- Stored Procedure: realizar_compra
--
-- Responsável por efetivar uma compra de forma atômica:
--   1. Busca os dados do cliente e calcula o desconto
--   2. Valida o estoque de cada item
--   3. Calcula o valor total com desconto aplicado
--   4. Insere a compra, os itens e o pagamento
--   5. Dá baixa no estoque dos instrumentos
--
-- Regras de desconto (cumulativas, máx. 15%):
--   - Cliente torce para o Flamengo  → 5%
--   - Cliente assiste One Piece      → 5%
--   - Cliente é de Sousa             → 5%
--
-- Parâmetros:
--   p_id_cliente         → ID do cliente que está comprando
--   p_id_vendedor        → ID do vendedor que está efetuando a venda
--   p_id_forma_pagamento → ID da forma de pagamento escolhida
--   p_itens              → JSON array com os itens:
--                          [{"id_instrumento": 1, "qtd_item": 2}, ...]
--   p_id_compra (INOUT)  → Retorna o ID da compra criada
--
-- Uso (Python):
--   cursor.execute("CALL realizar_compra(%s, %s, %s, %s, %s)",
--                  (id_cliente, id_vendedor, id_forma_pagamento, json.dumps(itens), None))
--   id_compra = cursor.fetchone()[0]

CREATE OR REPLACE PROCEDURE realizar_compra(
    p_id_cliente         INTEGER,
    p_id_vendedor        INTEGER,
    p_id_forma_pagamento INTEGER,
    p_itens              JSONB,
    INOUT p_id_compra    INTEGER DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_desconto        NUMERIC := 0;
    v_valor_bruto     NUMERIC := 0;
    v_valor_total     NUMERIC := 0;
    v_item            JSONB;
    v_id_instrumento  INTEGER;
    v_qtd             INTEGER;
    v_preco           NUMERIC;
    v_estoque         INTEGER;
    v_torce_flamengo  BOOLEAN;
    v_assiste_op      BOOLEAN;
    v_cidade          VARCHAR;
BEGIN
    -- 1. Busca dados do cliente
    SELECT torce_flamengo, assiste_op, cidade
    INTO v_torce_flamengo, v_assiste_op, v_cidade
    FROM clientes
    WHERE id = p_id_cliente;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente ID % não encontrado.', p_id_cliente;
    END IF;

    -- 2. Calcula desconto acumulado
    IF v_torce_flamengo              THEN v_desconto := v_desconto + 0.05; END IF;
    IF v_assiste_op                  THEN v_desconto := v_desconto + 0.05; END IF;
    IF LOWER(v_cidade) = 'sousa'     THEN v_desconto := v_desconto + 0.05; END IF;

    -- 3. Valida estoque e soma o valor bruto
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
        v_id_instrumento := (v_item->>'id_instrumento')::INTEGER;
        v_qtd            := (v_item->>'qtd_item')::INTEGER;

        SELECT preco, qtd_estoque
        INTO v_preco, v_estoque
        FROM instrumentos
        WHERE id = v_id_instrumento;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Instrumento ID % não encontrado.', v_id_instrumento;
        END IF;

        IF v_estoque < v_qtd THEN
            RAISE EXCEPTION 'Estoque insuficiente para o instrumento ID % (disponível: %, solicitado: %).',
                v_id_instrumento, v_estoque, v_qtd;
        END IF;

        v_valor_bruto := v_valor_bruto + (v_preco * v_qtd);
    END LOOP;

    -- 4. Aplica desconto
    v_valor_total := v_valor_bruto * (1 - v_desconto);

    -- 5. Insere a compra
    INSERT INTO compras (id_cliente, id_vendedor, data_compra, valor_total, status_compra, desconto_aplicado)
    VALUES (p_id_cliente, p_id_vendedor, CURRENT_DATE, v_valor_total, 'confirmada', v_desconto)
    RETURNING id INTO p_id_compra;

    -- 6. Insere itens e atualiza estoque
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
        v_id_instrumento := (v_item->>'id_instrumento')::INTEGER;
        v_qtd            := (v_item->>'qtd_item')::INTEGER;

        SELECT preco INTO v_preco
        FROM instrumentos
        WHERE id = v_id_instrumento;

        INSERT INTO itens_compra (id_compra, id_instrumento, qtd_item, preco_unitario)
        VALUES (p_id_compra, v_id_instrumento, v_qtd, v_preco);

        UPDATE instrumentos
        SET qtd_estoque = qtd_estoque - v_qtd
        WHERE id = v_id_instrumento;
    END LOOP;

    -- 7. Registra pagamento com status pendente
    INSERT INTO pagamentos (id_compra, data_pagamento, status_pagamento, id_forma_pagamento)
    VALUES (p_id_compra, CURRENT_DATE, 'pendente', p_id_forma_pagamento);

END;
$$;
