'use client';
import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppContext();
  return (
    <div className="fixed top-24 right-4 z-[9999] w-full max-w-sm space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
