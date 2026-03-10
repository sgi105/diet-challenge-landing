import { useState, useRef, useEffect } from 'react';

export default function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [answer]);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 text-left cursor-pointer"
      >
        <span className="font-semibold text-text-primary pr-4">{question}</span>
        <span className={`text-accent-green text-2xl transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? height : 0 }}
      >
        <p ref={contentRef} className="text-text-secondary pb-5 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}
