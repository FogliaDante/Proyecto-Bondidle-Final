CREATE TABLE Colectivos (
	id_colectivo INT AUTO_INCREMENT PRIMARY KEY, 
    numero INT NOT NULL, 
    zona ENUM('CABA', 'Provincia', 'AMBA') NOT NULL, 
    anio_creacion YEAR
);

CREATE TABLE Ramales (
	id_ramal INT AUTO_INCREMENT PRIMARY KEY, 
	id_colectivo INT, 
    nombre_ramal VARCHAR(50), 
    inicio VARCHAR(100), 
    final VARCHAR(100), 
    imagen_recorrido TEXT, 
    FOREIGN KEY (id_colectivo) REFERENCES Colectivos(id_colectivo)
);

CREATE TABLE Empresas (
	id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Empresa_Colectivo (
	id_colectivo INT,
    id_empresa INT,
    FOREIGN KEY (id_colectivo) REFERENCES Colectivos(id_colectivo),
    FOREIGN KEY (id_empresa) REFERENCES Empresas(id_empresa)
);

CREATE TABLE Colores (
    id_color INT AUTO_INCREMENT PRIMARY KEY,
    color VARCHAR(50) NOT NULL
);

CREATE TABLE Colectivo_Color (
	id_colectivo INT,
    id_color INT,
    FOREIGN KEY (id_colectivo) REFERENCES Colectivos(id_colectivo),
    FOREIGN KEY (id_color) REFERENCES Colores(id_color)
);