'use client';
import React, { useMemo } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import StoreManagerPage from '@/components/StoreManagerPage';
import { useRouter } from 'next/navigation';

export default function Manager() {
    const context = useAppContext();
    const router = useRouter();

    const { currentUser, products, orders, stores } = context;

    const { store, storeProducts, storeOrders } = useMemo(() => {
        if (currentUser?.role !== 'store_owner' || !currentUser.storeId) {
            return { store: null, storeProducts: [], storeOrders: [] };
        }
        const managerStore = stores.find(s => s.id === currentUser.storeId);
        if (!managerStore) {
            return { store: null, storeProducts: [], storeOrders: [] };
        }
        const filteredProducts = products.filter(p => p.storeId === currentUser.storeId);
        const filteredOrders = orders
            .filter(o => o.storeId === currentUser.storeId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return { store: managerStore, storeProducts: filteredProducts, storeOrders: filteredOrders };
    }, [currentUser, products, orders, stores]);

    if (context.isLoading) {
        return <div className="pt-40 text-center">Loading...</div>;
    }

    if (!store) {
        return (
            <div className="container mx-auto text-center pt-40">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You must be a store owner to view this page.</p>
            </div>
        );
    }

    return (
        <StoreManagerPage
            onBack={() => router.back()}
            store={store}
            storeProducts={storeProducts}
            storeOrders={storeOrders}
            onUpdateOrderStatus={context.handleUpdateOrderStatus}
            onUpdateProductStock={context.handleUpdateProductStock}
            onUpdateStore={context.handleUpdateStore}
            addToast={context.addToast}
        />
    );
}
