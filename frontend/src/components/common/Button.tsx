import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#44a354] text-[#002107] hover:bg-[#7bdb85] active:bg-[#39994B]',
  secondary:
    'bg-[#2a2a2a] text-[#e5e2e1] border border-[#3f4a3e] hover:bg-[#353534] active:bg-[#3f4a3e]',
  danger:
    'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7bdb85] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131313] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
