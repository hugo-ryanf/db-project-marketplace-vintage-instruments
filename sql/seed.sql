-- Marketplace Vintage Instruments - Script de dados iniciais (seed)

-- Instrumentos (15 registros)

INSERT INTO instrumentos (nome, descricao, preco, ano_fabricacao, categoria, marca, qtd_estoque, fabricado_em_serido)
VALUES
    ('Fender Stratocaster 1962', 'Guitarra elétrica vintage em excelente estado de conservação', 45000.00, 1962, 'Guitarra', 'Fender', 2, false),
    ('Gibson Les Paul 1959', 'Modelo Standard com acabamento Sunburst original', 89000.00, 1959, 'Guitarra', 'Gibson', 1, false),
    ('Stradivarius Cremona 1721', 'Réplica artesanal de altíssima qualidade do modelo Lady Blunt', 320000.00, 1721, 'Violino', 'Stradivarius', 1, false),
    ('Yamaha Grand Piano C3 1975', 'Piano de cauda semi-profissional restaurado', 28000.00, 1975, 'Piano', 'Yamaha', 3, false),
    ('Ludwig Black Beauty 1968', 'Caixa de bateria em latão com acabamento black nickel', 15000.00, 1968, 'Bateria', 'Ludwig', 4, false),
    ('Fender Jazz Bass 1960', 'Baixo elétrico com som quente e corpo em Alder', 38000.00, 1960, 'Baixo', 'Fender', 2, false),
    ('Selmer Mark VI 1954', 'Saxofone tenor lendário usado por grandes jazzistas', 52000.00, 1954, 'Saxofone', 'Selmer', 1, false),
    ('Martin D-28 1941', 'Violão acústico pré-guerra com timbre incomparável', 67000.00, 1941, 'Violão', 'Martin', 1, false),
    ('Rhodes Mark I 1973', 'Piano elétrico com 73 teclas e som característico', 18500.00, 1973, 'Teclado', 'Rhodes', 2, false),
    ('Zildjian A Custom Ride 1965', 'Prato ride vintage com som brilhante e definido', 4500.00, 1965, 'Prato', 'Zildjian', 5, false),
    ('Acordeão Scandalli 1950', 'Acordeão italiano de 120 baixos em perfeito estado', 12000.00, 1950, 'Acordeão', 'Scandalli', 2, true),
    ('Rabeca Artesanal Seridó 1980', 'Rabeca artesanal feita por mestre luthier do Seridó', 3500.00, 1980, 'Rabeca', 'Artesanal', 6, true),
    ('Viola Caipira Rozini 1970', 'Viola de 10 cordas com caixa em jacarandá', 5500.00, 1970, 'Viola', 'Rozini', 3, false),
    ('Trompete Bach Stradivarius 1965', 'Trompete profissional em Sib com acabamento prateado', 22000.00, 1965, 'Trompete', 'Bach', 0, false),
    ('Zabumba Artesanal Seridó 1990', 'Zabumba de 22 polegadas feita com couro de bode do Seridó', 2800.00, 1990, 'Percussão', 'Artesanal', 4, true);


-- Clientes (8 registros)
 
INSERT INTO clientes (nome, email, telefone, cpf, endereco, cidade, estado, torce_flamengo, assiste_op)
VALUES
    ('João Pedro Silva', 'joao.silva@email.com', '(83) 99901-1234', '111.222.333-44', 'Rua das Flores, 123', 'João Pessoa', 'Paraíba', true, true),
    ('Maria Clara Santos', 'maria.santos@email.com', '(83) 99902-5678', '222.333.444-55', 'Av. Epitácio Pessoa, 456', 'João Pessoa', 'Paraíba', false, true),
    ('Carlos Eduardo Souza', 'carlos.souza@email.com', '(83) 99903-9012', '333.444.555-66', 'Rua Coronel Pessoa Mariz, 789', 'Sousa', 'Paraíba', true, false),
    ('Ana Beatriz Oliveira', 'ana.oliveira@email.com', '(21) 99904-3456', '444.555.666-77', 'Rua do Catete, 101', 'Rio de Janeiro', 'Rio de Janeiro', true, true),
    ('Lucas Gabriel Ferreira', 'lucas.ferreira@email.com', '(11) 99905-7890', '555.666.777-88', 'Av. Paulista, 2000', 'São Paulo', 'São Paulo', false, false),
    ('Rafaela Costa Lima', 'rafaela.lima@email.com', '(83) 99906-2345', '666.777.888-99', 'Rua José Américo, 55', 'Campina Grande', 'Paraíba', false, true),
    ('Pedro Henrique Alves', 'pedro.alves@email.com', '(83) 99907-6789', '777.888.999-00', 'Rua Cel. José Gervásio, 321', 'Sousa', 'Paraíba', true, true),
    ('Isabela Fernandes', 'isabela.fern@email.com', '(84) 99908-0123', '888.999.000-11', 'Av. Engenheiro Roberto Freire, 88', 'Natal', 'Rio Grande do Norte', false, false);

-- Formas de Pagamento (referência)

INSERT INTO formas_pagamento (descricao)
VALUES
    ('credito'),
    ('debito'),
    ('boleto'),
    ('pix');

-- Vendedores (4 registros)

INSERT INTO vendedores (nome, email, telefone, cpf, data_admissao)
VALUES
    ('Rodrigo Alencar', 'rodrigo.alencar@vintage.com', '(83) 99911-1111', '100.200.300-40', '2021-03-15'),
    ('Fernanda Melo', 'fernanda.melo@vintage.com', '(83) 99922-2222', '200.300.400-50', '2022-06-01'),
    ('Tiago Brito', 'tiago.brito@vintage.com', '(83) 99933-3333', '300.400.500-60', '2020-01-10'),
    ('Camila Nogueira', 'camila.nogueira@vintage.com', '(83) 99944-4444', '400.500.600-70', '2023-09-20');