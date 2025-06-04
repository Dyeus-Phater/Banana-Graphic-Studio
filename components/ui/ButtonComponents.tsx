
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'secondary', size = 'md', leftIcon, className, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
      break;
    case 'secondary':
      variantStyle = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500";
      break;
    case 'ghost':
      variantStyle = "text-gray-700 hover:bg-gray-100 focus:ring-indigo-500";
      break;
  }

  let sizeStyle = "";
  switch (size) {
    case 'sm':
      sizeStyle = "px-3 py-1.5 text-sm";
      break;
    case 'md':
      sizeStyle = "px-4 py-2 text-sm";
      break;
    case 'lg':
      sizeStyle = "px-6 py-3 text-base";
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`}
      {...props}
    >
      {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
      {children}
    </button>
  );
};
