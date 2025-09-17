// components/ui/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className="
          w-12 h-12
          border-4 border-t-4 border-gray-200
          border-t-blue-500
          rounded-full
          animate-spin
        "
      ></div>
    </div>
  );
};

export default LoadingSpinner;