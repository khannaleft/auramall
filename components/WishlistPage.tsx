
import React from 'react';
import { Product, CartItem } from '../types';
import ProductList from './ProductList';
import Icon from './Icon';

interface WishlistPageProps {
  wishlistedProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
  wishlistItems: number[];
  cartItems: CartItem[];
}

const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistedProducts,
  onBack,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  wishlistItems,
  cartItems
}) => {
  return (
    <div className="container mx-auto px-4 py-12 pt-32 md:pt-40 animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary">Your Wishlist</h1>
            <p className="text-text-secondary mt-1">Your curated collection of treasures. Ready to make them yours?</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-300 font-semibold self-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Collection
        </button>
      </div>

      {wishlistedProducts.length > 0 ? (
        <ProductList
          products={wishlistedProducts}
          onAddToCart={onAddToCart}
          onProductClick={onProductClick}
          onToggleWishlist={onToggleWishlist}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
        />
      ) : (
        <div className="text-center py-20 bg-secondary/50 border border-glass-border rounded-3xl flex flex-col items-center relative overflow-hidden animate-fade-in-up">
            <div className="absolute -bottom-1/4 -right-1/4 text-accent/10 fill-current opacity-50 pointer-events-none">
                <Icon name="heart" className="w-96 h-96"/>
            </div>
            <div className="relative z-10">
                <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="heart" className="w-12 h-12 mx-auto text-accent fill-accent/20" />
                </div>
                <h2 className="mt-6 text-3xl font-bold font-serif text-text-primary">Your Wishlist Awaits</h2>
                <p className="mt-3 text-text-secondary max-w-md mx-auto">
                    See something you love? Tap the heart icon on any product to save it here and never lose track of your favorites.
                </p>
                <button
                    onClick={onBack}
                    className="mt-8 bg-accent text-white font-bold py-3 px-8 rounded-lg hover:opacity-85 transition-all duration-300 transform hover:scale-105"
                >
                    Discover Products
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
