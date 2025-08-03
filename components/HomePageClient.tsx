
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { Store } from '@/types';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Image from 'next/image';
import Icon from './Icon';

interface HomePageClientProps {
    stores: Store[];
}

interface StoreWithDistance extends Store {
    distance?: number;
}

const HomePageClientContent: React.FC<HomePageClientProps> = ({ stores }) => {
    const router = useRouter();

    const [allStores, setAllStores] = useState<StoreWithDistance[]>(stores);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        setAllStores(stores);
    }, [stores]);

    const handleSelectStore = (id: number) => {
        router.push(`/${id}`);
    };

    const haversineDistance = (coords1: { latitude: number; longitude: number }, coords2: { latitude: number; longitude: number }): number => {
        const toRad = (x: number) => (x * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(coords2.latitude - coords1.latitude);
        const dLon = toRad(coords2.longitude - coords1.longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(coords1.latitude)) * Math.cos(toRad(coords2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
                                                  .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
                setAllStores(storesWithDistances);
                setLocationStatus('success');
            },
            () => {
                setLocationError("Could not get your location. Please ensure location services are enabled.");
                setLocationStatus('error');
            }
        );
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            <Header selectedStoreId={null} />
            <div className="absolute inset-0 bg-center bg-cover -z-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2500&auto=format&fit=crop')", filter: 'grayscale(50%) brightness(50%)'}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent -z-10"></div>
            
            <div className="w-full flex flex-col items-center mt-20 md:mt-0">
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
                            onClick={() => handleSelectStore(store.id)}
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
    );
};

const HomePageClient: React.FC<HomePageClientProps> = (props) => (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-primary text-text-primary">Loading...</div>}>
        <HomePageClientContent {...props} />
    </Suspense>
);


export default HomePageClient;
