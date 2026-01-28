-- 1. Usuarios (Interno: Usamos 'username' en lugar de 'email' obligatorio)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150),
    rol VARCHAR(20) CHECK (rol IN ('admin', 'responsable', 'usuario_general')),
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Catálogo de Insumos (Aquí el Admin cambia los precios según el dólar)
CREATE TABLE catalogo_materiales (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    precio_actual DECIMAL(10,2) NOT NULL, -- Precio que puede variar
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Órdenes de Trabajo (OT)
CREATE TABLE ordenes_trabajo (
    id SERIAL PRIMARY KEY,
    numero_orden VARCHAR(20) UNIQUE NOT NULL, -- Ej: OT-001
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Datos del Cliente
    cliente_nombre VARCHAR(200) NOT NULL,
    cliente_celular VARCHAR(20),
    trabajo_solicitado TEXT, -- Mantenimiento, cambio de partes, etc.
    
    -- Datos del Vehículo
    placa VARCHAR(20) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    horometro FLOAT,
    kilometraje FLOAT,
    
    -- Estado de la Orden
    estado VARCHAR(30) CHECK (estado IN (
        'en reparacion', 'cambio de aceite', 'esperando repuesto', 'terminado', 'cancelado'
    )) DEFAULT 'en reparacion',
    
    -- Control de Cierre
    esta_cerrada BOOLEAN DEFAULT FALSE, -- Bloquea edición si es TRUE
    usuario_creador_id INT REFERENCES usuarios(id),
    responsable_id INT REFERENCES usuarios(id), -- Quien supervisa
    
    -- Totales
    subtotal_materiales DECIMAL(10,2) DEFAULT 0,
    subtotal_servicios DECIMAL(10,2) DEFAULT 0,
    subtotal_terceros DECIMAL(10,2) DEFAULT 0,
    total_final DECIMAL(10,2) DEFAULT 0
);

-- 4. Detalles de la OT (Capturan el precio al momento de la venta)
CREATE TABLE ot_materiales (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES ordenes_trabajo(id),
    material_id INT REFERENCES catalogo_materiales(id),
    cantidad DECIMAL(10,2) NOT NULL,
    precio_aplicado DECIMAL(10,2) NOT NULL -- Se guarda el precio del momento
);

CREATE TABLE ot_servicios (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES ordenes_trabajo(id),
    descripcion TEXT,
    monto DECIMAL(10,2)
);

CREATE TABLE ot_terceros (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES ordenes_trabajo(id),
    descripcion TEXT, -- Ej: Soldadura externa
    monto DECIMAL(10,2)
);

-- 5. Tabla de Auditoría (El "Quién hizo qué")
CREATE TABLE logs_actividad (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    orden_id INT REFERENCES ordenes_trabajo(id),
    accion TEXT NOT NULL, -- Ej: "Cambió estado a Terminado", "Editó monto de repuesto"
    datos_anteriores JSONB, -- Opcional: para ver qué cambió exactamente
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);