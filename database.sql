-- ============================================================
-- Micro-Soporte L1/L2 - Database Schema (PostgreSQL)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('L1', 'L2');
CREATE TYPE ticket_status AS ENUM ('Abierto', 'En Progreso', 'Cerrado');

-- ============================================================
-- TABLE: customers
-- ============================================================

CREATE TABLE customers (
    nit             VARCHAR(20)     PRIMARY KEY,
    company_name    VARCHAR(255)    NOT NULL,
    contact_email   VARCHAR(255)    NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL
);

COMMENT ON TABLE customers IS 'Stores customer/company information.';
COMMENT ON COLUMN customers.nit IS 'Tax identification number, used as primary key.';
COMMENT ON COLUMN customers.deleted_at IS 'Soft-delete timestamp. NULL means the record is active.';

-- ============================================================
-- TABLE: products
-- ============================================================

CREATE TABLE products (
    product_id      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nit_customer    VARCHAR(20)     NOT NULL,
    product_name    VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,

    CONSTRAINT fk_products_customer
        FOREIGN KEY (nit_customer)
        REFERENCES customers (nit)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON TABLE products IS 'Products or services associated with a customer.';
COMMENT ON COLUMN products.deleted_at IS 'Soft-delete timestamp. NULL means the record is active.';

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE users (
    user_id         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(512)    NOT NULL,
    password_salt   VARCHAR(255)    NOT NULL,
    role            user_role       NOT NULL DEFAULT 'L1',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL
);

COMMENT ON TABLE users IS 'Support agents. Role determines access level (L1 or L2).';
COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt or PBKDF2 with salt.';
COMMENT ON COLUMN users.password_salt IS 'Unique salt generated per user for password hashing.';
COMMENT ON COLUMN users.deleted_at IS 'Soft-delete timestamp. NULL means the record is active.';

-- ============================================================
-- TABLE: tickets
-- ============================================================

CREATE TABLE tickets (
    ticket_id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID            NOT NULL,
    assigned_user_id    UUID            NULL,
    subject             VARCHAR(500)    NOT NULL,
    description         TEXT            NOT NULL,
    type                VARCHAR(100)    NOT NULL,
    impact              VARCHAR(100)    NOT NULL,
    status              ticket_status   NOT NULL DEFAULT 'Abierto',
    current_level       INT             NOT NULL DEFAULT 1 CHECK (current_level IN (1, 2)),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT fk_tickets_product
        FOREIGN KEY (product_id)
        REFERENCES products (product_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_tickets_assigned_user
        FOREIGN KEY (assigned_user_id)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

COMMENT ON TABLE tickets IS 'Support tickets created by L1 agents.';
COMMENT ON COLUMN tickets.current_level IS '1 = L1 support, 2 = Escalated to L2 support.';
COMMENT ON COLUMN tickets.deleted_at IS 'Soft-delete timestamp. NULL means the record is active.';

-- ============================================================
-- TABLE: comments
-- ============================================================

CREATE TABLE comments (
    comment_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID        NOT NULL,
    user_id     UUID        NOT NULL,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ NULL,

    CONSTRAINT fk_comments_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets (ticket_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON TABLE comments IS 'Comments/notes added to a ticket by support agents.';
COMMENT ON COLUMN comments.deleted_at IS 'Soft-delete timestamp. NULL means the record is active.';

-- ============================================================
-- INDEXES
-- ============================================================

-- Customers
CREATE INDEX idx_customers_deleted_at ON customers (deleted_at) WHERE deleted_at IS NULL;

-- Products
CREATE INDEX idx_products_nit_customer ON products (nit_customer);
CREATE INDEX idx_products_deleted_at   ON products (deleted_at) WHERE deleted_at IS NULL;

-- Users
CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NULL;

-- Tickets
CREATE INDEX idx_tickets_product_id       ON tickets (product_id);
CREATE INDEX idx_tickets_assigned_user_id ON tickets (assigned_user_id);
CREATE INDEX idx_tickets_status           ON tickets (status);
CREATE INDEX idx_tickets_current_level    ON tickets (current_level);
CREATE INDEX idx_tickets_deleted_at       ON tickets (deleted_at) WHERE deleted_at IS NULL;

-- Comments
CREATE INDEX idx_comments_ticket_id  ON comments (ticket_id);
CREATE INDEX idx_comments_user_id    ON comments (user_id);
CREATE INDEX idx_comments_deleted_at ON comments (deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- TRIGGER: auto-update updated_at on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- SEED DATA (optional - for development/testing)
-- ============================================================

-- Sample customer
INSERT INTO customers (nit, company_name, contact_email)
VALUES ('900123456-1', 'Empresa Demo S.A.', 'contacto@empresademo.com');

-- Sample product
INSERT INTO products (product_id, nit_customer, product_name, description)
VALUES (
    gen_random_uuid(),
    '900123456-1',
    'Sistema ERP Demo',
    'Sistema de planificación de recursos empresariales.'
);

-- Sample users (passwords are placeholders - must be hashed in application layer)
-- L1 user: password = "password123"
INSERT INTO users (user_id, full_name, email, password_hash, password_salt, role)
VALUES (
    gen_random_uuid(),
    'Ana García',
    'ana.garcia@soporte.com',
    'HASH_PLACEHOLDER_L1',
    'SALT_PLACEHOLDER_L1',
    'L1'
);

-- L2 user: password = "password123"
INSERT INTO users (user_id, full_name, email, password_hash, password_salt, role)
VALUES (
    gen_random_uuid(),
    'Carlos Mendoza',
    'carlos.mendoza@soporte.com',
    'HASH_PLACEHOLDER_L2',
    'SALT_PLACEHOLDER_L2',
    'L2'
);
