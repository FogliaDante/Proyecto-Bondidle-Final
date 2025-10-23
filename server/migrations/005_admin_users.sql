-- Agregar columna es_admin a la tabla Usuarios
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS es_admin TINYINT(1) DEFAULT 0;

-- Agregar columna nombre_usuario si no existe
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS nombre_usuario VARCHAR(50);

-- Actualizar nombre_usuario con el nombre si está vacío
UPDATE Usuarios SET nombre_usuario = nombre WHERE nombre_usuario IS NULL OR nombre_usuario = '';

-- Agregar columna fecha_registro si no existe
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
