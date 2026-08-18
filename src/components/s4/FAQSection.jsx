import AnimateOnScroll from '../ui/AnimateOnScroll';
import AccordionItem from '../ui/AccordionItem';
import { faqItems } from '../../data/faq4';

export default function FAQSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">FAQ</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-8 text-text-primary leading-tight">
          자주 묻는 질문
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl px-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
