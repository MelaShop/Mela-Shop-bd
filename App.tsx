
import React, { useState, useEffect, useMemo } from 'react';
import { Page, Product, CartItem, Order, UserProfile } from './types';
import { INITIAL_PRODUCTS, ADMIN_PASSWORD, WHATSAPP_NUMBER, TRANSLATIONS, CATEGORIES, DEFAULT_LOGO, BKASH_NUMBER, DELIVERY_FEES, OFFICIAL_GMAIL, FACEBOOK_PAGE } from './constants';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const t = TRANSLATIONS[lang];

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mela_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mela_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('mela_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [shopLogo, setShopLogo] = useState<string>(() => {
    return localStorage.getItem('mela_logo') || DEFAULT_LOGO;
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('mela_user_profile');
      return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
    } catch (e) {
      return { name: '', phone: '', address: '' };
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash'>('COD');
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', trxId: '' });
  const [editingProduct, setEditingProduct] = useState<(Omit<Partial<Product>, 'sizes' | 'colors' | 'images'> & { sizes?: string | string[], colors?: string | string[], images?: string[] }) | null>(null);
  const [adminTab, setAdminTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
  const [isUploading, setIsUploading] = useState(false);

  // Modal States
  const [modalSize, setModalSize] = useState('');
  const [modalColor, setModalColor] = useState('');
  const [modalQuantity, setModalQuantity] = useState(1);

  // Search and Filter States
  const [homeProductSearch, setHomeProductSearch] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [adminOrderSearchQuery, setAdminOrderSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Hero Slider logic
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = products.length > 0 ? products.map(p => p.image) : [DEFAULT_LOGO];

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setHeroIndex(prev => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => { 
    try { localStorage.setItem('mela_products', JSON.stringify(products)); } catch (e) {}
  }, [products]);
  
  useEffect(() => { 
    try { localStorage.setItem('mela_cart', JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  useEffect(() => { 
    try { localStorage.setItem('mela_orders', JSON.stringify(orders)); } catch (e) {}
  }, [orders]);

  useEffect(() => { localStorage.setItem('mela_logo', shopLogo); }, [shopLogo]);
  
  useEffect(() => { localStorage.setItem('mela_user_profile', JSON.stringify(userProfile)); }, [userProfile]);

  const addToCart = (newItem: CartItem, silent = false) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === newItem.id && 
        item.selectedSize === newItem.selectedSize && 
        item.selectedColor === newItem.selectedColor &&
        item.selectedImage === newItem.selectedImage
      );
      if (existing) {
        return prev.map(item => 
          (item.id === newItem.id && 
           item.selectedSize === newItem.selectedSize && 
           item.selectedColor === newItem.selectedColor &&
           item.selectedImage === newItem.selectedImage) 
           ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prev, newItem];
    });
    if (!silent) {
      setIsCartOpen(true);
      setSelectedProduct(null);
    }
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
      quantity: modalQuantity,
      selectedSize: modalSize,
      selectedColor: modalColor,
      selectedImage: (selectedProduct.images && selectedProduct.images[activeImageIndex]) || selectedProduct.image
    };
    addToCart(newItem, true);
    setSelectedProduct(null);
    setCurrentPage(Page.Checkout);
  };

  const updateCartQuantity = (id: string, delta: number, size?: string, color?: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} কপি হয়েছে!`);
    });
  };

  const maskPhone = (phone: string) => {
    // Expects phone in format '8801981500986'
    if (phone.length < 10) return phone;
    const code = phone.slice(0, 3);
    const body = phone.slice(3);
    const firstTwo = body.slice(0, 2);
    const lastTwo = body.slice(-2);
    const stars = "*".repeat(body.length - 4);
    return `+${code} ${firstTwo}${stars}${lastTwo}`;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const deliveryFee = DELIVERY_FEES[deliveryArea];
    const finalTotal = cartSubtotal + deliveryFee;
    const orderId = `MELA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      customerName: checkoutForm.name,
      phone: checkoutForm.phone,
      address: checkoutForm.address,
      items: [...cart],
      total: finalTotal,
      paymentMethod: paymentMethod,
      trxId: checkoutForm.trxId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    setOrders(prev => [newOrder, ...prev]);
    
    const itemsList = newOrder.items.map(i => 
      `• *${i.name}*\n  পরিমাণ: ${i.quantity} x ৳${i.price}${i.selectedSize ? `\n  সাইজ: ${i.selectedSize}` : ''}${i.selectedColor ? `\n  কালার: ${i.selectedColor}` : ''}`
    ).join('\n\n');

    const paymentText = newOrder.paymentMethod === 'bKash' ? 'বিকাশ (ফুল পেমেন্ট)' : 'ক্যাশ অন ডেলিভারি';
    
    const msg = `🚀 *নতুন অর্ডার (${t.storeName})*
------------------------------
🆔 *অর্ডার আইডি:* ${newOrder.id}
👤 *নাম:* ${newOrder.customerName}
📞 *ফোন:* ${newOrder.phone}
📍 *ঠিকানা:* ${newOrder.address}

🛍️ *পণ্যের তালিকা:*
${itemsList}

💳 *পেমেন্ট বিবরণ:*
পেমেন্ট মেথড: ${paymentText}
${newOrder.trxId ? `ট্রানজেকশন আইডি: ${newOrder.trxId}` : ''}

💵 *হিসাব:*
পণ্যের দাম: ৳${cartSubtotal}
ডেলিভারি চার্জ: ৳${deliveryFee}
------------------------------
🔥 *সর্বমোট: ৳${newOrder.total}*`;

    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`, '_blank');

    setCart([]);
    setCheckoutForm({ name: '', phone: '', address: '', trxId: '' });
    alert(lang === 'bn' ? "অর্ডার সফল হয়েছে!" : "Order placed!");
    setCurrentPage(Page.MyOrders);
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && editingProduct) {
      setIsUploading(true);
      const results = await Promise.all(Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }));
      setEditingProduct(prev => prev ? {...prev, images: [...(prev.images || []), ...results]} : null);
      setIsUploading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setShopLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const formatted: Product = {
      id: editingProduct.id || Date.now().toString(),
      name: editingProduct.name || '',
      description: editingProduct.description || '',
      price: editingProduct.price || 0,
      image: (editingProduct.images && editingProduct.images.length > 0) ? editingProduct.images[0] : (editingProduct.image || ''),
      images: editingProduct.images || [],
      category: editingProduct.category || CATEGORIES[1],
      stock: editingProduct.stock || 0,
      sizes: typeof editingProduct.sizes === 'string' ? editingProduct.sizes.split(',').map(s => s.trim()).filter(s => s !== "") : (editingProduct.sizes || []),
      colors: typeof editingProduct.colors === 'string' ? editingProduct.colors.split(',').map(c => c.trim()).filter(c => c !== "") : (editingProduct.colors || []),
    };
    if (editingProduct.id) setProducts(prev => prev.map(p => p.id === editingProduct.id ? formatted : p));
    else setProducts(prev => [...prev, formatted]);
    setEditingProduct(null);
  };

  const filteredCustomerOrders = useMemo(() => {
    const query = orderSearchQuery.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(o => o.id.toLowerCase().includes(query) || o.phone.includes(query));
  }, [orders, orderSearchQuery]);

  const filteredAdminOrders = useMemo(() => {
    const query = adminOrderSearchQuery.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(o => 
      o.id.toLowerCase().includes(query) || 
      o.phone.includes(query) ||
      o.customerName.toLowerCase().includes(query)
    );
  }, [orders, adminOrderSearchQuery]);

  const filteredHomeProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }
    const query = homeProductSearch.trim().toLowerCase();
    if (query) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    return list;
  }, [products, selectedCategory, homeProductSearch]);

  const handleFillFromProfile = () => {
    if (userProfile.name || userProfile.phone || userProfile.address) {
      setCheckoutForm({
        ...checkoutForm,
        name: userProfile.name,
        phone: userProfile.phone,
        address: userProfile.address
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Hind_Siliguri']">
      <Navbar 
        onNavigate={setCurrentPage} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        currentPage={currentPage} 
        onOpenCart={() => setIsCartOpen(true)} 
        customLogo={shopLogo}
        lang={lang}
        onToggleLang={() => setLang(prev => prev === 'en' ? 'bn' : 'en')}
      />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 w-full">
        {currentPage === Page.Home && (
          <div className="animate-in fade-in duration-1000 space-y-12 pb-20">
            {/* Hero Slider */}
            <div className="rounded-[3rem] md:rounded-[5rem] relative overflow-hidden shadow-2xl min-h-[500px] flex items-center justify-center border-8 border-white">
              <div className="absolute inset-0">
                {heroImages.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'} blur-[1px] brightness-75`} 
                    alt="" 
                  />
                ))}
              </div>
              <div className="relative z-10 p-10 md:p-16 text-center max-w-2xl mx-4 bg-white/20 backdrop-blur-xl rounded-[4rem] border border-white/30 shadow-2xl">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 mx-auto border-4 border-white bg-white">
                  <img src={shopLogo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-5xl md:text-8xl font-black mb-6 text-white drop-shadow-[0_4px_12px_rgba(255,0,110,0.4)] tracking-tighter uppercase leading-none">
                  {t.storeName}
                </h1>
                <p className="text-white/90 text-xl md:text-2xl font-bold mb-10 tracking-tight drop-shadow-md">
                  {t.heroSub}
                </p>
                <button 
                  onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-12 py-5 bg-pink-600 text-white rounded-full font-black text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all border-b-4 border-pink-800"
                >
                  {t.viewProducts} <i className="fa-solid fa-arrow-down ml-2"></i>
                </button>
              </div>
            </div>

            {/* Sticky Search and Categories */}
            <div id="shop-section" className="space-y-8 scroll-mt-28">
               <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="relative w-full md:max-w-md group">
                     <input 
                        type="text" 
                        placeholder={t.searchPlaceholder}
                        value={homeProductSearch}
                        onChange={(e) => setHomeProductSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white border-2 border-pink-50 focus:border-pink-600 outline-none font-bold text-slate-700 shadow-xl transition-all"
                     />
                     <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors"></i>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 overflow-x-auto w-full md:w-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-8 py-4 rounded-full font-black text-xs whitespace-nowrap transition-all shadow-md ${selectedCategory === cat ? 'bg-pink-600 text-white scale-105' : 'bg-white text-slate-500 hover:bg-pink-50 hover:text-pink-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Product Grid */}
               <div className="min-h-[400px]">
                  {filteredHomeProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
                      {filteredHomeProducts.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          onViewDetails={(p) => {
                            setSelectedProduct(p);
                            setActiveImageIndex(0);
                            setModalSize(p.sizes?.[0] || '');
                            setModalColor(p.colors?.[0] || '');
                            setModalQuantity(1);
                          }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-inner">
                       <i className="fa-solid fa-box-open text-6xl text-slate-100 mb-6 block"></i>
                       <p className="text-slate-400 font-black text-2xl uppercase tracking-widest">{t.noProducts}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="py-20">
               <h2 className="text-4xl font-black text-slate-800 text-center mb-16 italic uppercase tracking-tighter">
                  {t.whyChooseUs}
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="bg-white p-10 rounded-[3rem] border border-pink-50 text-center shadow-lg hover:-translate-y-2 transition-transform">
                     <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 text-3xl mx-auto mb-6 shadow-sm rotate-3">
                        <i className="fa-solid fa-truck-fast"></i>
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 mb-4">{t.fastDelivery}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">অর্ডার করার মাত্র ২৪-৪৮ ঘণ্টার মধ্যে সারা বাংলাদেশে হোম ডেলিভারি।</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-pink-50 text-center shadow-lg hover:-translate-y-2 transition-transform">
                     <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 text-3xl mx-auto mb-6 shadow-sm -rotate-3">
                        <i className="fa-solid fa-award"></i>
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 mb-4">{t.qualityProduct}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">আমরা কোনো মানের সাথে আপস করি না। প্রতিটি পণ্য যাচাই করে সংগ্রহ করা হয়।</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-pink-50 text-center shadow-lg hover:-translate-y-2 transition-transform">
                     <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 text-3xl mx-auto mb-6 shadow-sm rotate-6">
                        <i className="fa-solid fa-shield-halved"></i>
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 mb-4">{t.securePayment}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">বিকাশ ও ক্যাশ অন ডেলিভারি মাধ্যমে শতভাগ নিরাপদ ও বিশ্বস্ত লেনদেন।</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Profile Page */}
        {currentPage === Page.Profile && (
           <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-5">
              <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border-4 border-white text-center">
                 <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-5xl mx-auto mb-8 shadow-inner">
                    <i className="fa-solid fa-user-pen"></i>
                 </div>
                 <h2 className="text-4xl font-black text-slate-800 mb-12 tracking-tighter uppercase italic">{t.profile}</h2>
                 
                 <form onSubmit={(e) => { e.preventDefault(); alert(t.profileSaved); }} className="space-y-8 text-left">
                    <div className="space-y-4">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">{t.name}</label>
                       <input 
                          type="text" 
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                          className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-pink-600 outline-none font-bold text-slate-700 shadow-inner transition-all"
                          placeholder="আপনার নাম"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">{t.phone}</label>
                       <input 
                          type="tel" 
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                          className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-pink-600 outline-none font-bold text-slate-700 shadow-inner transition-all"
                          placeholder="আপনার মোবাইল নম্বর"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">{t.address}</label>
                       <textarea 
                          rows={3}
                          value={userProfile.address}
                          onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                          className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-2 border-transparent focus:border-pink-600 outline-none font-bold text-slate-700 shadow-inner transition-all"
                          placeholder="আপনার পূর্ণ ঠিকানা"
                       />
                    </div>
                    <button type="submit" className="w-full py-6 bg-pink-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-b-8 border-pink-800 uppercase tracking-widest">
                       {t.saveProfile}
                    </button>
                 </form>
              </div>
           </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-white rounded-[3rem] w-full max-w-5xl my-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-500 border-4 border-white flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
              <div className="md:w-1/2 relative bg-slate-50 flex flex-col h-[400px] md:h-auto border-r border-slate-100">
                <div className="flex-1 overflow-hidden">
                  <img 
                    src={(selectedProduct.images && selectedProduct.images[activeImageIndex]) || selectedProduct.image} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    alt={selectedProduct.name} 
                  />
                </div>
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-xl md:hidden z-10"><i className="fa-solid fa-times"></i></button>
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="p-4 bg-white flex gap-3 overflow-x-auto scrollbar-hide border-t border-slate-50">
                    {selectedProduct.images.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activeImageIndex === idx ? 'border-pink-600 scale-105 shadow-md' : 'border-slate-100 opacity-60'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto space-y-8 relative scrollbar-hide">
                <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full hidden md:flex items-center justify-center text-slate-800 hover:bg-pink-600 hover:text-white transition-all"><i className="fa-solid fa-times"></i></button>
                <div className="space-y-4">
                  <span className="px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">{selectedProduct.category}</span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">{selectedProduct.name}</h2>
                  <p className="text-4xl font-black text-pink-600 tracking-tighter">৳{selectedProduct.price}</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity (পরিমাণ)</p>
                    <div className="flex items-center gap-6">
                      <button onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-pink-600 hover:text-white transition-all shadow-sm"><i className="fa-solid fa-minus"></i></button>
                      <span className="text-3xl font-black text-slate-900 w-8 text-center">{modalQuantity}</span>
                      <button onClick={() => setModalQuantity(modalQuantity + 1)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-pink-600 hover:text-white transition-all shadow-sm"><i className="fa-solid fa-plus"></i></button>
                    </div>
                  </div>
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.size}</p>
                      <div className="flex flex-wrap gap-3">
                        {selectedProduct.sizes.map(s => (
                          <button key={s} onClick={() => setModalSize(s)} className={`px-6 py-3 rounded-xl border-2 font-black text-xs transition-all ${modalSize === s ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.color}</p>
                      <div className="flex flex-wrap gap-3">
                        {selectedProduct.colors.map(c => (
                          <button key={c} onClick={() => setModalColor(c)} className={`px-6 py-3 rounded-xl border-2 font-black text-xs transition-all ${modalColor === c ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.details}</h4>
                  <div className="text-slate-600 leading-relaxed font-medium text-sm whitespace-pre-wrap">{selectedProduct.description}</div>
                </div>
                <div className="flex flex-col gap-4 pt-6">
                  <button onClick={() => addToCart({
                      id: selectedProduct.id,
                      name: selectedProduct.name,
                      price: selectedProduct.price,
                      image: selectedProduct.image,
                      quantity: modalQuantity,
                      selectedSize: modalSize,
                      selectedColor: modalColor,
                      selectedImage: (selectedProduct.images && selectedProduct.images[activeImageIndex]) || selectedProduct.image
                    })} className="w-full py-5 bg-slate-100 text-slate-800 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"><i className="fa-solid fa-cart-shopping"></i> {t.addToCart}</button>
                  <button onClick={handleBuyNow} className="w-full py-6 bg-pink-600 text-white rounded-2xl font-black text-2xl shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-pink-800"><i className="fa-solid fa-bolt"></i> {t.buyNow}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MyOrders */}
        {currentPage === Page.MyOrders && (
          <div className="max-w-4xl mx-auto py-10 animate-in slide-in-from-bottom-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-6 italic"><div className="w-16 h-16 rounded-3xl bg-pink-600 flex items-center justify-center text-white shadow-xl"><i className="fa-solid fa-clock-rotate-left"></i></div>{t.myOrders}</h2>
              <div className="relative group w-full md:w-80">
                <input type="text" placeholder={t.orderSearchPlaceholder} value={orderSearchQuery} onChange={(e) => setOrderSearchQuery(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-pink-100 focus:border-pink-600 outline-none font-bold text-slate-700 shadow-sm transition-all" />
                <i className="fa-solid fa-magnifying-glass absolute right-5 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors"></i>
              </div>
            </div>
            {filteredCustomerOrders.length === 0 ? (
              <div className="bg-white p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-100 shadow-2xl">
                <p className="text-slate-400 font-black text-2xl mb-10 tracking-widest uppercase">{orderSearchQuery ? "কোনো অর্ডার পাওয়া যায়নি!" : t.noHistory}</p>
                <button onClick={() => { setOrderSearchQuery(''); setCurrentPage(Page.Home); }} className="px-12 py-6 bg-pink-600 text-white rounded-full font-black text-xl shadow-2xl hover:scale-110 transition-all">{t.startShopping}</button>
              </div>
            ) : (
              <div className="grid gap-10">
                {filteredCustomerOrders.map(o => (
                  <div key={o.id} className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-50 group hover:border-pink-600 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <button onClick={() => copyToClipboard(o.id, 'অর্ডার আইডি')} className="flex items-center gap-2 text-[10px] font-black bg-slate-100 px-4 py-1.5 rounded-full text-slate-500 uppercase tracking-widest hover:bg-pink-100 hover:text-pink-600 transition-all">{o.id} <i className="fa-solid fa-copy"></i></button>
                          <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${o.status === 'Pending' ? 'bg-orange-100 text-orange-600' : o.status === 'Confirmed' ? 'bg-blue-100 text-blue-600' : o.status === 'Shipped' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>{t[o.status.toLowerCase() as keyof typeof t] || o.status}</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-5xl tracking-tighter">৳{o.total}</h4>
                        <p className="text-slate-400 font-bold mt-2">{new Date(o.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 border border-slate-100">
                      {o.items.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-6 bg-white p-4 rounded-3xl shadow-sm">
                          <img src={i.selectedImage || i.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-slate-100" alt="" />
                          <div className="flex-1">
                            <h5 className="font-black text-slate-800 text-xl tracking-tight">{i.name}</h5>
                            <div className="flex gap-2 mt-2">
                               {i.selectedSize && <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase text-slate-400">Size: {i.selectedSize}</span>}
                               {i.selectedColor && <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase text-slate-400">Color: {i.selectedColor}</span>}
                            </div>
                          </div>
                          <div className="text-right"><p className="font-black text-slate-900">৳{i.price}</p><p className="text-xs font-bold text-slate-400">Qty: {i.quantity}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checkout */}
        {currentPage === Page.Checkout && (
          <div className="max-w-4xl mx-auto py-10">
            <div className="bg-white p-10 md:p-20 rounded-[5rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.1)] border-8 border-white animate-in slide-in-from-bottom-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-6 italic"><div className="w-16 h-16 rounded-3xl bg-pink-600 flex items-center justify-center text-white shadow-xl rotate-3"><i className="fa-solid fa-truck-fast"></i></div>{t.checkout}</h2>
                 {(userProfile.name || userProfile.phone || userProfile.address) && (
                   <button 
                      onClick={handleFillFromProfile}
                      className="px-6 py-3 bg-pink-50 text-pink-600 rounded-2xl font-black text-sm hover:bg-pink-100 transition-all shadow-sm flex items-center gap-2 border border-pink-100"
                   >
                      <i className="fa-solid fa-bolt"></i> {t.fillFromProfile}
                   </button>
                 )}
              </div>
              <form onSubmit={handleCheckout} className="space-y-12">
                <div className="bg-pink-50 border-4 border-pink-100 p-10 rounded-[4rem] relative overflow-hidden">
                  <h4 className="font-black text-pink-700 text-2xl mb-6">{t.paymentMethod}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                     <button type="button" onClick={() => setPaymentMethod('bKash')} className={`py-6 rounded-[2rem] font-black text-lg transition-all border-4 ${paymentMethod === 'bKash' ? 'bg-pink-600 text-white border-pink-700 shadow-lg' : 'bg-white text-pink-400 border-pink-100'}`}>{t.fullPayment}</button>
                     <button type="button" onClick={() => setPaymentMethod('COD')} className={`py-6 rounded-[2rem] font-black text-lg transition-all border-4 ${paymentMethod === 'COD' ? 'bg-pink-600 text-white border-pink-700 shadow-lg' : 'bg-white text-pink-400 border-pink-100'}`}>{t.cod}</button>
                  </div>
                  <p className="text-pink-600 text-xl leading-relaxed mb-8 font-medium">{paymentMethod === 'COD' ? `অর্ডার কনফার্ম করতে ডেলিভারি চার্জ ৳${DELIVERY_FEES[deliveryArea]} নিচের নম্বরে বিকাশ করুন। বাকি টাকা পণ্য হাতে পেয়ে দিবেন।` : `অর্ডার কনফার্ম করতে ডেলিভারি চার্জসহ মোট ৳${cartSubtotal + DELIVERY_FEES[deliveryArea]} নিচের নম্বরে বিকাশ করুন।`}</p>
                  <div className="flex items-center justify-between bg-white/80 p-8 rounded-[3rem] border-2 border-pink-100 shadow-inner mb-8">
                     <div><span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block mb-1">বিকাশ নম্বর:</span><p className="text-4xl font-black text-slate-900 tracking-tighter">{BKASH_NUMBER}</p></div>
                     <button type="button" onClick={() => copyToClipboard(BKASH_NUMBER, 'বিকাশ নম্বর')} className="w-16 h-16 bg-pink-600 text-white rounded-3xl shadow-lg hover:scale-110 transition-all"><i className="fa-solid fa-copy text-2xl"></i></button>
                  </div>
                  <input required type="text" value={checkoutForm.trxId} onChange={e => setCheckoutForm({...checkoutForm, trxId: e.target.value})} className="w-full px-10 py-7 rounded-[2.5rem] bg-white border-4 border-transparent focus:border-pink-600 outline-none font-mono font-black text-2xl shadow-xl transition-all" placeholder={t.trxPlaceholder} />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <button type="button" onClick={() => setDeliveryArea('inside')} className={`py-8 rounded-[2.5rem] border-4 font-black text-xl transition-all ${deliveryArea === 'inside' ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-2xl scale-105' : 'border-slate-50 text-slate-400 bg-slate-50'}`}>{t.insideDhaka} (৳৭০)</button>
                   <button type="button" onClick={() => setDeliveryArea('outside')} className={`py-8 rounded-[2.5rem] border-4 font-black text-xl transition-all ${deliveryArea === 'outside' ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-2xl scale-105' : 'border-slate-50 text-slate-400 bg-slate-50'}`}>{t.outsideDhaka} (৳১৩০)</button>
                </div>
                <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-4 shadow-2xl">
                   <div className="flex justify-between font-bold text-white/60 text-xl"><span>{t.price}:</span><span>৳{cartSubtotal}</span></div>
                   <div className="flex justify-between font-bold text-white/60 text-xl"><span>{t.deliveryCharge}:</span><span>৳{DELIVERY_FEES[deliveryArea]}</span></div>
                   <div className="h-px bg-white/10 my-4"></div>
                   <div className="flex justify-between font-black text-5xl tracking-tighter"><span>{t.total}:</span><span className="text-amber-400">৳{cartSubtotal + DELIVERY_FEES[deliveryArea]}</span></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input required type="text" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full px-10 py-7 rounded-[2.5rem] bg-slate-50 border-4 border-slate-50 focus:border-pink-600 outline-none text-xl font-bold shadow-inner" placeholder={t.name} />
                  <input required type="tel" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full px-10 py-7 rounded-[2.5rem] bg-slate-50 border-4 border-slate-50 focus:border-pink-600 outline-none text-xl font-bold shadow-inner" placeholder={t.phone} />
                  <textarea required rows={4} value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full md:col-span-2 px-10 py-7 rounded-[3rem] bg-slate-50 border-4 border-slate-50 focus:border-pink-600 outline-none text-xl font-bold shadow-inner" placeholder={t.address} />
                </div>
                <button type="submit" className="w-full py-10 bg-pink-600 text-white rounded-[3.5rem] font-black text-4xl shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-widest border-b-[12px] border-pink-800">{t.confirmOrder}</button>
              </form>
            </div>
          </div>
        )}

        {/* Admin Login Password Check */}
        {currentPage === Page.Admin && (
          isAdminAuthenticated ? (
            <div className="min-h-[85vh] flex flex-col md:flex-row gap-12 py-10 animate-in slide-in-from-right-4 duration-700">
              <aside className="md:w-80 shrink-0">
                <div className="bg-white p-8 rounded-[4rem] shadow-2xl border border-pink-100 flex flex-col gap-4 sticky top-28">
                  <button onClick={() => setAdminTab('inventory')} className={`w-full text-left px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all ${adminTab === 'inventory' ? 'bg-pink-600 text-white shadow-xl' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}><i className="fa-solid fa-box mr-4"></i> Inventory</button>
                  <button onClick={() => setAdminTab('orders')} className={`w-full text-left px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all ${adminTab === 'orders' ? 'bg-pink-600 text-white shadow-xl' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}><i className="fa-solid fa-receipt mr-4"></i> Orders</button>
                  <button onClick={() => setAdminTab('settings')} className={`w-full text-left px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all ${adminTab === 'settings' ? 'bg-pink-600 text-white shadow-xl' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}><i className="fa-solid fa-gear mr-4"></i> Settings</button>
                  <button onClick={() => setIsAdminAuthenticated(false)} className="w-full text-left px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs text-red-500 hover:bg-red-50 mt-10"><i className="fa-solid fa-power-off mr-4"></i> Logout</button>
                </div>
              </aside>
              <div className="flex-1 bg-white rounded-[4rem] p-10 md:p-20 border border-pink-100 shadow-2xl min-h-[600px]">
                {adminTab === 'inventory' && (
                  <div>
                    <div className="flex justify-between items-center mb-16">
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Inventory</h2>
                      <button onClick={() => setEditingProduct({ name: '', description: '', price: 0, images: [], category: CATEGORIES[1], stock: 0, sizes: '', colors: '' })} className="px-10 py-6 bg-pink-600 text-white rounded-full font-black text-lg shadow-xl">+ Add Product</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {products.map(p => (
                        <div key={p.id} className="p-6 border-4 border-pink-50 rounded-[3rem] flex flex-col gap-6 group hover:border-pink-200 transition-all shadow-sm">
                          <img src={p.image} className="w-full h-56 rounded-[2rem] object-cover shadow-lg" alt="" />
                          <div className="space-y-2"><h4 className="font-black text-slate-800 text-2xl tracking-tighter uppercase line-clamp-1">{p.name}</h4><p className="text-pink-600 font-black text-3xl tracking-tighter">৳{p.price}</p></div>
                          <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <button onClick={() => setEditingProduct({...p, sizes: p.sizes?.join(', '), colors: p.colors?.join(', ')})} className="flex-1 py-5 bg-slate-100 rounded-3xl font-black text-[10px] uppercase tracking-widest">Edit</button>
                            <button onClick={() => { if(confirm("পণ্যটি ডিলিট করতে চান?")) setProducts(products.filter(item => item.id !== p.id)) }} className="flex-1 py-5 bg-red-50 text-red-500 rounded-3xl font-black text-[10px] uppercase tracking-widest">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {adminTab === 'orders' && (
                  <div className="space-y-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Orders</h2>
                      <div className="relative group w-full md:w-96">
                        <input type="text" placeholder="ID, ফোন বা নাম দিয়ে খুঁজুন" value={adminOrderSearchQuery} onChange={(e) => setAdminOrderSearchQuery(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-pink-50 border-2 border-transparent focus:border-pink-600 outline-none font-bold text-slate-700 shadow-inner transition-all" />
                        <i className="fa-solid fa-magnifying-glass absolute right-5 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors"></i>
                      </div>
                    </div>
                    <div className="grid gap-12">
                      {filteredAdminOrders.map(o => (
                        <div key={o.id} className="p-10 border-4 border-pink-50 rounded-[4rem] transition-all relative overflow-hidden hover:border-pink-100 shadow-sm">
                          <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
                            <div className="space-y-4">
                              <button onClick={() => copyToClipboard(o.id, 'অর্ডার আইডি')} className="flex items-center gap-2 text-[10px] font-black bg-slate-100 text-slate-400 px-5 py-2 rounded-full uppercase tracking-widest hover:bg-pink-100 hover:text-pink-600 transition-all border border-pink-50 shadow-sm">{o.id} <i className="fa-solid fa-copy"></i></button>
                              <h3 className="text-4xl font-black text-slate-900 tracking-tight">{o.customerName}</h3>
                              <p className="text-2xl font-black text-pink-600 italic"><i className="fa-solid fa-phone mr-3"></i>{o.phone}</p>
                              <p className="text-slate-500 font-medium"><b>ঠিকানা:</b> {o.address}</p>
                            </div>
                            <div className="lg:text-right flex flex-col justify-end"><p className="text-6xl font-black text-pink-600 tracking-tighter leading-none mb-4">৳{o.total}</p><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment: {o.paymentMethod}</p></div>
                          </div>
                          <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-8 border border-slate-100 space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordered Products:</h5>
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-50">
                                <img src={item.selectedImage || item.image} className="w-20 h-20 rounded-2xl object-cover shadow-md shrink-0 border-2 border-white" alt="" />
                                <div className="flex-1">
                                    <h5 className="font-black text-slate-800 text-lg leading-tight">{item.name}</h5>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {item.selectedSize && <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-500 uppercase">Size: {item.selectedSize}</span>}
                                      {item.selectedColor && <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-500 uppercase">Color: {item.selectedColor}</span>}
                                      <span className="bg-pink-50 px-2.5 py-1 rounded-lg text-[9px] font-black text-pink-600 uppercase">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                                <div className="text-right font-black text-slate-900">৳{item.price * item.quantity}</div>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 pt-10 border-t border-slate-100">
                            {o.status === 'Pending' && <button onClick={() => updateOrderStatus(o.id, 'Confirmed')} className="flex-1 py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Confirm</button>}
                            {o.status === 'Confirmed' && <button onClick={() => updateOrderStatus(o.id, 'Shipped')} className="flex-1 py-6 bg-purple-600 text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Ship</button>}
                            {o.status === 'Shipped' && <button onClick={() => updateOrderStatus(o.id, 'Delivered')} className="flex-1 py-6 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Complete</button>}
                            <button onClick={() => { if(confirm("অর্ডারটি ডিলিট করতে চান?")) setOrders(orders.filter(item => item.id !== o.id)) }} className="px-10 py-6 bg-red-50 text-red-500 rounded-3xl font-black uppercase tracking-widest hover:bg-red-100 transition-all">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {adminTab === 'settings' && (
                  <div className="text-center max-w-3xl mx-auto space-y-16">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-20">Settings</h2>
                    <div className="bg-slate-50 p-16 rounded-[5rem] border-8 border-dashed border-pink-200 relative">
                      <div className="w-56 h-56 bg-white rounded-[3.5rem] mx-auto mb-12 overflow-hidden shadow-2xl border-8 border-white group relative">
                        <img src={shopLogo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <label className="inline-block px-14 py-7 bg-pink-600 text-white rounded-full font-black text-2xl cursor-pointer hover:scale-110 transition-all shadow-2xl uppercase tracking-widest">
                        <i className="fa-solid fa-cloud-arrow-up mr-3"></i> Logo Change
                        <input type="file" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-[80vh] flex items-center justify-center">
              <div className="bg-white p-16 md:p-24 rounded-[5rem] shadow-2xl border-8 border-white w-full max-w-2xl text-center animate-in zoom-in-95 duration-500">
                <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase italic">Admin Login</h2>
                <form onSubmit={(e) => { e.preventDefault(); if(adminPassword === ADMIN_PASSWORD) setIsAdminAuthenticated(true); else alert("Wrong Password!"); }}>
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-12 py-8 rounded-[3rem] bg-slate-50 border-4 border-transparent focus:border-pink-600 mb-8 outline-none font-black text-center text-3xl tracking-[0.5em] shadow-inner" placeholder="••••••••" />
                  <button type="submit" className="w-full py-8 bg-pink-600 text-white rounded-[3rem] font-black text-3xl shadow-2xl hover:scale-[1.03] transition-all uppercase tracking-widest">Enter</button>
                </form>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer Enhancements */}
      <footer className="bg-white mt-20 border-t border-pink-100 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 text-center md:text-left">
             <div className="space-y-6">
                <div className="flex items-center justify-center md:justify-start gap-4">
                   <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden shadow-lg border-2 border-pink-100">
                      <img src={shopLogo} alt="" className="w-full h-full object-cover" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">{t.storeName}</h2>
                </div>
                <p className="text-slate-500 font-medium max-w-sm mx-auto md:mx-0">আপনার নিত্যদিনের প্রয়োজনে সেরা পণ্যগুলো নিয়ে আমরা আছি আপনার পাশে। গুণগত মান ও বিশ্বাসের অন্য নাম {t.storeName}।</p>
             </div>
             
             <div className="space-y-6">
                <h4 className="text-pink-600 font-black uppercase tracking-widest text-sm">{t.contactUs}</h4>
                <div className="flex flex-col gap-4">
                   <a href={`mailto:${OFFICIAL_GMAIL}`} className="text-2xl font-black text-slate-800 tracking-tighter hover:text-pink-600 transition-colors flex items-center justify-center md:justify-start gap-3">
                      <i className="fa-solid fa-envelope text-pink-400 text-xl"></i> {OFFICIAL_GMAIL}
                   </a>
                   <div className="text-slate-800 font-black text-xl flex items-center justify-center md:justify-start gap-3">
                      <i className="fa-solid fa-phone-volume text-pink-400"></i> {maskPhone(WHATSAPP_NUMBER)}
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <h4 className="text-pink-600 font-black uppercase tracking-widest text-sm">{t.followUs}</h4>
                <div className="flex items-center justify-center md:justify-start gap-6">
                   <a href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all text-2xl shadow-sm border border-slate-100"><i className="fa-brands fa-facebook"></i></a>
                   <a href="#" className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-pink-600 hover:bg-pink-50 hover:scale-110 transition-all text-2xl shadow-sm border border-slate-100"><i className="fa-brands fa-instagram"></i></a>
                   <a href="#" className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-all text-2xl shadow-sm border border-slate-100"><i className="fa-brands fa-youtube"></i></a>
                </div>
             </div>
          </div>
          
          <div className="pt-10 border-t border-slate-50 text-center">
             <div className="text-slate-300 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                Built with Love for our Customers
             </div>
             <div className="text-slate-500 font-black uppercase tracking-widest text-xs">
                &copy; {new Date().getFullYear()} {t.storeName}. All Rights Reserved.
             </div>
          </div>
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQuantity={updateCartQuantity} 
        onCheckout={() => { setIsCartOpen(false); setCurrentPage(Page.Checkout); }} 
        lang={lang}
      />
      
      {editingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto p-12 md:p-16 shadow-2xl border-4 border-white scrollbar-hide">
            <h3 className="text-4xl font-black mb-12 tracking-tighter uppercase italic border-b-8 border-pink-50 pb-6">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2"><label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest">Product Name</label><input required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-pink-600 outline-none font-black text-xl shadow-inner" type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct(prev => prev ? {...prev, name: e.target.value} : null)} /></div>
              <div><label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest">Price (৳)</label><input required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-pink-600 outline-none font-black text-xl shadow-inner" type="number" value={editingProduct.price || 0} onChange={e => setEditingProduct(prev => prev ? {...prev, price: Number(e.target.value)} : null)} /></div>
              <div><label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest">Category</label><select className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-pink-600 outline-none font-black text-lg shadow-inner appearance-none" value={editingProduct.category || CATEGORIES[1]} onChange={e => setEditingProduct(prev => prev ? {...prev, category: e.target.value} : null)}>{CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest">Sizes (comma separated)</label><input className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-pink-600 outline-none font-black text-lg shadow-inner" type="text" placeholder="M, L, XL" value={editingProduct.sizes as string || ''} onChange={e => setEditingProduct(prev => prev ? {...prev, sizes: e.target.value} : null)} /></div>
              <div><label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest">Colors (comma separated)</label><input className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-pink-600 outline-none font-black text-lg shadow-inner" type="text" placeholder="Red, Blue" value={editingProduct.colors as string || ''} onChange={e => setEditingProduct(prev => prev ? {...prev, colors: e.target.value} : null)} /></div>
              <div className="md:col-span-2"><label className="text-xs font-black text-slate-400 uppercase mb-3 block tracking-widest">Description</label><textarea rows={4} required className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 border-4 border-transparent focus:border-pink-600 outline-none font-medium text-lg shadow-inner" value={editingProduct.description || ''} onChange={e => setEditingProduct(prev => prev ? {...prev, description: e.target.value} : null)} /></div>
              <div className="md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase mb-6 block tracking-widest">Upload Images</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-6 mb-4">
                  {(editingProduct.images || []).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-4 border-white shadow-lg"><img src={img} className="w-full h-full object-cover" alt="" /><button type="button" onClick={() => setEditingProduct(prev => prev ? {...prev, images: prev.images?.filter((_, idx) => idx !== i)} : null)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-lg"><i className="fa-solid fa-times"></i></button></div>
                  ))}
                  <label className="aspect-square rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-pink-600 hover:bg-pink-50 transition-all group">
                    <i className="fa-solid fa-plus text-slate-300 text-3xl mb-2 group-hover:text-pink-600"></i>
                    <input type="file" multiple className="hidden" onChange={handleMultipleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 flex gap-8 mt-6">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-6 bg-slate-100 rounded-full font-black uppercase tracking-widest text-slate-500">Cancel</button>
                <button type="submit" disabled={isUploading} className="flex-1 py-6 bg-pink-600 text-white rounded-full font-black uppercase tracking-widest shadow-2xl border-b-4 border-pink-800">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
