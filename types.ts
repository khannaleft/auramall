

export interface Store {
  id: number;
  name: string;
  location: string;
  bannerUrl: string;
  latitude: number;
  longitude: number;
}

export interface Product {
  id: number;
  storeId: number;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'admin' | 'store_owner';
    storeId?: number;
}

export interface Order {
    id: string;
    userEmail: string;
    storeId: number;
    phone: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    taxes: number;
    total: number;
    status: 'Pending Payment' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type Theme = 'light' | 'dark';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}