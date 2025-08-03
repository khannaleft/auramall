
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Product, SortOption } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import ProductControls from '@/components/ProductControls';
import ProductList from '@/components/ProductList';
import ProductListSkeleton from '@/components/ProductListSkeleton';
import ProductDetailPage from '@/components/ProductDetailPage';
import Location from '@/components/Location';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/Icon';

interface ShopPageClientProps {
    products: Product[];
    storeId: number;
}

// A small inline component for the floating button
const FloatingCartButton: React.FC<{ onClick: () => void; itemCount: number; }> = ({ onClick, itemCount }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 bg-accent text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-40"
        aria-label="Open cart"
    >
        <Icon name="cart" className="w-8 h-8" />
        {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 block w-6 h-6 bg-secondary text-accent text-xs font-bold rounded-full flex items-center justify-center border-2 border-accent">
                {itemCount > 9 ? '9+' : itemCount}
            </span>
        )}
    </button>
);

const ShopPageClient: React.FC<ShopPageClientProps> = ({ products, storeId }) => {
    const { 
        cartItems, stores, handleAddToCart, handleToggleWishlist, wishlistItems, handleOpenCart
    } = useAppContext();
    
    const searchParams = useSearchParams();
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [sortOption, setSortOption] = useState<SortOption>('default');

    useEffect(() => {
        const productIdFromQuery = searchParams.get('product');
        if (productIdFromQuery) {
            const id = Number(productIdFromQuery);
            if (!isNaN(id)) {
                setSelectedProductId(id);
            }
        }
    }, [searchParams]);

    const selectedStore = useMemo(() => stores.find(s => s.id === storeId), [stores, storeId]);
    const currentCart = useMemo(() => cartItems[storeId] || [], [cartItems, storeId]);
    const cartItemCount = useMemo(() => currentCart.reduce((sum, item) => sum + item.quantity, 0), [currentCart]);

    const categories = useMemo(() => ['All Categories', ...Array.from(new Set(products.map(p => p.category)))], [products]);
    
    const filteredAndSortedProducts = useMemo(() => {
        let result = products;
        if (selectedCategory !== 'All Categories') result = result.filter(p => p.category === selectedCategory);
        if (searchTerm) result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        switch (sortOption) {
            case 'price-asc': return [...result].sort((a, b) => a.price - b.price);
            case 'price-desc': return [...result].sort((a, b) => b.price - a.price);
            case 'name-asc': return [...result].sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc': return [...result].sort((a, b) => b.name.localeCompare(a.name));
            default: return [...result].sort((a, b) => a.id - b.id);
        }
    }, [products, selectedCategory, searchTerm, sortOption]);
    
    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

    const handleSelectProduct = (id: number) => { setSelectedProductId(id); window.scrollTo(0, 0); };
    const handleBackToList = () => {
        setSelectedProductId(null);
        // This is a simple way to remove the query param from URL without a full page reload
        window.history.replaceState({}, '', window.location.pathname);
    };
    
    if (selectedProduct) {
        return <ProductDetailPage product={selectedProduct} onAddToCart={handleAddToCart} onBack={handleBackToList} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlistItems} />;
    }

    return (
        <>
            <ProductControls categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} searchTerm={searchTerm} onSearchChange={setSearchTerm} sortOption={sortOption} onSortChange={setSortOption} />
            {products.length === 0 ? <ProductListSkeleton /> : <ProductList products={filteredAndSortedProducts} onAddToCart={handleAddToCart} onProductClick={handleSelectProduct} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlistItems} cartItems={currentCart} />}
            {selectedStore && <Location store={selectedStore} />}
            
            <FloatingCartButton onClick={() => handleOpenCart(storeId)} itemCount={cartItemCount} />
        </>
    );
}

export default ShopPageClient;