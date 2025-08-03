import React from 'react';
import { Product, CartItem } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
  wishlistItems: number[];
  cartItems: CartItem[];
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, onProductClick, onToggleWishlist, wishlistItems, cartItems }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product, index) => {
            const cartItem = cartItems.find(item => item.id === product.id);
            return (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                <ProductCard 
                  product={product} 
                  onAddToCart={onAddToCart} 
                  onProductClick={onProductClick}
                  onToggleWishlist={onToggleWishlist}
                  wishlistItems={wishlistItems}
                  cartQuantity={cartItem?.quantity || 0}
                />
              </div>
            )
        })}
      </div>
    </div>
  );
};

export default ProductList;
