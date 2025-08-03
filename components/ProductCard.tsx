
'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import Icon from './Icon';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
  wishlistItems: number[];
  cartQuantity: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductClick, onToggleWishlist, wishlistItems, cartQuantity }) => {
  const isInWishlist = wishlistItems.includes(product.id);
  const isOutOfStock = product.stock === 0;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || product.imageUrls.length <= 1) {
      return;
    }
    const timer = setTimeout(() => {
      setCurrentImageIndex(prev => (prev + 1) % product.imageUrls.length);
    }, 3000); // Change image every 3 seconds
    return () => clearTimeout(timer);
  }, [currentImageIndex, isHovered, product.imageUrls.length]);

  const handleWishlistClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleWishlist(product.id);
  }

   const handleAddToCartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOutOfStock) onAddToCart(product);
  }

  return (
    <div 
        className="bg-secondary rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-transparent hover:border-glass-border" 
        onClick={() => onProductClick(product.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        <div className="relative overflow-hidden cursor-pointer">
            <div className="w-full aspect-[4/5] bg-primary rounded-t-3xl">
              {product.imageUrls.map((url, index) => (
                <Image
                  key={url}
                  src={url}
                  alt={`${product.name} image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                  width={400}
                  height={500}
                  priority={index === 0}
                />
              ))}
            </div>
            {isOutOfStock && <span className="absolute top-4 left-4 text-xs font-bold bg-red-500/80 backdrop-blur-sm text-white py-1 px-3 rounded-full z-10">Out of Stock</span>}
            
            <button
                onClick={handleWishlistClick}
                className={`absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/20 backdrop-blur-sm transition-all duration-300 ${isInWishlist ? 'text-accent' : 'text-white'}`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Icon name="heart" className={`w-5 h-5 transition-colors ${isInWishlist ? 'fill-accent' : 'fill-none'}`} />
            </button>

            {product.imageUrls.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-2 z-10">
                    {product.imageUrls.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white'}`}
                            aria-label={`View image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
      
        <div className="p-5 flex flex-col flex-grow">
            <p className="text-xs text-text-secondary mb-1">{product.category}</p>
            <h3 className="text-lg font-serif font-bold text-text-primary mb-2 transition-colors duration-300 group-hover:text-accent flex-grow">{product.name}</h3>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xl font-bold font-sans text-text-primary">₹{product.price.toFixed(2)}</span>
              <button
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                className="bg-accent text-white font-bold py-2.5 px-5 rounded-lg hover:opacity-85 transition-all duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                aria-label={`Add ${product.name} to cart`}
              >
                {isOutOfStock ? "Unavailable" : cartQuantity > 0 ? "Add More" : "Add to Cart"}
              </button>
            </div>
        </div>
    </div>
  );
};

export default ProductCard;
