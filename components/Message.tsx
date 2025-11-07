
import React from 'react';
import { AlertTriangleIcon } from './icons';

interface MessageProps {
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'error';
}

const Message: React.FC<MessageProps> = ({ title, children, type = 'info' }) => {
  const baseClasses = 'max-w-3xl mx-auto mt-10 p-6 rounded-lg shadow-lg';
  const typeClasses = {
    info: 'bg-gray-800 border-gray-700',
    error: 'bg-red-900/20 border-red-500/50',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} border`}>
      <div className="flex items-center">
        {type === 'error' && <AlertTriangleIcon className="w-8 h-8 text-red-400 mr-4" />}
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
      </div>
      <div className="mt-4 text-gray-300 space-y-2">
        {children}
      </div>
    </div>
  );
};

export default Message;
