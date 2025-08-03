
import React, { useState, useEffect } from 'react';
import { User, Store } from '../types';
import Icon from './Icon';

interface ManageUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  user: User;
  stores: Store[];
}

const ManageUserModal: React.FC<ManageUserModalProps> = ({ isOpen, onClose, onUpdateUser, user, stores }) => {
  const [role, setRole] = useState<User['role']>('customer');
  const [storeId, setStoreId] = useState<number | '' | undefined>('');

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setStoreId(user.storeId || '');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: Partial<User> = { role };
    if (role === 'store_owner' && storeId) {
      updatedData.storeId = Number(storeId);
    } else {
      updatedData.storeId = undefined; // Or use deleteField() for Firestore
    }
    onUpdateUser(user.uid, updatedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-secondary text-text-primary rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col transform transition-transform duration-300 scale-95 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-glass-border">
          <div>
            <h2 className="text-xl font-serif font-bold">Manage User</h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">User Role</label>
                <select value={role} onChange={e => setRole(e.target.value as User['role'])} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required>
                    <option value="customer">Customer</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            
            {role === 'store_owner' && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Assign to Store</label>
                    <select value={storeId} onChange={e => setStoreId(Number(e.target.value))} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required>
                        <option value="">Select a store...</option>
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="bg-primary text-text-primary font-bold py-2 px-6 rounded-lg border border-glass-border hover:bg-black/10 dark:hover:bg-white/10">Cancel</button>
                <button type="submit" className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80">Save Changes</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ManageUserModal;
