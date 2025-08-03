
import React from 'react';
import { Store } from '../types';

interface LocationProps {
  store: Store;
}

const Location: React.FC<LocationProps> = ({ store }) => {
  const mapUrl = `https://maps.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
    
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="bg-secondary rounded-2xl shadow-lg p-8 md:p-12 border border-glass-border">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-8 text-center">
          Our Sanctuary in {store.location.split(',')[0]}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="w-full h-80 md:h-full rounded-xl overflow-hidden shadow-md border border-glass-border">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${store.name} Location`}
            ></iframe>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold font-serif text-text-primary mb-4">
              {store.name}
            </h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Find us in {store.location}.
              <br />
              Visit us for an exclusive in-store experience.
            </p>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
