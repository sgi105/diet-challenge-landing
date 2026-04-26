import { useState } from 'react';

export default function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-card-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 text-left cursor-pointer"
      >
        <span className="font-bold text-card-ink pr-4">{question}</span>
        <span className={`text-bg-primary text-2xl transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? '600px' : 0 }}
      >
        <p className="text-card-ink-muted text-sm pb-5 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}
