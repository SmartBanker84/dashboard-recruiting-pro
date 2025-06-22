'use client';

import React from 'react';
import { cn } from '@/lib/utils'; // Rimuovilo o sostituiscilo se non hai questa funzione

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
      default: 'bg-primary-600 text-white hover:bg-primary-700',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    };

    const sizeClasses = {
      default: 'px-4 py-2',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
