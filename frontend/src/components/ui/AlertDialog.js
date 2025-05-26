// src/components/ui/AlertDialog.js
import React, { useRef, forwardRef } from 'react';

const AlertDialogContainer = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop, not the dialog content
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 dialog-overlay"
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
};

export const AlertDialogTrigger = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
);

export const AlertDialogContent = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>{children}</div>
));

export const AlertDialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const AlertDialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const AlertDialogDescription = ({ children }) => (
  <p className="text-md text-gray-700">{children}</p>
);

export const AlertDialogFooter = ({ children }) => (
  <div className="mt-4 flex justify-end space-x-2">{children}</div>
);

export const AlertDialogAction = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    {children}
  </button>
);

export const AlertDialogCancel = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
  >
    {children}
  </button>
);

export default AlertDialogContainer;
