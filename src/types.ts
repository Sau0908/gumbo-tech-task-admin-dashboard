export type Id = string;

export interface User {
  _id?: Id;
  id?: Id;
  name: string;
  email: string;
  role: "admin" | "customer";
  isBlocked?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: Id;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Product {
  _id: Id;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category | Id;
  images: string[];
  createdAt: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  _id: Id;
  user: Pick<User, "name" | "email"> & { _id: Id };
  items: Array<{
    product: Pick<Product, "name" | "images"> & { _id: Id };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}
export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}
export interface CategoryPayload {
  name: string;
  description?: string;
}
