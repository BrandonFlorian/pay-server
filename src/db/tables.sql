-- Drop tables in reverse order of dependency

DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS payment_information;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS category cascade;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS order_item;
DROP TABLE IF EXISTS order_information cascade;
DROP TABLE IF EXISTS user_profile cascade;
DROP TABLE IF EXISTS product cascade;
-- User Table
CREATE TABLE user_profile (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    date_of_birth DATE,
    profile_image_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Category Table
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Product Table
CREATE TABLE product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category_id UUID REFERENCES category(id),
    sku VARCHAR(255) UNIQUE,
    stock INTEGER NOT NULL,
    image_url VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    stripe_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



-- Orders Table
CREATE TABLE order_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_status VARCHAR(255),
    user_id UUID NOT NULL REFERENCES user_profile(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES order_information(id),
    product_id UUID NOT NULL REFERENCES product(id),
    quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Address Table
CREATE TABLE address (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profile(id),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Review Table
CREATE TABLE review (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES product(id),
    user_id UUID NOT NULL REFERENCES user_profile(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payment Info Table
CREATE TABLE payment_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profile(id),
    payment_type VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    account_number VARCHAR(255) UNIQUE,
    expiry DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inventory Log Table
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES product(id),
    change INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
