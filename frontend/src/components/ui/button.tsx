import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2';
  const variantStyles = {
    primary: 'bg-health-600 text-white hover:bg-health-700 focus:ring-health-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
  };

  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
