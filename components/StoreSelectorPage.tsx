
'use client';

import React, { useState, useEffect } from 'react';
import { Store, User } from '@/types';
import Icon from './Icon';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';

interface StoreSelectorPageProps {
  stores: Store[];
}

interface StoreWithDistance extends Store {
    distance?: number;
}

const StoreSelectorPage: React.FC<StoreSelectorPageProps> = ({ stores }) => {
  const router = useRouter();
  const { currentUser, handleLogout, handleGoogleLogin, onLoginClick } = useAppContext();
  
  const [allStores, setAllStores] = useState<StoreWithDistance[]>([]);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setAllStores(stores);
  }, [stores]);

  const haversineDistance = (
    coords1: { latitude: number; longitude: number },
    coords2: { latitude: number; longitude: number }
  ): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        const storesWithDistances = stores.map((store) => ({ ...store, distance: haversineDistance(userCoords, { latitude: store.latitude, longitude: store.longitude }) }))
                                          .sort((a, b) => a.distance - b.distance);
        setAllStores(storesWithDistances);
        setLocationStatus('success');
      },
      () => {
        setLocationError("Could not get your location. Please ensure location services are enabled.");
        setLocationStatus('error');
      }
    );
  };
  
  const onSelectStore = (storeId: number) => {
    router.push(`/${storeId}`);
  };

  return (
    <>
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-center bg-cover" style={{backgroundImage: "url('https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2500&auto=format&fit=crop')", filter: 'grayscale(50%) brightness(50%)'}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        <div className="absolute top-6 right-6 z-20">
            {currentUser ? (
              <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md p-2 rounded-lg">
                <span className="text-white/80 text-sm">Welcome, <span className="font-semibold text-white">{currentUser.name.split(' ')[0]}</span></span>
                <button
                  onClick={handleLogout}
                  className="bg-white/10 text-white text-sm font-semibold py-2 px-3 rounded-md hover:bg-white/20 transition-colors"
                  aria-label="Logout"
                >
                  <Icon name="logout" className="w-5 h-5"/>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2 bg-white/90 text-gray-800 font-bold py-2 px-4 rounded-lg backdrop-blur-md hover:bg-white transition-colors duration-300"
                  aria-label="Sign in with Google"
                >
                  <Icon name="google" className="w-5 h-5" />
                  Sign in
                </button>
                <button
                  onClick={onLoginClick}
                  className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:opacity-85 transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>
            )}
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
            <div className="animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 drop-shadow-xl">
                    Aura
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-12 drop-shadow-lg max-w-2xl">
                    Your journey to natural radiance begins here. Please select a store to begin shopping.
                </p>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-8 gap-4 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                <button 
                    onClick={handleFindNearby}
                    disabled={locationStatus === 'loading'}
                    className="flex items-center gap-3 bg-white/20 backdrop-blur-md text-white font-bold py-3 px-6 rounded-lg border border-white/20 hover:bg-white/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                >
                    <Icon name="location-marker" className="w-6 h-6 text-accent" />
                    {locationStatus === 'loading' ? 'Finding You...' : 'Find Nearby Stores'}
                </button>
                {locationError && <p className="text-red-300 text-sm max-w-md mx-auto mt-2 bg-red-900/50 p-2 rounded-md">{locationError}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full animate-fade-in-up" style={{animationDelay: '400ms'}}>
            {allStores.map(store => (
                <div key={store.id} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-white/20 hover:-translate-y-1 flex flex-col group overflow-hidden">
                    <div className="relative w-full h-40 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        <Image src={store.bannerUrl} alt={`${store.name} banner`} fill className="object-cover" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow text-left">
                        <h2 className="text-2xl font-serif font-bold text-white mb-1 group-hover:text-accent transition-colors">{store.name}</h2>
                        <div className="flex justify-between items-baseline mb-6">
                            <p className="text-white/60">{store.location}</p>
                            {store.distance !== undefined && (
                                <span className="text-sm font-semibold bg-accent/20 text-accent py-1 px-2 rounded-full">{store.distance.toFixed(1)} km</span>
                            )}
                        </div>
                        <button
                        onClick={() => onSelectStore(store.id)}
                        className="mt-auto bg-accent text-white font-bold py-3 px-6 rounded-lg hover:opacity-85 transition-all duration-300 transform group-hover:scale-105 self-start"
                        >
                        Shop Here
                        </button>
                    </div>
                </div>
            ))}
            </div>
        </div>
    </div>
    </>
  );
};

export default StoreSelectorPage;
