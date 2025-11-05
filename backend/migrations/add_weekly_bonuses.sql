-- Migración para añadir bonos semanales al sistema
-- Fecha: 30 de Octubre 2025

-- 1. Crear tabla de bonos semanales
CREATE TABLE IF NOT EXISTS weekly_bonuses (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 8.99,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activated_at DATETIME NULL,
    expires_at DATETIME NULL,
    status ENUM('PURCHASED', 'ACTIVE', 'EXPIRED', 'REFUNDED') NOT NULL DEFAULT 'PURCHASED',
    payment_method VARCHAR(50) NULL,
    payment_reference VARCHAR(255) NULL,
    features JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    INDEX idx_purchase_date (purchase_date),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Comentarios para documentación
ALTER TABLE weekly_bonuses COMMENT = 'Bonos semanales de 8.99€ para acceso completo al plan Maestro por 7 días';

-- 3. Insertar algunos datos de ejemplo para testing (opcional)
-- INSERT INTO weekly_bonuses (id, user_id, amount, currency, status, features) 
-- VALUES ('bonus_test_001', 'user_test_id', 8.99, 'EUR', 'PURCHASED', '{"plan": "MAESTRO", "unlimited_readings": true}');

-- 4. Verificar la creación
SELECT COUNT(*) as total_bonuses FROM weekly_bonuses;
SELECT TABLE_COMMENT FROM information_schema.TABLES WHERE TABLE_NAME = 'weekly_bonuses';

-- Instrucciones de rollback (si es necesario deshacer):
-- DROP TABLE IF EXISTS weekly_bonuses;