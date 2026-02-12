
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Keep as primary/thumbnail
  images: string[]; // Support for multiple images
  category: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string; // Thumbnail
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedImage?: string; // The specific image selected by user
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'bKash' | 'COD';
  trxId?: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  createdAt: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
}

export enum Page {
  Home = 'home',
  Admin = 'admin',
  Checkout = 'checkout',
  MyOrders = 'my-orders',
  Profile = 'profile'
}
