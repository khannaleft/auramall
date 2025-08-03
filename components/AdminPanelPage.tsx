


import React, { useState, useMemo } from 'react';
import { Product, Order, DiscountCode, Store, Toast, User } from '../types';
import Icon from './Icon';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ManageUserModal from './ManageUserModal';
import AddStoreModal from './AddStoreModal';
import EditStoreModal from './EditStoreModal';

interface AdminPanelPageProps {
  onBack: () => void;
  allProducts: Product[];
  allOrders: Order[];
  allDiscountCodes: DiscountCode[];
  stores: Store[];
  allUsers: User[];
  addToast: (message: string, type?: Toast['type']) => void;
  // Actions
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (productId: number, data: Partial<Product>) => void;
  onDeleteProduct: (productId: number) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAddDiscountCode: (code: DiscountCode) => void;
  onDeleteDiscountCode: (code: string) => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onAddStore: (store: Omit<Store, 'id'>) => void;
  onUpdateStore: (storeId: number, data: Partial<Store>) => void;
  onDeleteStore: (storeId: number) => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'discounts' | 'users' | 'stores';

const AdminPanelPage: React.FC<AdminPanelPageProps> = (props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [userToManage, setUserToManage] = useState<User | null>(null);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);
  
  const tabs: { id: AdminTab; name: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'view-grid' },
    { id: 'products', name: 'Products', icon: 'package' },
    { id: 'orders', name: 'Orders', icon: 'clipboard-list' },
    { id: 'users', name: 'Users', icon: 'users' },
    { id: 'discounts', name: 'Discounts', icon: 'tag' },
    { id: 'stores', name: 'Stores', icon: 'store' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView {...props} />;
      case 'products':
        return <ProductManagement {...props} onAddProductClick={() => setIsAddProductModalOpen(true)} onEditProductClick={setProductToEdit} />;
      case 'orders':
        return <OrderManagement {...props} />;
      case 'users':
        return <UserManagement {...props} onManageUserClick={setUserToManage} />;
      case 'discounts':
        return <DiscountManagement {...props} addToast={props.addToast} />;
      case 'stores':
          return <StoreManagement {...props} onAddStoreClick={() => setIsAddStoreModalOpen(true)} onEditStoreClick={setStoreToEdit} />;
      default:
        return null;
    }
  }

  return (
    <>
    <div className="container mx-auto px-4 py-12 pt-32 md:pt-40 animate-fade-in-up">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary flex items-center gap-3">
            <Icon name="shield-check" className="w-10 h-10 text-accent"/>
            Admin Panel
        </h1>
        <button
          onClick={props.onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-300"
        >
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
        
        <div className="p-4 md:p-6 min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </div>
    <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onAddProduct={props.onAddProduct} stores={props.stores} addToast={props.addToast} />
    {productToEdit && <EditProductModal isOpen={!!productToEdit} onClose={() => setProductToEdit(null)} onUpdateProduct={props.onUpdateProduct} product={productToEdit} stores={props.stores} addToast={props.addToast} />}
    {userToManage && <ManageUserModal isOpen={!!userToManage} onClose={() => setUserToManage(null)} onUpdateUser={props.onUpdateUser} user={userToManage} stores={props.stores} />}
    <AddStoreModal isOpen={isAddStoreModalOpen} onClose={() => setIsAddStoreModalOpen(false)} onAddStore={props.onAddStore} addToast={props.addToast} />
    {storeToEdit && <EditStoreModal isOpen={!!storeToEdit} onClose={() => setStoreToEdit(null)} onUpdateStore={props.onUpdateStore} store={storeToEdit} addToast={props.addToast} />}
    </>
  );
};


const DashboardView: React.FC<Omit<AdminPanelPageProps, 'onBack'>> = ({ allOrders, allProducts, allUsers }) => {
    const stats = useMemo(() => {
        const validOrders = allOrders.filter(o => o.status !== 'Cancelled');
        const totalRevenue = validOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = validOrders.length;
        const totalCustomers = allUsers.filter(u => u.role === 'customer').length;

        const productSales = new Map<number, number>();
        validOrders.forEach(order => {
            order.items.forEach(item => {
                productSales.set(item.id, (productSales.get(item.id) || 0) + item.quantity);
            });
        });

        const topProducts = [...productSales.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([productId, quantity]) => ({
                product: allProducts.find(p => p.id === productId),
                quantity
            }));
        
        const recentOrders = [...allOrders].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        return { totalRevenue, totalOrders, totalCustomers, totalProducts: allProducts.length, topProducts, recentOrders };
    }, [allOrders, allProducts, allUsers]);

    const StatCard: React.FC<{icon: any, title: string, value: string | number, color: string}> = ({icon, title, value, color}) => (
        <div className="bg-primary p-6 rounded-2xl flex items-center gap-6 border border-glass-border">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
                <Icon name={icon} className="w-8 h-8 text-white"/>
            </div>
            <div>
                <p className="text-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="currency-dollar" title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} color="bg-green-500" />
                <StatCard icon="clipboard-list" title="Total Orders" value={stats.totalOrders} color="bg-blue-500" />
                <StatCard icon="package" title="Total Products" value={stats.totalProducts} color="bg-yellow-500" />
                <StatCard icon="users" title="Total Customers" value={stats.totalCustomers} color="bg-purple-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-primary p-6 rounded-2xl border border-glass-border">
                    <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                        {stats.recentOrders.map(order => (
                            <div key={order.id} className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-secondary/50">
                                <div>
                                    <p className="font-semibold">{order.id}</p>
                                    <p className="text-text-secondary">{order.userEmail}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{order.total.toFixed(2)}</p>
                                    <p className="text-text-secondary">{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-primary p-6 rounded-2xl border border-glass-border">
                    <h3 className="text-xl font-bold mb-4">Top Selling Products</h3>
                    <div className="space-y-3">
                         {stats.topProducts.map(({product, quantity}) => product ? (
                            <div key={product.id} className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-secondary/50">
                                <p className="font-semibold">{product.name}</p>
                                <p className="font-bold">{quantity} sold</p>
                            </div>
                        ) : null)}
                    </div>
                </div>
            </div>
        </div>
    )
}


const ProductManagement = ({ allProducts, onAddProductClick, onEditProductClick, onDeleteProduct }: { allProducts: Product[], onAddProductClick: () => void, onEditProductClick: (p: Product) => void, onDeleteProduct: (id: number) => void }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Products ({allProducts.length})</h2>
        <button onClick={onAddProductClick} className="flex items-center gap-2 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300">
            <Icon name="plus-circle" className="w-5 h-5" />
            Add Product
        </button>
    </div>
    <div className="overflow-x-auto bg-primary p-4 rounded-lg border border-glass-border">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-text-secondary uppercase">
          <tr className="border-b border-glass-border">
            <th className="p-3">Product</th>
            <th className="p-3 hidden md:table-cell">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Stock</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allProducts.map(p => (
            <tr key={p.id} className="border-b border-glass-border last:border-none hover:bg-secondary/30">
              <td className="p-3 font-semibold flex items-center gap-3">
                  <img src={p.imageUrls[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover"/>
                  {p.name}
              </td>
              <td className="p-3 text-text-secondary hidden md:table-cell">{p.category}</td>
              <td className="p-3">₹{p.price.toFixed(2)}</td>
              <td className={`p-3 font-bold ${p.stock < 10 ? 'text-red-500' : ''}`}>{p.stock}</td>
              <td className="p-3 text-right">
                <button onClick={() => onEditProductClick(p)} className="p-2 text-text-secondary hover:text-accent"><Icon name="pencil" className="w-4 h-4" /></button>
                <button onClick={() => { if(confirm(`Are you sure you want to delete ${p.name}?`)) onDeleteProduct(p.id) }} className="p-2 text-text-secondary hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OrderManagement = ({ allOrders, onUpdateOrderStatus, allProducts }: { allOrders: Order[], onUpdateOrderStatus: (orderId: string, status: Order['status']) => void, allProducts: Product[] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const filteredOrders = useMemo(() => {
        return allOrders
            .filter(order => statusFilter === 'All' || order.status === statusFilter)
            .filter(order => !searchTerm || order.id.includes(searchTerm) || order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allOrders, searchTerm, statusFilter]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Orders ({filteredOrders.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-primary p-4 rounded-xl border border-glass-border">
                <input 
                    type="text" 
                    placeholder="Search Order ID or Email..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full p-3 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    <option>All</option>
                    <option>Pending Payment</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                </select>
            </div>
            <div className="space-y-4">
            {filteredOrders.map(order => (
                <div key={order.id} className="bg-primary p-4 rounded-lg border border-glass-border">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                    <div>
                    <p className="font-bold text-sm text-accent">#{order.id}</p>
                    <p className="font-semibold text-sm">{order.userEmail}</p>
                    <p className="text-xs text-text-secondary">{new Date(order.date).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                    <p className="font-bold text-lg hidden sm:block">₹{order.total.toFixed(2)}</p>
                    <select 
                        value={order.status}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="p-2 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    >
                        <option>Pending Payment</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option>
                    </select>
                    <Icon name="chevron-right" className={`w-5 h-5 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                    </div>
                </div>
                {expandedOrderId === order.id && (
                    <div className="mt-4 pt-4 border-t border-glass-border space-y-2 animate-fade-in-up">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 text-sm">
                                <img src={item.imageUrls[0]} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-secondary" />
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-text-secondary">₹{item.price.toFixed(2)} x {item.quantity}</p>
                                </div>
                                <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            ))}
            </div>
        </div>
    );
};

const UserManagement = ({ allUsers, stores, onManageUserClick }: { allUsers: User[], stores: Store[], onManageUserClick: (u: User) => void }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Users ({allUsers.length})</h2>
            <div className="overflow-x-auto bg-primary p-4 rounded-lg border border-glass-border">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-text-secondary uppercase">
                        <tr className="border-b border-glass-border">
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Store</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map(user => (
                            <tr key={user.uid} className="border-b border-glass-border last:border-none hover:bg-secondary/30">
                                <td className="p-3 font-semibold">{user.name}</td>
                                <td className="p-3 text-text-secondary">{user.email}</td>
                                <td className="p-3 font-semibold capitalize text-accent">{user.role.replace('_', ' ')}</td>
                                <td className="p-3 text-text-secondary">{user.storeId ? stores.find(s => s.id === user.storeId)?.name : 'N/A'}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => onManageUserClick(user)} className="p-2 text-text-secondary hover:text-accent"><Icon name="pencil" className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const DiscountManagement = ({ allDiscountCodes, onAddDiscountCode, onDeleteDiscountCode, addToast }: { allDiscountCodes: DiscountCode[], onAddDiscountCode: (code: DiscountCode) => void, onDeleteDiscountCode: (code: string) => void, addToast: (message: string, type?: Toast['type']) => void }) => {
    const [newCode, setNewCode] = useState('');
    const [newCodeType, setNewCodeType] = useState<'percentage' | 'fixed'>('percentage');
    const [newCodeValue, setNewCodeValue] = useState(0);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode || newCodeValue <= 0) {
            addToast("Please fill out all fields for the discount code.", 'error');
            return;
        }
        onAddDiscountCode({ code: newCode.toUpperCase(), type: newCodeType, value: newCodeValue });
        setNewCode('');
        setNewCodeValue(0);
    }
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Discount Codes</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-primary p-4 rounded-lg border border-glass-border">
                <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Code Name (e.g. AURA15)" className="p-3 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" />
                <select value={newCodeType} onChange={e => setNewCodeType(e.target.value as any)} className="p-3 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                </select>
                <input type="number" value={newCodeValue} onChange={e => setNewCodeValue(parseFloat(e.target.value))} placeholder="Value" className="p-3 rounded-lg bg-secondary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" />
                <button type="submit" className="bg-accent text-white font-bold rounded-lg hover:bg-opacity-80 transition-colors">Add Code</button>
            </form>
            <div className="space-y-2">
                {allDiscountCodes.map(code => (
                    <div key={code.code} className="bg-primary p-3 rounded-lg flex justify-between items-center border border-glass-border">
                        <div>
                            <p className="font-bold text-accent">{code.code}</p>
                            <p className="text-sm text-text-secondary">{code.type === 'percentage' ? `${code.value}% off` : `₹${code.value} off`}</p>
                        </div>
                        <button onClick={() => onDeleteDiscountCode(code.code)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                            <Icon name="trash" className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const StoreManagement = ({ stores, onAddStoreClick, onEditStoreClick, onDeleteStore }: { stores: Store[], onAddStoreClick: () => void, onEditStoreClick: (s: Store) => void, onDeleteStore: (id: number) => void }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Stores ({stores.length})</h2>
        <button onClick={onAddStoreClick} className="flex items-center gap-2 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300">
            <Icon name="plus-circle" className="w-5 h-5" />
            Add Store
        </button>
    </div>
    <div className="overflow-x-auto bg-primary p-4 rounded-lg border border-glass-border">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-text-secondary uppercase">
          <tr className="border-b border-glass-border">
            <th className="p-3">Name</th>
            <th className="p-3 hidden md:table-cell">Location</th>
            <th className="p-3">Coordinates</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map(s => (
            <tr key={s.id} className="border-b border-glass-border last:border-none hover:bg-secondary/30">
              <td className="p-3 font-semibold">{s.name}</td>
              <td className="p-3 text-text-secondary hidden md:table-cell">{s.location}</td>
              <td className="p-3 font-mono text-xs">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</td>
              <td className="p-3 text-right">
                <button onClick={() => onEditStoreClick(s)} className="p-2 text-text-secondary hover:text-accent"><Icon name="pencil" className="w-4 h-4" /></button>
                <button onClick={() => { if(confirm(`Are you sure you want to delete ${s.name}? This is irreversible.`)) onDeleteStore(s.id) }} className="p-2 text-text-secondary hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


export default AdminPanelPage;
