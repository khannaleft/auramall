"use client";

import React from 'react';
import { SortOption } from '../types';
import Icon from './Icon';

interface ProductControlsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const ProductControls: React.FC<ProductControlsProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange
}) => {
  return (
    <div className="container mx-auto px-4 pt-32 md:pt-40 pb-8">
        <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-text-primary mb-2">
                Our Collection
            </h2>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
                Explore our curated selection of handcrafted beauty oils.
            </p>
        </div>
        <div className="bg-secondary/50 border border-glass-border rounded-2xl shadow-md p-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
                <Icon name="search" className="w-5 h-5 text-text-secondary absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full p-3 pl-12 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder-text-secondary"
                  aria-label="Search products"
                />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
              aria-label="Filter by category"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full p-3 rounded-lg bg-primary border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
              aria-label="Sort products"
            >
              <option value="default">Default Sorting</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
    </div>
  );
};

export default ProductControls;
