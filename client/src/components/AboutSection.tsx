import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { ParticleBackground } from "./ParticleBackground";

interface FlyingLetterProps {
  letter: string;
  index: number;
  totalLetters: number;
  isGradient?: boolean;
  isInView: boolean;
}

function FlyingLetter({ letter, index, totalLetters, isGradient, isInView }: FlyingLetterProps) {
  const startPosition = useMemo(() => {
    const angle = (index / totalLetters) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 200 + Math.random() * 300;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 100,
      rotate: (Math.random() - 0.5) * 180,
      scale: 0.5 + Math.random() * 0.3,
    };
  }, [index, totalLetters]);

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
        filter: "blur(6px)",
      }}
      animate={isInView ? {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      } : {}}
      transition={{
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

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const line1 = "Мы создаём ";
  const line2 = "цифровые решения";
  const line3 = " для вашего бизнеса";

  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.08),transparent_50%)]" />
      </div>
      
      <ParticleBackground />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={ref} className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
              О студии
            </span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <AnimatedText text={line1} startIndex={0} isInView={isInView} />
            <AnimatedText text={line2} startIndex={line1.length} isGradient isInView={isInView} />
            <AnimatedText text={line3} startIndex={line1.length + line2.length} isInView={isInView} />
          </h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-muted-foreground text-lg mb-6">
              MP.WebStudio — команда профессионалов, которая объединяет креативный дизайн и
              передовые технологии для создания веб-продуктов, которые приносят результат.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Мы не просто делаем сайты — мы создаём инструменты для роста вашего бизнеса.
              Каждый проект — это индивидуальный подход, глубокое погружение в задачи клиента
              и стремление превзойти ожидания.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {["React", "Node.js", "Яндекс Cloud", "ЮКасса", "1С", "Битрикс24"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-md bg-card border border-border text-sm font-mono text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
