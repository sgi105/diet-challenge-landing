import AnimateOnScroll from '../ui/AnimateOnScroll';
import AccordionItem from '../ui/AccordionItem';
import { faqItems } from '../../data/faq';

export default function FAQSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8">
          자주 묻는 질문
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-2xl px-6">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
