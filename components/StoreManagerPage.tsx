

import React, { useState } from 'react';
import { Product, Order, Store, Toast } from '../types';
import Icon from './Icon';

interface StoreManagerPageProps {
  onBack: () => void;
  store: Store;
  storeProducts: Product[];
  storeOrders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateProductStock: (productId: number, newStock: number) => void;
  onUpdateStore: (storeId: number, updatedData: Partial<Store>) => void;
  addToast: (message: string, type?: Toast['type']) => void;
}

type ManagerTab = 'inventory' | 'orders' | 'details';

const StoreManagerPage: React.FC<StoreManagerPageProps> = (props) => {
  const [activeTab, setActiveTab] = useState<ManagerTab>('inventory');
  
  const tabs: { id: ManagerTab; name: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
    { id: 'inventory', name: 'Inventory', icon: 'package' },
    { id: 'orders', name: 'Orders', icon: 'clipboard-list' },
    { id: 'details', name: 'Store Details', icon: 'map' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 pt-32 md:pt-40 animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary flex items-center gap-3">
                <Icon name="store" className="w-10 h-10 text-accent"/>
                Store Management
            </h1>
            <p className="text-text-secondary ml-14 -mt-1">{props.store.name}</p>
        </div>
        <button
          onClick={props.onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-300 self-start md:self-center font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Shop
        </button>
      </div>
      
      <div className="bg-secondary/50 border border-glass-border rounded-2xl shadow-lg p-2 md:p-4">
        <div className="flex items-center border-b border-glass-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 md:px-6 font-semibold transition-colors flex-shrink-0 ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <Icon name={tab.icon} className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 md:p-6 min-h-[400px]">
          {activeTab === 'inventory' && <InventoryManagement {...props} />}
          {activeTab === 'orders' && <OrderManagement {...props} />}
          {activeTab === 'details' && <StoreDetailsManagement {...props} addToast={props.addToast} />}
        </div>
      </div>
    </div>
  );
};

const InventoryManagement = ({ storeProducts, onUpdateProductStock }: { storeProducts: Product[], onUpdateProductStock: (productId: number, newStock: number) => void }) => {
    
    const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
        const [currentStock, setCurrentStock] = useState(product.stock);
        const [inputVal, setInputVal] = useState(product.stock.toString());

        const handleUpdate = () => {
            const newStock = parseInt(inputVal, 10);
            if (!isNaN(newStock) && newStock >= 0) {
                onUpdateProductStock(product.id, newStock);
                setCurrentStock(newStock);
            } else {
                setInputVal(currentStock.toString()); // Reset if invalid
            }
        };

        return (
             <tr className="border-b border-glass-border last:border-none hover:bg-primary">
              <td className="p-4 font-semibold">{product.name}</td>
              <td className="p-4 text-text-secondary hidden md:table-cell">{product.category}</td>
              <td className="p-4 font-mono font-semibold text-lg text-center">{currentStock}</td>
              <td className="p-4">
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="flex items-center gap-2">
                    <input 
                        type="number"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        className="w-24 p-2 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button type="submit" className="p-2 bg-accent text-white rounded-lg hover:opacity-80">
                        <Icon name="check" className="w-5 h-5" />
                    </button>
                </form>
              </td>
            </tr>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Inventory ({storeProducts.length})</h2>
            <div className="overflow-x-auto bg-secondary p-4 rounded-lg border border-glass-border">
            <table className="w-full text-left text-sm">
                <thead>
                <tr className="border-b border-glass-border">
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold hidden md:table-cell">Category</th>
                    <th className="p-4 font-semibold text-center">Current Stock</th>
                    <th className="p-4 font-semibold">Update Stock</th>
                </tr>
                </thead>
                <tbody>
                    {storeProducts.map(p => <ProductRow key={p.id} product={p} />)}
                </tbody>
            </table>
            </div>
        </div>
    );
}

const OrderManagement = ({ storeOrders, onUpdateOrderStatus }: { storeOrders: Order[], onUpdateOrderStatus: (orderId: string, status: Order['status']) => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Manage Orders ({storeOrders.length})</h2>
    <div className="space-y-4">
      {storeOrders.length > 0 ? storeOrders.map(order => (
        <div key={order.id} className="bg-primary p-4 rounded-lg border border-glass-border">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <p className="font-bold text-sm text-accent">#{order.id}</p>
              <p className="text-sm font-semibold">{order.userEmail}</p>
              <p className="text-sm text-text-secondary">{new Date(order.date).toISOString().replace('T', ' ').substring(0, 16)}</p>
            </div>
            <div className="flex items-center gap-4 self-end md:self-center">
              <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
              <select 
                value={order.status}
                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                className="p-2 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )) : (
        <p className="text-text-secondary text-center py-8">No orders found for this store yet.</p>
      )}
    </div>
  </div>
);

const StoreDetailsManagement = ({ store, onUpdateStore, addToast }: { store: Store, onUpdateStore: (storeId: number, updatedData: Partial<Store>) => void, addToast: (message: string, type?: Toast['type']) => void }) => {
    const [latitude, setLatitude] = useState(store.latitude.toString());
    const [longitude, setLongitude] = useState(store.longitude.toString());

    const handleUpdateDetails = () => {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            addToast('Please enter valid coordinates.', 'error');
            return;
        }
        onUpdateStore(store.id, { latitude: lat, longitude: lon });
    };

    const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Store Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateDetails(); }} className="space-y-4 bg-primary p-6 rounded-lg border border-glass-border">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Latitude</label>
                        <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)} className="w-full p-3 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Longitude</label>
                        <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} className="w-full p-3 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:opacity-85 transition-all duration-300">
                        <Icon name="check-circle" className="w-5 h-5"/>
                        Update Location
                    </button>
                </form>
                <div className="w-full h-80 md:h-full rounded-xl overflow-hidden shadow-md border border-glass-border">
                    <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${store.name} Location Preview`}
                        key={mapUrl}
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default StoreManagerPage;