
import React, { useState, useEffect } from 'react';
import { Product, Store, Toast } from '../types';
import Icon from './Icon';
import { uploadToCloudinary } from '@/services/cloudinaryService';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (productId: number, data: Partial<Product>) => void;
  product: Product;
  stores: Store[];
  addToast: (message: string, type?: Toast['type']) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onUpdateProduct, product, stores, addToast }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('Face Care');
  const [stock, setStock] = useState(0);
  const [storeId, setStoreId] = useState<number | ''>('');
  
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setCategory(product.category);
      setStock(product.stock);
      setStoreId(product.storeId);
      setCurrentImageUrls(product.imageUrls);
      setNewImageFiles([]);
      newImagePreviews.forEach(URL.revokeObjectURL);
      setNewImagePreviews([]);
    }
  }, [product, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...filesArray]);

      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previewsArray]);
      e.target.value = '';
    }
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews(prev => {
        const newPreviews = prev.filter((_, index) => index !== indexToRemove);
        URL.revokeObjectURL(prev[indexToRemove]);
        return newPreviews;
    });
  };

  const removeCurrentImage = (urlToRemove: string) => {
    setCurrentImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentImageUrls.length === 0 && newImageFiles.length === 0) {
      addToast('Product must have at least one image.', 'error');
      return;
    }
    if (!name || !description || price <= 0 || !category || stock < 0 || storeId === '') {
      addToast('Please fill out all fields correctly.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedNewUrls = await Promise.all(newImageFiles.map(file => uploadToCloudinary(file)));
      const finalImageUrls = [...currentImageUrls, ...uploadedNewUrls];
      
      const updatedData: Partial<Product> = {
        storeId: Number(storeId), name, description, price,
        imageUrls: finalImageUrls,
        category, stock,
      };
      onUpdateProduct(product.id, updatedData);
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
          <h2 className="text-2xl font-serif font-bold">Edit Product</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Manage Images</label>
                {currentImageUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4 border border-dashed border-text-secondary/20 rounded-lg">
                        {currentImageUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={url} alt={`Current image ${index}`} className="w-full h-full object-cover rounded-md" />
                                <button type="button" onClick={() => removeCurrentImage(url)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none" aria-label="Remove image">
                                    <Icon name="trash" className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                 <div className="mt-4 flex justify-center rounded-lg border border-dashed border-text-secondary/30 px-6 py-10">
                    <div className="text-center">
                        <Icon name="upload" className="mx-auto h-12 w-12 text-text-secondary/50" />
                        <div className="mt-4 flex text-sm leading-6 text-text-secondary">
                            <label htmlFor="edit-file-upload" className="relative cursor-pointer rounded-md bg-secondary font-semibold text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-secondary hover:text-opacity-80">
                                <span>Upload new images</span>
                                <input id="edit-file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                            </label>
                        </div>
                    </div>
                </div>
                {newImagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {newImagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={preview} alt={`New preview ${index}`} className="w-full h-full object-cover rounded-md" />
                                <button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none" aria-label="Remove image">
                                    <Icon name="close" className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Product Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading} />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" rows={3} required disabled={isUploading}></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Price (₹)</label>
                    <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading}>
                        <option>Face Care</option>
                        <option>Body Care</option>
                        <option>Hair Care</option>
                        <option>Tools</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Stock Quantity</label>
                    <input type="number" value={stock} onChange={e => setStock(parseInt(e.target.value, 10))} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Store</label>
                <select value={storeId} onChange={e => setStoreId(Number(e.target.value))} className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent" required disabled={isUploading}>
                    {stores.map(store => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                </select>
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

export default EditProductModal;
