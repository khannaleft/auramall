
import React from 'react';
import SkeletonCard from './SkeletonCard';

interface ProductListSkeletonProps {
    count?: number;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default ProductListSkeleton;
