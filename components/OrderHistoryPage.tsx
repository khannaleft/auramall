
import React from 'react';
import { Order } from '../types';
import Icon from './Icon';

interface OrderHistoryPageProps {
  orders: Order[];
  onBack: () => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ orders, onBack }) => {
  return (
    <div className="container mx-auto px-4 py-12 pt-32 md:pt-40 animate-fade-in-up">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary">Order History</h1>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Back to Shop
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-secondary/50 border border-glass-border rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-glass-border">
                <div>
                  <p className="text-sm text-text-secondary">Order ID</p>
                  <h2 className="text-lg font-bold text-text-primary">#{order.id}</h2>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Date</p>
                  <p className="font-semibold text-text-primary">{new Date(order.date).toISOString().split('T')[0]}</p>
                </div>
                 <div>
                  <p className="text-sm text-text-secondary">Contact Phone</p>
                  <p className="font-semibold text-text-primary">{order.phone}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm text-text-secondary">Status</p>
                  <p className="font-semibold text-accent">{order.status}</p>
                </div>
              </div>
              
              <ul className="space-y-4 mb-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4">
                    <img src={item.imageUrls[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-grow">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-text-secondary">
                        {item.quantity} x ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>

               <div className="border-t border-glass-border pt-4 text-sm text-text-secondary space-y-1">
                  <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-text-primary font-medium">₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Discount</span>
                      <span className="text-green-500 font-medium">-₹{order.discount.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between">
                      <span>Taxes</span>
                      <span className="text-text-primary font-medium">₹{order.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-text-primary mt-2 border-t border-glass-border pt-2">
                      <span>Total</span>
                      <span>₹{order.total.toFixed(2)}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/50 border border-glass-border rounded-2xl">
          <Icon name="cart" className="w-16 h-16 mx-auto text-text-secondary" />
          <h2 className="mt-6 text-2xl font-bold text-text-primary">No Orders Found</h2>
          <p className="mt-2 text-text-secondary">
            You haven't placed any orders yet.
          </p>
          <button
            onClick={onBack}
            className="mt-8 bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
