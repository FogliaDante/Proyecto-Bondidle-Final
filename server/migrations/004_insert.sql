INSERT INTO Colectivos (numero, zona, anio_creacion) VALUES (1, 'AMBA', 1903);
INSERT INTO Ramales (id_colectivo, nombre_ramal, inicio, final) VALUES (1, 'A', 'Primera Junta', 'Estación Morón');
INSERT INTO Empresas (nombre) VALUES ('Transportes San Cayetano S.A.C.');
INSERT INTO Empresa_Colectivo (id_colectivo, id_empresa) VALUES (1,1);
INSERT INTO Colores (color) VALUES 
	('Azul'),
    ('Amarillo');
INSERT INTO Colectivo_Color (id_colectivo, id_color) VALUES 
	(1,1),
    (1,2);
	
SELECT 
  c.numero AS numero_colectivo,
  c.zona,
  c.anio_creacion,
  r.nombre_ramal,
  r.inicio AS inicio_recorrido,
  r.final AS fin_recorrido,
  e.nombre AS empresa,
  col.color
FROM Colectivos c
JOIN Ramales r ON c.id_colectivo = r.id_colectivo
JOIN Empresa_Colectivo ec ON c.id_colectivo = ec.id_colectivo
JOIN Empresas e ON ec.id_empresa = e.id_empresa
JOIN Colectivo_Color cc ON c.id_colectivo = cc.id_colectivo
JOIN Colores col ON cc.id_color = col.id_color
WHERE c.numero = 1;

