

export interface Product {
    id?: number;
    name: string;
    slug?: string;
    description: string;
    price: number;
    rating?: number;
    count_in_stock: number;
    category?: string; // Mantener para compatibilidad
    product_category?: number; // Nueva: ID de la categoría
    image: File | null;
    quantity?: number;
    num_reviews?: number;
    unit?: string; // Mantener para compatibilidad
    unit_of_measurement?: number; // Nueva: ID de la unidad
    map_locate?: string;
    locate?: string;
    tiempoL?: number;
}

export interface Order {
    total_price: number;
    address: string
    city: string
    postal_code: string
    order_items: Product[]
};


export interface User {
    role: string;
    id?: number;
    avatar?: File | null;
    email: string;
    phone: string;
    password: string;
    name: string;
};

export interface Token {
    user_id: number;
    userId: number;
    exp: number;
    is_staff: boolean;
    email: string;
    enterprise: any;
    name: string;
    phone: string;
    role: string;
    avatar: File | null;
};

export interface ProductCategory {
    id?: number;
    name: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface UnitOfMeasurement {
    id?: number;
    name: string;
    abbreviation?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}