import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'glass' | 'gradient';
}> = ({ children, className, title, subtitle, variant = 'default' }) => {
  const variants = {
    default: "bg-white border-gray-200 shadow-sm",
    glass: "bg-white/70 backdrop-blur-md border-white/20 shadow-xl",
    gradient: "bg-gradient-to-br from-white to-blue-50/50 border-blue-100 shadow-md"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg", variants[variant], className)}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-gray-100/50 bg-gray-50/30">
          {title && <h3 className="font-bold text-gray-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

type ButtonProps = HTMLMotionProps<"button"> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg hover:shadow-blue-300',
    secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    outline: 'border-2 border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-red-100 shadow-lg',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100 shadow-lg',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs h-8',
    md: 'px-5 py-2.5 text-sm h-10',
    lg: 'px-8 py-3.5 text-base h-12',
    icon: 'p-2 w-10 h-10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; icon?: React.ReactNode }> = ({ label, error, icon, className, ...props }) => (
  <div className="space-y-1.5 group">
    {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10",
          icon && "pl-11",
          error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }> = ({ label, error, children, className, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
    <select
      className={cn(
        "w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer",
        error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info'; className?: string }> = ({ children, variant = 'info', className }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-100/50',
    danger: 'bg-rose-50 text-rose-700 border-rose-100/50',
    info: 'bg-blue-50 text-blue-700 border-blue-100/50',
  };

  return (
    <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};
