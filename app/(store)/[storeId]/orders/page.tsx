'use client';

import React, { useMemo } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import OrderHistoryPage from '@/components/OrderHistoryPage';
import { useRouter } from 'next/navigation';

export default function Orders() {
    const { orders, currentUser } = useAppContext();
    const router = useRouter();

    const userOrders = useMemo(() => {
        if (!currentUser) return [];
        return orders
            .filter(o => o.userEmail === currentUser.email)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, currentUser]);

    return (
        <OrderHistoryPage
            orders={userOrders}
            onBack={() => router.back()}
        />
    );
}
