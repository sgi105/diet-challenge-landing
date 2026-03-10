export default function Button({ children, variant = 'primary', size = 'lg', onClick, className = '' }) {
  const base = 'font-semibold rounded-xl transition-all duration-300 cursor-pointer';

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
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
