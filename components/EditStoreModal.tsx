
import React, { useState, useEffect } from 'react';
import { Store, Toast } from '../types';
import Icon from './Icon';
import { uploadToCloudinary } from '@/services/cloudinaryService';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStore: (storeId: number, data: Partial<Store>) => void;
  store: Store;
  addToast: (message: string, type?: Toast['type']) => void;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ isOpen, onClose, onUpdateStore, store, addToast }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (store && isOpen) {
      setName(store.name);
      setLocation(store.location);
      setLatitude(store.latitude);
      setLongitude(store.longitude);
      setBannerPreview(store.bannerUrl);
      setBannerFile(null);
    } else if (!isOpen) {
        const timer = setTimeout(() => {
             if (bannerPreview && !bannerPreview.startsWith('https')) {
                URL.revokeObjectURL(bannerPreview);
            }
            setBannerPreview(null);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [store, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      if (bannerPreview && !bannerPreview.startsWith('https')) {
        URL.revokeObjectURL(bannerPreview);
      }
      setBannerPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || latitude === 0 || longitude === 0) {
      addToast('Please fill out all fields correctly.', 'error');
      return;
    }
    
    setIsUploading(true);
    try {
      let finalBannerUrl = store.bannerUrl;
      if (bannerFile) {
        finalBannerUrl = await uploadToCloudinary(bannerFile);
      }
      
      const updatedData: Partial<Store> = {
        name, location, latitude, longitude,
        bannerUrl: finalBannerUrl,
      };
      onUpdateStore(store.id, updatedData);
      onClose();
    } catch (error) {
        addToast('Image upload failed. Please try again.', 'error');
    } finally {
        setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-secondary text-text-primary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-glass-border">
          <h2 className="text-2xl font-serif font-bold">Edit Store</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Banner Image</label>
                <div className="mt-2 flex justify-center items-center w-full">
                    <label htmlFor="edit-banner-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-text-secondary/30 rounded-lg cursor-pointer bg-primary hover:bg-secondary/50">
                        {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Icon name="upload" className="w-8 h-8 mb-4 text-text-secondary/50" />
                                <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold text-accent">Click to upload</span> or drag and drop</p>
                            </div>
                        )}
                        <input id="edit-banner-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                    </label>
                </div> 
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Store Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading} />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Location Address</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Latitude</label>
                    <input type="number" step="any" value={latitude} onChange={e => setLatitude(parseFloat(e.target.value))} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Longitude</label>
                    <input type="number" step="any" value={longitude} onChange={e => setLongitude(parseFloat(e.target.value))} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading} />
                </div>
            </div>
            <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onClose} disabled={isUploading} className="bg-primary text-text-primary font-bold py-2 px-6 rounded-lg border border-glass-border hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isUploading} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-wait">
                   {isUploading ? 'Uploading...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditStoreModal;
