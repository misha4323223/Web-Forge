import { motion, useInView } from "framer-motion";
import { useRef, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useFAQSchema } from "@/lib/useFAQSchema";
import { ParticleBackground } from "./ParticleBackground";

interface FlyingLetterProps {
  letter: string;
  index: number;
  totalLetters: number;
  isGradient?: boolean;
  isInView: boolean;
}

function FlyingLetter({ letter, index, totalLetters, isGradient, isInView }: FlyingLetterProps) {
  const isAndroid = useMemo(() => {
    return /Android/i.test(navigator.userAgent);
  }, []);

  const startPosition = useMemo(() => {
    if (isAndroid) {
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.2,
      };
    }
    const angle = (index / totalLetters) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 200 + Math.random() * 300;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 100,
      rotate: (Math.random() - 0.5) * 180,
      scale: 0.5 + Math.random() * 0.3,
    };
  }, [index, totalLetters, isAndroid]);

  const delay = index * 0.02;

  if (letter === " ") {
    return <span className="inline-block w-[0.3em]">&nbsp;</span>;
  }

  return (
    <motion.span
      className={`inline-block ${isGradient ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" : ""}`}
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        rotate: startPosition.rotate,
        scale: startPosition.scale,
        opacity: 0,
        filter: isAndroid ? "blur(2px)" : "blur(6px)",
      }}
      animate={isInView ? {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      } : {}}
      transition={isAndroid ? {
        duration: 0.4,
        delay: delay,
        ease: "easeOut",
      } : {
        duration: 0.6,
        delay: delay,
        type: "spring",
        stiffness: 120,
        damping: 14,
      }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {letter}
    </motion.span>
  );
}

interface AnimatedTextProps {
  text: string;
  startIndex: number;
  isGradient?: boolean;
  isInView: boolean;
}

function AnimatedText({ text, startIndex, isGradient, isInView }: AnimatedTextProps) {
  const words = text.split(" ");
  let letterIndex = startIndex;

  return (
    <>
      {words.map((word, wordIdx) => {
        const wordStartIndex = letterIndex;
        letterIndex += word.length + 1;
        
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {word.split("").map((letter, i) => (
              <FlyingLetter
                key={i}
                letter={letter}
                index={wordStartIndex + i}
                totalLetters={startIndex + text.length + 10}
                isGradient={isGradient}
                isInView={isInView}
              />
            ))}
            {wordIdx < words.length - 1 && <span className="inline-block w-[0.3em]">&nbsp;</span>}
          </span>
        );
      })}
    </>
  );
}

const faqs = [
  {
    question: "В чём разница между лендингом, корпоративным сайтом и интернет-магазином?",
    answer: "Лендинг — одностраничный сайт для продвижения конкретного товара/услуги с фокусом на конверсию. Корпоративный сайт — многостраничный портал компании с информацией об услугах, командой, контактами. Интернет-магазин — платформа с каталогом товаров, корзиной, платежной системой и управлением заказами. Сайт-визитка — простой одностраничный сайт с основной информацией о компании, контактами и примерами работ для небольших бизнесов и специалистов."
  },
  {
    question: "Сколько времени занимает разработка сайта?",
    answer: "В среднем: Сайт-визитка — 1-2 недели, Лендинг — 2-3 недели, Корпоративный сайт — 3-4 недели, Интернет-магазин — 4-6 недель. Сроки зависят от сложности, количества функций и скорости согласования макетов. Мы соблюдаем график и держим вас в курсе каждый этап."
  },
  {
    question: "Как работает калькулятор стоимости на сайте?",
    answer: "Выберите тип проекта (базовая цена), а затем добавьте нужные функции: интеграция с платежами, аналитика, многоязычность, дополнительные страницы и т.д. Каждая функция добавляет свою стоимость. Итоговая цена зависит от объёма работ."
  },
  {
    question: "Что входит в поддержку после запуска сайта?",
    answer: "В стандартную поддержку входит: исправление ошибок в течение 14 дней, техническая консультация, помощь с обновлением контента. Дополнительные услуги (SEO, дизайн обновлений, расширение функционала) оплачиваются отдельно через систему дополнительных счетов."
  },
  {
    question: "Вы помогаете с покупкой домена и хостингом?",
    answer: "Да! Мы помогаем выбрать домен, переносим DNS, настраиваем SSL-сертификат и помогаем с покупкой и настройкой хостинга. Все настройки включены в процесс запуска проекта."
  },
  {
    question: "Это реальные проекты или вымышленные примеры?",
    answer: "Это демонстрационные примеры — шаблоны, которые показывают наши возможности. Каждый пример создан на основе реальных проектов, которые мы разработали. Вы можете использовать их как вдохновение или как основу для своего проекта."
  },
  {
    question: "Какие дополнительные функции можно добавить к базовому сайту?",
    answer: "К любому проекту можно добавить: интеграцию с 1С, CRM, email-маркетинг, видео на фоне, чат-бот, личный кабинет пользователя, рекомендательную систему, аналитику, многоязычность и многое другое. Основной список доступен в калькуляторе."
  },
  {
    question: "Как оплачивается работа? Есть ли рассрочка?",
    answer: "Работа оплачивается в два этапа: 50% предоплаты перед началом, 50% перед запуском. Для юридических лиц возможна выставка счёта. Дополнительные услуги оплачиваются через систему счётов отдельно."
  }
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useFAQSchema(faqs);

  const line1 = "Часто ";
  const line2 = "задаваемые вопросы";

  return (
    <section id="faq" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.08),transparent_50%)]" />
      </div>
      
      <ParticleBackground />

      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />

      <div className="max-w-3xl mx-auto px-6 relative z-10" ref={ref}>
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="neon-badge">
              <span className="neon-badge-text">Вопросы</span>
            </span>
          </motion.div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            <AnimatedText text={line1} startIndex={0} isInView={isInView} />
            <AnimatedText text={line2} startIndex={line1.length} isGradient isInView={isInView} />
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Отвечаем на вопросы клиентов о разработке, стоимости, сроках и поддержке
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + 0.05 * index }}
              data-testid={`faq-item-${index}`}
            >
              <Card className="p-0 overflow-hidden border border-border/50 hover:border-primary/30 transition-colors">
                <Button
                  variant="ghost"
                  className="w-full justify-between items-start p-6 h-auto hover:bg-card/50"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  data-testid={`button-faq-${index}`}
                >
                  <span className="text-left font-semibold text-base text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 ml-4 transition-transform duration-300 ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {expandedIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border/50"
                  >
                    <div className="px-6 py-4 text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
