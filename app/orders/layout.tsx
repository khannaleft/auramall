
'use client'
import React from 'react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-primary min-h-screen text-text-primary transition-colors duration-500">
      <div className="relative z-10 flex flex-col min-h-screen">
          <Header selectedStoreId={null} />
          <main className="flex-grow">
              {children}
          </main>
          <Footer />
      </div>
    </div>
  );
}