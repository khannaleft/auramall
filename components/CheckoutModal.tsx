

"use client";

import React, { useState, useEffect } from 'react';
import { User, CartItem } from '../types';
import Icon from './Icon';
import { initiatePayUPayment } from '@/services/payuService';
import { useAppContext } from '@/hooks/useAppContext';


interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (details: { phone: string }, status: 'Pending Payment' | 'Processing') => Promise<string | undefined>;
  currentUser: User | null;
  onLoginRequest: () => void;
  cartTotals: { subtotal: number; discountAmount: number; taxes: number; total: number };
  cartItems: CartItem[];
}

// A new sub-component for the payment step
const PayUConfirmation: React.FC<{ onPay: () => void; isLoading: boolean, total: number }> = ({ onPay, isLoading, total }) => {
    return (
        <div className="p-6 text-center">
            <div className="bg-primary/60 p-6 rounded-2xl border border-glass-border">
                <p className="text-text-secondary">You are about to pay</p>
                <p className="text-5xl font-bold font-serif my-4 text-text-primary">₹{total.toFixed(2)}</p>
                <p className="text-xs text-text-secondary mt-4">You will be redirected to our secure payment partner to complete the purchase.</p>
            </div>
             <button
                onClick={onPay}
                disabled={isLoading}
                className="mt-6 w-full bg-orange-500 text-white font-bold py-3.5 px-4 rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:bg-orange-300 disabled:cursor-wait flex items-center justify-center gap-3"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Preparing Secure Payment...
                    </>
                ) : `Pay Securely with PayU`}
            </button>
            <p className="text-center text-xs text-text-secondary mt-4">Powered by <span className="font-bold text-orange-500">PayU</span></p>
        </div>
    );
};


const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onPlaceOrder, currentUser, onLoginRequest, cartTotals, cartItems }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success' | 'failure'>('details');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const { addToast } = useAppContext();
  
  // Reset state when modal is opened or closed
  useEffect(() => {
    // Check for payment status from URL query params
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && params.get('order_id')) {
        setStep('success');
        // Clear query params
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('payment') === 'failure') {
        setStep('failure');
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isOpen) {
        setStep('details');
        setPhone(currentUser?.phone || '');
        setPhoneError(null);
    } else {
         const timer = setTimeout(() => {
          setStep('details');
          setPhone('');
          setPhoneError(null);
        }, 300); // Reset after closing animation
        return () => clearTimeout(timer);
    }
  }, [isOpen, currentUser]);

  const handleClose = () => {
    onClose();
  };
  
  const handleProceedToPayment = () => {
    setPhoneError(null);
    if (!currentUser) {
      onLoginRequest();
      return;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) {
        setPhoneError('Please enter a valid 10-digit phone number.');
        return;
    }
    setStep('payment');
  };

  const handleFinalizePayment = async () => {
    if (!currentUser) return;
    setStep('processing');
    
    try {
        // Step 1: Create the order in Firestore with "Pending Payment" status.
        // This is crucial. We get back the orderId (txnid).
        const orderId = await onPlaceOrder({ phone }, 'Pending Payment');

        if (!orderId) {
            throw new Error("Could not create order record.");
        }

        // Step 2: Initiate the payment, which now just redirects.
        // It will use the orderId as the txnid.
        await initiatePayUPayment({
            user: currentUser,
            cartItems: cartItems,
            phone: phone,
            total: cartTotals.total,
            txnid: orderId,
        });

        // The user is now redirected to PayU. The code below this line won't execute.
        // The success/failure is handled by PayU redirecting back to our `surl` or `furl`.

    } catch (error: any) {
        setStep('failure');
        addToast(error.message || 'Payment failed. Please try again.', 'error');
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch(step) {
      case 'success':
        return (
          <div className="p-10 text-center">
            <Icon name="check-circle" className="w-16 h-16 mx-auto text-green-500"/>
            <h3 className="text-2xl font-bold mt-4">Order Placed Successfully!</h3>
            <p className="text-text-secondary mt-2">Your payment was successful. You will receive a confirmation email shortly.</p>
          </div>
        );
      case 'failure':
          return (
              <div className="p-10 text-center">
                  <Icon name="x-circle" className="w-16 h-16 mx-auto text-red-500"/>
                  <h3 className="text-2xl font-bold mt-4">Payment Failed</h3>
                  <p className="text-text-secondary mt-2">Something went wrong with your payment. Please check your details and try again.</p>
                  <button
                      onClick={() => setStep('payment')}
                      className="mt-6 bg-accent text-white font-bold py-3 px-6 rounded-lg hover:opacity-85"
                  >
                      Try Again
                  </button>
              </div>
          );
      case 'payment':
      case 'processing':
          return <PayUConfirmation onPay={handleFinalizePayment} isLoading={step === 'processing'} total={cartTotals.total} />;
      case 'details':
      default:
        return (
          <>
            <div className="overflow-y-auto p-6 flex-grow">
              <h3 className="font-bold text-lg mb-4">Contact & Shipping</h3>
              <form className="space-y-4">
                <input type="email" placeholder="Email Address" className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" value={currentUser?.email || ''} disabled/>
                <input type="text" placeholder="Full Name" className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" value={currentUser?.name || ''} disabled/>
                <div>
                  <input
                    type="tel"
                    placeholder="10-digit Phone Number"
                    className={`w-full p-3 rounded-lg bg-primary/60 border ${phoneError ? 'border-red-500' : 'border-glass-border'} focus:outline-none focus:ring-2 ${phoneError ? 'ring-red-500' : 'focus:ring-accent'}`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    required
                  />
                  {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
                <input type="text" placeholder="Address" className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" />
                 <div className="flex gap-4">
                    <input type="text" placeholder="City" className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" />
                    <input type="text" placeholder="ZIP Code" className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </form>

              <h3 className="font-bold text-lg mb-4 mt-8">Order Summary</h3>
              <div className="space-y-2 text-text-secondary">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotals.subtotal.toFixed(2)}</span></div>
                {cartTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-green-500">
                        <span>Discount</span>
                        <span>-₹{cartTotals.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between"><span>Taxes</span><span>₹{cartTotals.taxes.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg text-text-primary mt-2 border-t border-glass-border pt-2"><span>Total</span><span>₹{cartTotals.total.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="p-6 border-t border-glass-border">
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300"
              >
                Proceed to Payment
              </button>
            </div>
          </>
        );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center transition-opacity duration-300 p-4" onClick={handleClose}>
      <div
        className="bg-glass-bg backdrop-blur-xl border border-glass-border text-text-primary rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-glass-border">
          <h2 className="text-2xl font-serif font-bold">
            {step === 'success' ? 'Thank You!' : (step === 'failure' ? 'Payment Issue' : (step === 'payment' || step === 'processing' ? 'Complete Payment' : 'Checkout'))}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CheckoutModal;