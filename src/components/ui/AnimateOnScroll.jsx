import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function AnimateOnScroll({ children, animation = 'animate-fade-up', delay = 0, className = '' }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animation : 'opacity-0'}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
