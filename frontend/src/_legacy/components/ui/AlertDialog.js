// src/components/ui/AlertDialog.js
import React from 'react';

const AlertDialogContainer = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">{children}</div>
    </div>
  );
};

export const AlertDialogTrigger = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
);

export const AlertDialogContent = ({ children }) => (
  <div>{children}</div>
);

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
