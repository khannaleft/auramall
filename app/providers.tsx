
'use client';

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem, Theme, User, Order, DiscountCode, Store, Toast } from '@/types';
import * as firebaseService from '@/services/firebaseService';
import { onAuthStateChanged, signOut, FirebaseUser } from '@/services/firebaseService';
import useLocalStorage from '@/hooks/useLocalStorage';
import AuthModal from '@/components/AuthModal';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  stores: Store[];
  products: Product[];
  orders: Order[];
  discountCodes: DiscountCode[];
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  
  cartItems: Record<number, CartItem[]>;
  wishlistItems: number[];
  appliedDiscount: DiscountCode | null;
  
  fetchAllData: () => Promise<void>;
  
  handleLogin: (email: string, password: string) => Promise<void>;
  handleSignup: (name: string, email: string, password: string) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  
  handleAddToCart: (productToAdd: Product) => void;
  handleToggleWishlist: (productId: number) => void;
  handleUpdateQuantity: (storeId: number, productId: number, newQuantity: number) => void;
  handleRemoveFromCart: (storeId: number, productId: number) => void;
  
  handleApplyDiscount: (code: string) => { success: boolean; message: string };
  handleRemoveDiscount: () => void;
  handlePlaceOrder: (details: { phone: string }, status: Order['status']) => Promise<string | undefined>;

  handleAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  handleUpdateProduct: (productId: number, data: Partial<Product>) => Promise<void>;
  handleDeleteProduct: (productId: number) => Promise<void>;
  handleUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  handleUpdateProductStock: (productId: number, newStock: number) => Promise<void>;
  handleAddDiscountCode: (code: DiscountCode) => Promise<void>;
  handleDeleteDiscountCode: (codeToDelete: string) => Promise<void>;
  handleAddStore: (store: Omit<Store, 'id'>) => Promise<void>;
  handleUpdateStore: (storeId: number, updatedData: Partial<Store>) => Promise<void>;
  handleDeleteStore: (storeId: number) => Promise<void>;
  handleUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;

  addToast: (message: string, type?: Toast['type']) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;

  onLoginClick: () => void;
  isAuthModalOpen: boolean;
  onCloseAuthModal: () => void;

  handleOpenCart: (storeId: number) => void;
  handleDirectCheckout: (storeId: number) => void;
  handleOpenPaymentResultModal: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [cartItems, setCartItems] = useLocalStorage<Record<number, CartItem[]>>('multiCart', {});
  const [wishlistItems, setWishlistItems] = useLocalStorage<number[]>('wishlist', []);
  const [appliedDiscount, setAppliedDiscount] = useLocalStorage<DiscountCode | null>('appliedDiscount', null);

  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeStoreId, setActiveStoreId] = useState<number | null>(null);

  const onLoginClick = useCallback(() => setIsAuthModalOpen(true), []);
  const onCloseAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const handleOpenCart = useCallback((storeId: number) => {
    setActiveStoreId(storeId);
    setIsCartModalOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => setIsCartModalOpen(false), []);
  
  const handleOpenCheckout = useCallback(() => {
    if (!activeStoreId) return;
    setIsCartModalOpen(false);
    setIsCheckoutModalOpen(true);
  }, [activeStoreId]);

  const handleDirectCheckout = useCallback((storeId: number) => {
    setActiveStoreId(storeId);
    setIsCartModalOpen(false);
    setIsCheckoutModalOpen(true);
  }, []);
  
  const handleOpenPaymentResultModal = useCallback(() => {
    setIsCheckoutModalOpen(true);
  }, []);

  const handleCloseCheckout = useCallback(() => {
    setIsCheckoutModalOpen(false);
  }, []);

  const handleLoginRequestFromCheckout = useCallback(() => {
    handleCloseCheckout();
    onLoginClick();
  }, [handleCloseCheckout, onLoginClick]);
  
  const activeCartItems = useMemo(() => activeStoreId ? cartItems[activeStoreId] || [] : [], [cartItems, activeStoreId]);

  const cartTotals = useMemo(() => {
    const subtotal = activeCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = appliedDiscount ? (appliedDiscount.type === 'percentage' ? subtotal * (appliedDiscount.value / 100) : appliedDiscount.value) : 0;
    const finalDiscount = Math.min(subtotal, discountAmount);
    const taxes = (subtotal - finalDiscount) * 0.08;
    const total = subtotal - finalDiscount + taxes;
    return { subtotal, discountAmount: finalDiscount, taxes, total };
  }, [activeCartItems, appliedDiscount]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const newId = `${Date.now()}-${Math.random()}`;
    setToasts(prevToasts => {
      if (prevToasts.length > 0 && prevToasts[0].message === message) {
        const lastToastId = prevToasts[0].id;
        const lastToastTime = parseInt(lastToastId.split('-')[0], 10);
        if (!isNaN(lastToastTime) && Date.now() - lastToastTime < 100) {
          return prevToasts;
        }
      }
      return [{ id: newId, message, type }, ...prevToasts];
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      await firebaseService.seedData();
      const [fetchedProducts, fetchedStores, fetchedCodes, fetchedOrders, fetchedUsers] = await Promise.all([
        firebaseService.getProducts(),
        firebaseService.getStores(),
        firebaseService.getDiscountCodes(),
        firebaseService.getOrders(),
        firebaseService.getUsers()
      ]);
      setProducts(fetchedProducts);
      setStores(fetchedStores);
      setDiscountCodes(fetchedCodes);
      setOrders(fetchedOrders);
      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      addToast("Failed to load store data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseService.auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userProfile = await firebaseService.getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          userProfile = await firebaseService.createUserProfile(firebaseUser);
        }
        setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await firebaseService.signInWithEmailAndPassword(firebaseService.auth, email, password);
    addToast(`Welcome back!`, 'success');
    onCloseAuthModal();
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    const userCredential = await firebaseService.createUserWithEmailAndPassword(firebaseService.auth, email, password);
    await firebaseService.createUserProfile(userCredential.user as FirebaseUser, name);
    addToast(`Welcome to Aura, ${name}!`, 'success');
    onCloseAuthModal();
  };
  
  const handleGoogleLogin = async () => {
    const userCredential = await firebaseService.signInWithPopup(firebaseService.auth, firebaseService.googleProvider);
    if (!userCredential.user) return;
    addToast(`Welcome to Aura!`, 'success');
    onCloseAuthModal();
  };

  const handleLogout = async () => {
    await signOut(firebaseService.auth);
    addToast("You've been logged out.", 'info');
  };

  const handleAddToCart = useCallback((productToAdd: Product) => {
    const storeId = productToAdd.storeId;
    setCartItems(prev => {
      const currentCart = prev[storeId] || [];
      const existingItem = currentCart.find(item => item.id === productToAdd.id);
      if (existingItem) {
        if (existingItem.quantity < productToAdd.stock) {
          const updatedCart = currentCart.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
          addToast(`${productToAdd.name} quantity updated!`, 'success');
          return { ...prev, [storeId]: updatedCart };
        } else {
          addToast(`Max stock reached for ${productToAdd.name}.`, 'info');
          return prev;
        }
      }
      if (productToAdd.stock > 0) {
        addToast(`${productToAdd.name} added to cart!`, 'success');
        return { ...prev, [storeId]: [...currentCart, { ...productToAdd, quantity: 1 }] };
      }
      return prev;
    });
  }, [addToast, setCartItems]);

  const handleToggleWishlist = useCallback((productId: number) => {
    const isAdding = !wishlistItems.includes(productId);
    const product = products.find(p => p.id === productId);
    setWishlistItems(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    if (product) {
      addToast(`${product.name} ${isAdding ? 'added to' : 'removed from'} wishlist!`, 'success');
    }
  }, [wishlistItems, products, addToast, setWishlistItems]);

  const handleUpdateQuantity = useCallback((storeId: number, productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setCartItems(prev => {
      let currentCart = prev[storeId] || [];
      if (newQuantity < 1) {
        currentCart = currentCart.filter(item => item.id !== productId);
      } else if (newQuantity <= product.stock) {
        currentCart = currentCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
      }
      return { ...prev, [storeId]: currentCart };
    });
  }, [products, setCartItems]);

  const handleRemoveFromCart = useCallback((storeId: number, productId: number) => {
    setCartItems(prev => ({ ...prev, [storeId]: (prev[storeId] || []).filter(item => item.id !== productId) }));
  }, [setCartItems]);

  const handleApplyDiscount = (code: string) => {
    const foundCode = discountCodes.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (foundCode) {
      setAppliedDiscount(foundCode);
      addToast(`Code "${foundCode.code}" applied!`, 'success');
      return { success: true, message: `Code applied successfully!` };
    }
    addToast("Invalid discount code.", 'error');
    return { success: false, message: "Invalid discount code." };
  };

  const handleRemoveDiscount = () => setAppliedDiscount(null);

  const handlePlaceOrder = async (details: { phone: string }, status: Order['status']): Promise<string | undefined> => {
    if (!currentUser || !activeStoreId) return;
    
    const newOrderData: Omit<Order, 'id'> = {
      userEmail: currentUser.email, storeId: activeStoreId, phone: details.phone,
      date: new Date().toISOString(), items: activeCartItems,
      subtotal: cartTotals.subtotal, discount: cartTotals.discountAmount, taxes: cartTotals.taxes, total: cartTotals.total, status: status
    };
    
    const orderId = await firebaseService.placeOrder(newOrderData);
    
    if (status !== 'Pending Payment') {
        await fetchAllData();
        setCartItems(prev => ({ ...prev, [activeStoreId]: [] }));
        setAppliedDiscount(null);
    } else {
        await fetchAllData();
    }
    return orderId;
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    await firebaseService.addProduct(product);
    await fetchAllData();
    addToast('Product added successfully!', 'success');
  };

  const handleUpdateProduct = async (productId: number, data: Partial<Product>) => {
    await firebaseService.updateProduct(productId, data);
    await fetchAllData();
    addToast('Product updated successfully!', 'success');
  };

  const handleDeleteProduct = async (productId: number) => {
    await firebaseService.deleteProduct(productId);
    await fetchAllData();
    addToast('Product deleted.', 'info');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await firebaseService.updateOrderStatus(orderId, status);
    await fetchAllData();
    addToast(`Order status updated.`, 'success');
  };

  const handleUpdateProductStock = async (productId: number, newStock: number) => {
    await firebaseService.updateProductStock(productId, newStock);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    addToast('Stock updated successfully!', 'success');
  };

  const handleAddDiscountCode = async (code: DiscountCode) => {
    await firebaseService.addDiscountCode(code);
    await fetchAllData();
    addToast(`Discount code added.`, 'success');
  };

  const handleDeleteDiscountCode = async (codeToDelete: string) => {
    await firebaseService.deleteDiscountCode(codeToDelete);
    await fetchAllData();
    addToast(`Discount code removed.`, 'info');
  };
  
  const handleAddStore = async (store: Omit<Store, 'id'>) => {
    await firebaseService.addStore(store);
    await fetchAllData();
    addToast('Store added successfully!', 'success');
  };

  const handleUpdateStore = async (storeId: number, updatedData: Partial<Store>) => {
    await firebaseService.updateStore(storeId, updatedData);
    await fetchAllData();
    addToast('Store details updated successfully!', 'success');
  };

  const handleDeleteStore = async (storeId: number) => {
    await firebaseService.deleteStore(storeId);
    await fetchAllData();
    addToast('Store deleted.', 'info');
  };

  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    await firebaseService.updateUser(userId, data);
    await fetchAllData();
    addToast('User role updated successfully!', 'success');
  };

  const value: AppContextType = {
    theme, toggleTheme, stores, products, orders, discountCodes, currentUser, allUsers, isLoading,
    cartItems, wishlistItems, appliedDiscount,
    fetchAllData, handleLogin, handleSignup, handleGoogleLogin, handleLogout,
    handleAddToCart, handleToggleWishlist, handleUpdateQuantity, handleRemoveFromCart,
    handleApplyDiscount, handleRemoveDiscount, handlePlaceOrder,
    handleAddProduct, handleUpdateProduct, handleDeleteProduct, handleUpdateOrderStatus, handleUpdateProductStock,
    handleAddDiscountCode, handleDeleteDiscountCode, handleAddStore, handleUpdateStore, handleDeleteStore, handleUpdateUser,
    addToast, toasts, removeToast,
    onLoginClick, isAuthModalOpen, onCloseAuthModal,
    handleOpenCart,
    handleDirectCheckout,
    handleOpenPaymentResultModal,
  };

  return (
    <AppContext.Provider value={value}>
        {children}
        <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={onCloseAuthModal} 
            onLogin={handleLogin}
            onSignup={handleSignup}
            onGoogleLogin={handleGoogleLogin}
        />
        <CartModal
            isOpen={isCartModalOpen}
            onClose={handleCloseCart}
            cartItems={activeCartItems.map(item => ({...item, stock: products.find(p => p.id === item.id)?.stock ?? 0}))}
            onUpdateQuantity={(productId, newQuantity) => activeStoreId && handleUpdateQuantity(activeStoreId, productId, newQuantity)}
            onRemoveItem={(productId) => activeStoreId && handleRemoveFromCart(activeStoreId, productId)}
            onCheckout={handleOpenCheckout}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            appliedDiscount={appliedDiscount}
            cartTotals={cartTotals}
        />
        <CheckoutModal 
            isOpen={isCheckoutModalOpen}
            onClose={handleCloseCheckout}
            onPlaceOrder={handlePlaceOrder}
            currentUser={currentUser}
            onLoginRequest={handleLoginRequestFromCheckout}
            cartTotals={cartTotals}
            cartItems={activeCartItems}
        />
    </AppContext.Provider>
  );
};
