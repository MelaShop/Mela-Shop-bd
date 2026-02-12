
import { Product } from './types';

export const STORE_NAME = 'মেলা শপ'; 
export const ADMIN_PASSWORD = '123??sagarr?';
export const WHATSAPP_NUMBER = '8801981500986';
export const OFFICIAL_GMAIL = 'melashop247@gmail.com';
export const BKASH_NUMBER = '01798712944';
export const FACEBOOK_PAGE = 'https://www.facebook.com/share/1GWTkXuE4m/';

export const DELIVERY_FEES = {
  inside: 70,
  outside: 130
};

export const DEFAULT_LOGO = 'https://i.ibb.co/vzR0yFp/mela-logo.png'; 

export const CATEGORIES = ['All', 'Mens', 'Womens', 'Kids', 'Home Decor', 'Accessories', 'Electronics'];

export const TRANSLATIONS = {
  bn: {
    storeName: 'মেলা শপ',
    myOrders: 'আমার অর্ডার',
    admin: 'অ্যাডমিন',
    profile: 'প্রোফাইল',
    cart: 'কার্ট',
    heroSub: 'সবসেরা ডিজিটাল উৎসব শপিং এখানে!',
    viewProducts: 'পণ্য দেখুন',
    checkout: 'চেকআউট',
    buyNow: 'সরাসরি কিনুন',
    addToCart: 'কার্টে যোগ করুন',
    details: 'পণ্যের বিবরণ',
    price: 'দাম',
    size: 'সাইজ',
    color: 'কালার',
    paymentMethod: 'পেমেন্ট মেথড',
    cod: 'ক্যাশ অন ডেলিভারি',
    fullPayment: 'ফুল পেমেন্ট (বিকাশ)',
    confirmOrder: 'অর্ডার কনফার্ম করুন',
    deliveryCharge: 'ডেলিভারি চার্জ',
    total: 'সর্বমোট',
    insideDhaka: 'ঢাকা সিটি',
    outsideDhaka: 'ঢাকার বাইরে',
    trxPlaceholder: 'ট্রানজেকশন আইডি দিন',
    emptyCart: 'কার্ট খালি',
    noHistory: 'অর্ডার হিস্ট্রি খালি!',
    startShopping: 'শপিং শুরু করুন',
    pending: 'পেন্ডিং',
    confirmed: 'কনফার্মড',
    shipped: 'শিপিং',
    delivered: 'ডেলিভারড',
    address: 'ঠিকানা',
    name: 'পুরো নাম',
    phone: 'মোবাইল নম্বর',
    contactUs: 'যোগাযোগ করুন',
    categories: 'ক্যাটাগরি সমূহ',
    searchPlaceholder: 'পণ্য খুঁজুন...',
    orderSearchPlaceholder: 'ID বা ফোন দিয়ে খুঁজুন',
    noProducts: 'কোনো পণ্য পাওয়া যায়নি!',
    whyChooseUs: 'কেন আমাদের পছন্দ করবেন?',
    fastDelivery: 'দ্রুত ডেলিভারি',
    qualityProduct: 'সেরা মান',
    securePayment: 'নিরাপদ পেমেন্ট',
    followUs: 'আমাদের ফলো করুন',
    saveProfile: 'প্রোফাইল সেভ করুন',
    profileSaved: 'আপনার তথ্য সফলভাবে সেভ করা হয়েছে!',
    fillFromProfile: 'প্রোফাইল থেকে তথ্য নিন'
  },
  en: {
    storeName: 'Mela Shop',
    myOrders: 'My Orders',
    admin: 'Admin',
    profile: 'Profile',
    cart: 'Cart',
    heroSub: 'The best digital festive shopping experience!',
    viewProducts: 'View Products',
    checkout: 'Checkout',
    buyNow: 'Buy Now',
    addToCart: 'Add to Cart',
    details: 'Product Details',
    price: 'Price',
    size: 'Size',
    color: 'Color',
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery',
    fullPayment: 'Full Payment (Bkash)',
    confirmOrder: 'Confirm Order',
    deliveryCharge: 'Delivery Charge',
    total: 'Total',
    insideDhaka: 'Inside Dhaka',
    outsideDhaka: 'Outside Dhaka',
    trxPlaceholder: 'Enter Txn ID',
    emptyCart: 'Cart is empty',
    noHistory: 'No orders found!',
    startShopping: 'Start Shopping',
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    address: 'Address',
    name: 'Full Name',
    phone: 'Phone Number',
    contactUs: 'Contact Us',
    categories: 'Categories',
    searchPlaceholder: 'Search products...',
    orderSearchPlaceholder: 'Search ID or phone',
    noProducts: 'No products found!',
    whyChooseUs: 'Why Choose Us?',
    fastDelivery: 'Fast Delivery',
    qualityProduct: 'Quality Goods',
    securePayment: 'Secure Payment',
    followUs: 'Follow Us',
    saveProfile: 'Save Profile',
    profileSaved: 'Profile information saved successfully!',
    fillFromProfile: 'Fill from Profile'
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Panjabi',
    description: 'High-quality cotton panjabi for festive occasions. Made with premium fabric and intricate embroidery. Perfect for any traditional event or celebration.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1597931289177-24539cb55be4?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1597931289177-24539cb55be4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1529139513477-3235a8ad0739?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Mens',
    stock: 10,
    sizes: ['M', 'L', 'XL'],
    colors: ['White', 'Navy Blue', 'Maroon']
  }
];
