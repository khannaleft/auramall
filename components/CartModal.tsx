
"use client";

import React, { useState } from 'react';
import { CartItem, DiscountCode } from '../types';
import Icon from './Icon';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
  onApplyDiscount: (code: string) => { success: boolean; message: string };
  onRemoveDiscount: () => void;
  appliedDiscount: DiscountCode | null;
  cartTotals: { subtotal: number; discountAmount: number; taxes: number; total: number };
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onApplyDiscount,
  onRemoveDiscount,
  appliedDiscount,
  cartTotals
}) => {
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  if (!isOpen) return null;

  const handleApplyClick = () => {
    const result = onApplyDiscount(discountCodeInput);
    if (result.success) {
        setDiscountMessage({ type: 'success', text: result.message });
    } else {
        setDiscountMessage({ type: 'error', text: result.message });
    }
  };

  const handleRemoveDiscountClick = () => {
    onRemoveDiscount();
    setDiscountCodeInput('');
    setDiscountMessage(null);
  }

  const FREE_SHIPPING_THRESHOLD = 5000;
  const shippingProgress = Math.min((cartTotals.subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountLeftForFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotals.subtotal;


  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end" onClick={onClose}>
      <div
        className="bg-glass-bg backdrop-blur-xl border-l border-glass-border text-text-primary shadow-2xl w-full max-w-lg h-full flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-glass-border">
          <h2 className="text-2xl font-serif font-bold">Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          {cartItems.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center h-full justify-center animate-fade-in-up">
              <Icon name="cart" className="w-24 h-24 text-text-secondary/20 mb-6"/>
              <h3 className="text-2xl font-serif font-bold text-text-primary mb-2">Your cart is empty</h3>
              <p className="text-text-secondary max-w-xs mx-auto mb-6">Looks like you haven't added anything yet. Let's find something special.</p>
              <button
                onClick={onClose}
                className="bg-accent text-white font-bold py-3 px-6 rounded-lg hover:opacity-85 transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {cartItems.map((item, index) => (
                <li key={item.id} className="flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                  <div className="relative flex-shrink-0">
                    <img src={item.imageUrls[0]} alt={item.name} className="w-24 h-28 rounded-lg object-cover bg-primary" />
                    <button onClick={() => onRemoveItem(item.id)} className="absolute -top-2 -right-2 bg-secondary rounded-full p-1 text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all shadow-md">
                        <Icon name="close" className="w-4 h-4"/>
                     </button>
                  </div>
                  <div className="flex-grow flex flex-col h-28">
                    <h3 className="font-bold font-serif text-lg leading-tight">{item.name}</h3>
                    <p className="text-sm text-text-secondary">₹{item.price.toFixed(2)}</p>
                     {item.quantity >= item.stock && <p className="text-xs text-red-500 mt-1">Max stock reached</p>}
                    <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center gap-1 bg-primary p-1 rounded-full border border-glass-border">
                          <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1.5 rounded-full hover:bg-secondary"><Icon name="minus" className="w-4 h-4" /></button>
                          <span className="font-semibold w-6 text-center text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                            disabled={item.quantity >= item.stock}
                            className="p-1.5 rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                            <Icon name="plus" className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-glass-border bg-primary/60">
            <div className="mb-5">
                {amountLeftForFreeShipping > 0 ? (
                    <p className="text-center text-sm text-text-secondary mb-2">
                        You're <span className="font-bold text-accent">₹{amountLeftForFreeShipping.toFixed(2)}</span> away from free shipping!
                    </p>
                ) : (
                    <p className="text-center text-sm font-bold text-green-500 mb-2 flex items-center justify-center gap-2">
                        <Icon name="check-circle" className="w-5 h-5" /> You've got free shipping!
                    </p>
                )}
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-glass-border">
                    <div 
                        className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${shippingProgress}%` }}
                    ></div>
                </div>
            </div>
             <div className="mb-4">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={discountCodeInput}
                        onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                        placeholder="Discount code"
                        className="w-full p-3 rounded-lg bg-secondary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={!!appliedDiscount}
                    />
                    <button 
                        onClick={handleApplyClick}
                        disabled={!!appliedDiscount || !discountCodeInput}
                        className="bg-accent text-white font-bold py-2 px-5 rounded-lg hover:opacity-85 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Apply
                    </button>
                </div>
                 {discountMessage && <p className={`text-sm mt-2 ${discountMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{discountMessage.text}</p>}
             </div>
            <div className="space-y-2 text-text-secondary text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-text-primary">₹{cartTotals.subtotal.toFixed(2)}</span></div>
                {appliedDiscount && (
                    <div className="flex justify-between text-green-500">
                        <span className="flex items-center gap-2">Discount ({appliedDiscount.code}) <button onClick={handleRemoveDiscountClick} className="text-xs text-red-500 underline">(remove)</button></span>
                        <span className="font-medium">-₹{cartTotals.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between"><span>Taxes (8%)</span><span className="font-medium text-text-primary">₹{cartTotals.taxes.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg text-text-primary mt-2 border-t border-glass-border pt-3"><span>Total</span><span>₹{cartTotals.total.toFixed(2)}</span></div>
            </div>
            <button
              onClick={onCheckout}
              className="mt-6 w-full bg-accent text-white font-bold py-3.5 px-4 rounded-lg hover:opacity-85 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <Icon name="chevron-right" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
