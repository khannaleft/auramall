
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Product, CartItem } from '@/types';
import Icon from './Icon';
import { useAppContext } from '@/hooks/useAppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    selectedStoreId: number | null;
}

const WishlistPopover: React.FC<{ wishlistedProducts: Product[], onProductClick: (id: number) => void }> = ({ wishlistedProducts, onProductClick }) => {
    return (
        <div className="flex flex-col">
            {wishlistedProducts.length === 0 ? (
                 <div className="p-6 text-center w-full">
                    <Icon name="heart" className="w-16 h-16 text-text-secondary/10 mx-auto mb-4" />
                    <h4 className="font-bold font-serif text-text-primary">Wishlist is Empty</h4>
                    <p className="text-sm text-text-secondary mt-1 mb-4">Tap the heart on products to save them.</p>
                </div>
            ) : (
                <>
                    <div className="p-4 space-y-3 overflow-y-auto max-h-[22rem]">
                        <h4 className="font-bold px-2">Your Wishlist</h4>
                        {wishlistedProducts.slice(0, 5).map(product => (
                            <div key={product.id} onClick={() => onProductClick(product.id)} className="flex items-center gap-4 p-2 rounded-lg hover:bg-primary cursor-pointer transition-colors">
                                <img src={product.imageUrls[0]} alt={product.name} className="w-14 h-14 object-cover rounded-md flex-shrink-0 bg-primary" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold text-text-primary truncate">{product.name}</p>
                                    <p className="text-sm text-text-secondary">₹{product.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-glass-border">
                        <Link href="/wishlist" className="w-full bg-accent text-white font-bold py-2.5 px-4 rounded-lg text-sm text-center block hover:opacity-85 transition-opacity">
                            View All ({wishlistedProducts.length})
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};


const CartPopover: React.FC<{
    cartItems: CartItem[],
    subtotal: number,
    onViewCart: () => void,
    onCheckout: () => void,
    onRemoveItem: (id: number) => void
}> = ({ cartItems, subtotal, onViewCart, onCheckout, onRemoveItem }) => {

    if (cartItems.length === 0) {
        return (
             <div className="p-6 text-center w-full">
                <Icon name="cart" className="w-16 h-16 text-text-secondary/10 mx-auto mb-4" />
                <h4 className="font-bold font-serif text-text-primary">Your Cart is Empty</h4>
                <p className="text-sm text-text-secondary mt-1 mb-4">Add items to get started.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <div className="p-4 space-y-3 overflow-y-auto max-h-80">
                 <h4 className="font-bold px-2">Your Cart</h4>
                {cartItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-primary transition-colors">
                        <img src={item.imageUrls[0]} alt={item.name} className="w-14 h-14 object-cover rounded-md flex-shrink-0 bg-primary" />
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold text-text-primary truncate">{item.name}</p>
                            <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold text-text-primary mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <button onClick={() => onRemoveItem(item.id)} className="p-1 text-text-secondary hover:text-red-500 transition-colors">
                           <Icon name="trash" className="w-4 h-4"/>
                        </button>
                    </div>
                ))}
                 {cartItems.length > 3 && <p className="text-center text-xs text-text-secondary py-1">...and {cartItems.length - 3} more items.</p>}
            </div>
            <div className="p-3 border-t border-glass-border space-y-3 bg-primary/30">
                <div className="flex justify-between font-semibold px-2">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onViewCart} className="w-full bg-secondary text-text-primary font-bold py-2.5 px-4 rounded-lg text-sm border border-glass-border hover:bg-primary transition-colors">
                        View Cart
                    </button>
                    <button onClick={onCheckout} className="w-full bg-accent text-white font-bold py-2.5 px-4 rounded-lg text-sm hover:opacity-85 transition-opacity">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ selectedStoreId }) => {
    const { 
        theme, toggleTheme, cartItems, wishlistItems, currentUser,
        handleLogout, onLoginClick, stores, handleOpenCart, products,
        handleRemoveFromCart, handleDirectCheckout
    } = useAppContext();
    
    const router = useRouter();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWishlistHovered, setIsWishlistHovered] = useState(false);
    const [isCartHovered, setIsCartHovered] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    
    const currentStore = useMemo(() => stores.find(s => s.id === selectedStoreId), [stores, selectedStoreId]);
    const cartItemCount = useMemo(() => (selectedStoreId && cartItems[selectedStoreId]) ? (cartItems[selectedStoreId] || []).reduce((sum, item) => sum + item.quantity, 0) : 0, [cartItems, selectedStoreId]);
    const wishlistItemCount = wishlistItems.length;

    const wishlistedProducts = useMemo(() => 
        wishlistItems.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[],
        [wishlistItems, products]
    );

    const activeCartItems = useMemo(() => (selectedStoreId && cartItems[selectedStoreId]) ? (cartItems[selectedStoreId] || []) : [], [cartItems, selectedStoreId]);
    const cartSubtotal = useMemo(() => activeCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [activeCartItems]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onOrdersClick = () => router.push(`/orders`);
    const onAdminClick = () => router.push('/admin');
    const onStoreManagerClick = () => router.push('/manager');

    const onProductClickFromPopover = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            router.push(`/${product.storeId}?product=${productId}`);
            setIsWishlistHovered(false); // Close popover on click
        }
    };
    
    const onOpenCartModalFromPopover = () => {
        if(selectedStoreId) handleOpenCart(selectedStoreId);
        setIsCartHovered(false);
    }
    
    const onCheckoutFromPopover = () => {
        if (selectedStoreId) handleDirectCheckout(selectedStoreId);
        setIsCartHovered(false);
    }


    const NavButton: React.FC<{onClick?: () => void, href?: string, 'aria-label': string, children: React.ReactNode, hasBadge?: boolean, badgeCount?: number}> = ({onClick, href, 'aria-label': ariaLabel, children, hasBadge, badgeCount}) => {
        const content = (
            <>
                {children}
                {hasBadge && badgeCount! > 0 && (
                    <span className="absolute top-0 right-0 block w-4 h-4 transform translate-x-1/4 -translate-y-1/4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {badgeCount}
                    </span>
                )}
            </>
        );

        const className = "relative p-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors";

        if (href) {
            return <Link href={href} className={className} aria-label={ariaLabel}>{content}</Link>;
        }

        return (
            <button
                onClick={onClick}
                className={className}
                aria-label={ariaLabel}
            >
                {content}
            </button>
        );
    }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="container mx-auto flex justify-between items-center p-3 md:p-4 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-xl shadow-lg">
        <Link href="/" className="flex-1 cursor-pointer">
          <h1 className="text-xl md:text-2xl font-serif font-bold text-text-primary flex items-center gap-2">
            <Icon name="store" className="w-6 h-6 text-accent hidden sm:block" />
            {currentStore?.name || 'Aura'}
          </h1>
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
            <NavButton onClick={toggleTheme} aria-label="Toggle theme">
                 <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-5 h-5" />
            </NavButton>
            {selectedStoreId && (
                <>
                 <div className="relative" onMouseEnter={() => setIsWishlistHovered(true)} onMouseLeave={() => setIsWishlistHovered(false)}>
                    <NavButton href={`/wishlist`} aria-label="Open wishlist" hasBadge={wishlistItemCount > 0} badgeCount={wishlistItemCount}>
                        <Icon name="heart" className={`w-5 h-5 ${wishlistItemCount > 0 ? 'fill-accent text-accent' : 'fill-none'}`} />
                    </NavButton>
                     {isWishlistHovered && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl animate-fade-in-up origin-top-right z-20 overflow-hidden">
                            <WishlistPopover wishlistedProducts={wishlistedProducts} onProductClick={onProductClickFromPopover} />
                        </div>
                    )}
                </div>
                
                 <div className="relative" onMouseEnter={() => setIsCartHovered(true)} onMouseLeave={() => setIsCartHovered(false)}>
                    <NavButton onClick={onOpenCartModalFromPopover} aria-label="Open cart" hasBadge={cartItemCount > 0} badgeCount={cartItemCount}>
                        <Icon name="cart" className="w-5 h-5" />
                    </NavButton>
                     {isCartHovered && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl animate-fade-in-up origin-top-right z-20 overflow-hidden">
                            <CartPopover 
                                cartItems={activeCartItems}
                                subtotal={cartSubtotal}
                                onViewCart={onOpenCartModalFromPopover}
                                onCheckout={onCheckoutFromPopover}
                                onRemoveItem={(productId) => handleRemoveFromCart(selectedStoreId, productId)}
                            />
                        </div>
                    )}
                </div>
                </>
            )}

            <div className="w-px h-6 bg-glass-border mx-2"></div>

            {currentUser ? (
                 <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(prev => !prev)}
                        className="w-9 h-9 rounded-full bg-accent-secondary flex items-center justify-center"
                        aria-label="Open user menu"
                    >
                        <span className="font-bold text-accent">{currentUser.name.charAt(0).toUpperCase()}</span>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-3 w-64 bg-secondary rounded-xl shadow-2xl border border-glass-border animate-fade-in-up origin-top-right p-2">
                            <div className="px-3 py-2 border-b border-glass-border">
                                <p className="text-sm font-semibold text-text-primary truncate">{currentUser.name}</p>
                                <p className="text-xs text-text-secondary truncate">{currentUser.email}</p>
                            </div>
                            <div className="py-1">
                                {currentUser.role === 'admin' && (
                                    <button
                                        onClick={() => { onAdminClick(); setIsProfileOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-primary rounded-md flex items-center gap-3"
                                    >
                                        <Icon name="shield-check" className="w-5 h-5 text-accent"/>
                                        Admin Panel
                                    </button>
                                )}
                                {currentUser.role === 'store_owner' && (
                                    <button
                                        onClick={() => { onStoreManagerClick(); setIsProfileOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-primary rounded-md flex items-center gap-3"
                                    >
                                        <Icon name="store" className="w-5 h-5 text-accent"/>
                                        Store Management
                                    </button>
                                )}
                                <button
                                    onClick={() => { onOrdersClick(); setIsProfileOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-primary rounded-md flex items-center gap-3"
                                    >
                                    <Icon name="package" className="w-5 h-5 text-accent"/>
                                    My Orders
                                </button>
                            </div>
                             <div className="pt-1 border-t border-glass-border">
                                <button
                                    onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-primary rounded-md flex items-center gap-3"
                                >
                                    <Icon name="logout" className="w-5 h-5 text-accent"/>
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                 </div>
            ) : (
                <button
                    onClick={onLoginClick}
                    className="bg-accent text-white font-bold py-2 px-5 rounded-lg hover:opacity-85 transition-opacity duration-300 text-sm"
                >
                    Sign In
                </button>
            )}
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
