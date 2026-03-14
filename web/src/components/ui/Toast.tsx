'use client';

import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const showToast = {
  success: (message: string) =>
    toast(message, {
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      style: {
        background: '#2D2426',
        color: '#FFF8F0',
        borderRadius: '12px',
      },
    }),

  error: (message: string) =>
    toast(message, {
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      style: {
        background: '#2D2426',
        color: '#FFF8F0',
        borderRadius: '12px',
      },
      duration: 4000,
    }),

  info: (message: string) =>
    toast(message, {
      icon: <Info className="w-5 h-5 text-blue-400" />,
      style: {
        background: '#2D2426',
        color: '#FFF8F0',
        borderRadius: '12px',
      },
    }),

  warning: (message: string) =>
    toast(message, {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      style: {
        background: '#2D2426',
        color: '#FFF8F0',
        borderRadius: '12px',
      },
    }),
};

export default showToast;
