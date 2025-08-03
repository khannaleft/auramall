
import HomePageClient from "@/components/HomePageClient";
import { getStores } from "@/services/firebaseService";

// This is a server component that fetches all necessary data for the main page
export default async function HomePage() {
  const stores = await getStores();
  
  return <HomePageClient stores={stores} />;
}