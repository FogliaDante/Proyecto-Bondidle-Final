-- Tablas mínimas de sesión de juego (opcional para stats futuras)
CREATE TABLE IF NOT EXISTS ClassicRounds (
    id_round INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    puzzle_date DATE NOT NULL,
    attempts INT DEFAULT 0,
    completed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);


CREATE TABLE IF NOT EXISTS ClassicGuesses (
    id_guess INT AUTO_INCREMENT PRIMARY KEY,
    id_round INT NOT NULL,
    numero INT,
    ramal_nombre VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_round) REFERENCES ClassicRounds(id_round)
);