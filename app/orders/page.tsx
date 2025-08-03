
import OrdersPageClient from './OrdersPageClient';

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

// This page is now a Server Component.
// It safely reads URL search parameters on the server and passes them as props
// to a Client Component. This is the recommended Next.js pattern to avoid
// server-side errors when dealing with browser-specific APIs like the URL.
export default function OrdersPage({ searchParams }: PageProps) {
  return (
    <OrdersPageClient 
      paymentStatus={searchParams?.payment}
    />
  );
}
