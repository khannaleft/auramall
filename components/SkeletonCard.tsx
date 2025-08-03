
import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-glass-bg border border-glass-border rounded-2xl overflow-hidden shadow-lg flex flex-col animate-pulse">
      <div className="w-full h-64 bg-secondary/50"></div>
      <div className="p-6 flex-grow">
        <div className="h-6 w-3/4 bg-secondary/50 rounded mb-4"></div>
        <div className="h-4 w-full bg-secondary/50 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-secondary/50 rounded"></div>
      </div>
      <div className="p-6 pt-0 flex justify-between items-center">
        <div className="h-8 w-1/3 bg-secondary/50 rounded"></div>
        <div className="h-10 w-28 bg-secondary/50 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
