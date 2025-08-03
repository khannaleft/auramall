
'use client';

import React, { useMemo, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import OrderHistoryPage from '@/components/OrderHistoryPage';
import { useRouter } from 'next/navigation';

interface OrdersPageClientProps {
  paymentStatus?: string | string[] | undefined;
}

export default function OrdersPageClient({ paymentStatus }: OrdersPageClientProps) {
    const { orders, currentUser, handleOpenPaymentResultModal } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        // If a payment status is passed from the server component,
        // open the checkout modal to show the success/failure message.
        if (paymentStatus) {
            handleOpenPaymentResultModal();
        }
    }, [paymentStatus, handleOpenPaymentResultModal]);

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
