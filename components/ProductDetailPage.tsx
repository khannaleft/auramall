

import React, { useState, useCallback } from 'react';
import { Product } from '../types';
import Icon from './Icon';

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onToggleWishlist: (productId: number) => void;
  wishlistItems: number[];
}

const Lightbox: React.FC<{ images: string[], startIndex: number, onClose: () => void }> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    
    const next = useCallback(() => setCurrentIndex(prev => (prev + 1) % images.length), [images.length]);
    const prev = useCallback(() => setCurrentIndex(prev => (prev - 1 + images.length) % images.length), [images.length]);

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-20"><Icon name="close" className="w-8 h-8"/></button>
            
            <div className="relative w-full h-full flex items-center justify-center p-4">
                {images.length > 1 && (
                     <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-10"><Icon name="chevron-left" className="w-6 h-6" /></button>
                )}
                
                <img src={images[currentIndex]} alt="Enlarged product view" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />

                 {images.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-10"><Icon name="chevron-right" className="w-6 h-6" /></button>
                 )}
            </div>
        </div>
    )
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onAddToCart, onBack, onToggleWishlist, wishlistItems }) => {
  const isInWishlist = wishlistItems.includes(product.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="container mx-auto px-4 pt-32 md:pt-40 pb-16">
        <div className="mb-8 animate-fade-in-up">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-300 font-semibold"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Back to Collection
            </button>
        </div>
      <div className="bg-secondary/50 border border-glass-border rounded-2xl shadow-lg p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          <div className="flex flex-col-reverse sm:flex-row gap-4">
              <div className="flex sm:flex-col gap-3 justify-center sm:justify-start">
                  {product.imageUrls.map((url, index) => (
                      <div 
                        key={index} 
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${activeImageIndex === index ? 'border-accent' : 'border-transparent hover:border-accent/50'}`}
                      >
                           <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                  ))}
              </div>
              <div 
                className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md cursor-zoom-in group bg-primary"
                onClick={() => setIsLightboxOpen(true)}
              >
                  <img
                    src={product.imageUrls[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icon name="search" className="w-12 h-12 text-white" />
                  </div>
              </div>
          </div>


          <div className="flex flex-col py-4">
            <div className="flex items-center gap-4 mb-2">
                <p className="text-sm text-accent font-bold uppercase tracking-wider">{product.category}</p>
                {isOutOfStock && <span className="text-sm font-bold bg-red-500 text-white py-1 px-3 rounded-full">Out of Stock</span>}
                {isLowStock && <span className="text-sm font-bold bg-yellow-500 text-black py-1 px-3 rounded-full">Low Stock</span>}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary mb-4">{product.name}</h1>
            <p className="text-text-secondary text-base leading-relaxed mb-8">{product.description}</p>
            
            <div className="mt-auto space-y-6">
                 <span className="text-4xl font-bold font-sans text-text-primary">₹{product.price.toFixed(2)}</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className="bg-accent text-white font-bold py-3.5 px-8 rounded-lg hover:opacity-85 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                        onClick={() => onToggleWishlist(product.id)}
                        className={`p-3.5 rounded-lg border border-glass-border hover:bg-primary/50 transition-colors flex items-center justify-center gap-2 ${isInWishlist ? 'text-accent' : 'text-text-secondary'}`}
                        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Icon name="heart" className={`w-6 h-6 ${isInWishlist ? 'fill-accent' : 'fill-none'}`} />
                        <span className="font-semibold text-sm">{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
      {isLightboxOpen && <Lightbox images={product.imageUrls} startIndex={activeImageIndex} onClose={() => setIsLightboxOpen(false)} />}
    </div>
  );
};

export default ProductDetailPage;
