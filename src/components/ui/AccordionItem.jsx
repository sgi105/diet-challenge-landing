import { useState } from 'react';

export default function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-left cursor-pointer"
      >
        <span className="font-semibold text-text-primary pr-4">{question}</span>
        <span className={`text-accent-green text-2xl transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? '600px' : 0 }}
      >
        <p className="text-text-secondary text-sm pb-4 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}
