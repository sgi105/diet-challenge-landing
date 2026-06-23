export default function Button({ children, variant = 'primary', size = 'lg', onClick, className = '', disabled = false }) {
  const base = 'font-semibold rounded-xl transition-all duration-300';

  const variants = {
    primary: 'bg-accent-green text-bg-primary hover:brightness-110',
    secondary: 'border-2 border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-white',
  };

  const sizes = {
    lg: 'px-8 py-4 text-lg',
    md: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  );
}
