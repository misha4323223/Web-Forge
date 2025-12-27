import { motion } from "framer-motion";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "./ParticleBackground";

interface FlyingLetterProps {
  letter: string;
  index: number;
  totalLetters: number;
  isGradient?: boolean;
}

function FlyingLetter({ letter, index, totalLetters, isGradient }: FlyingLetterProps) {
  const isAndroid = useMemo(() => {
    return /Android/i.test(navigator.userAgent);
  }, []);

  const startPosition = useMemo(() => {
    if (isAndroid) {
      // Анимация "изнутри" для Android: зум и появление
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.1,
      };
    }
    const angle = (index / totalLetters) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 300 + Math.random() * 400;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 200,
      rotate: (Math.random() - 0.5) * 360,
      scale: 0.3 + Math.random() * 0.3,
    };
  }, [index, totalLetters, isAndroid]);

  const delay = 0.3 + index * 0.03;

  if (letter === " ") {
    return <span className="inline-block w-[0.3em]">&nbsp;</span>;
  }

  return (
    <motion.span
      className={`inline-block ${isGradient ? "bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto]" : ""}`}
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        rotate: startPosition.rotate,
        scale: startPosition.scale,
        opacity: 0,
        filter: isAndroid ? "blur(4px)" : "blur(8px)",
      }}
      animate={{
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      }}
      transition={isAndroid ? {
        duration: 0.5,
        delay: delay,
        ease: "easeOut",
      } : {
        duration: 0.8,
        delay: delay,
        type: "spring",
        stiffness: 100,
        damping: 12,
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
}

function AnimatedText({ text, startIndex, isGradient }: AnimatedTextProps) {
  const words = text.split(" ");
  let letterIndex = startIndex;
  const totalLetters = text.length + startIndex;

  return (
    <>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {word.split("").map((letter, letterIdx) => {
            const currentIndex = letterIndex;
            letterIndex++;
            return (
              <FlyingLetter
                key={`${wordIdx}-${letterIdx}`}
                letter={letter}
                index={currentIndex}
                totalLetters={totalLetters + 15}
                isGradient={isGradient}
              />
            );
          })}
          {wordIdx < words.length - 1 && (
            <span className="inline-block w-[0.3em]">&nbsp;</span>
          )}
        </span>
      ))}
    </>
  );
}

function GlowPulse() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.5, 0] }}
      transition={{ duration: 1.5, delay: 1.8, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-xl" />
    </motion.div>
  );
}

export function HeroSection() {
  const scrollToPortfolio = () => {
    const element = document.querySelector("#portfolio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const line1 = "Это не лендинг про нас.";
  const line2 = "Это витрина для вас.";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.08),transparent_50%)]" />
      </div>

      <ParticleBackground />

      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <span className="neon-badge">
            <span className="neon-badge-text">Веб-студия нового поколения</span>
          </span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 relative overflow-hidden">
          <GlowPulse />
          <span className="text-foreground block">
            <AnimatedText text={line1} startIndex={0} />
          </span>
          <span className="block mt-2">
            <AnimatedText text={line2} startIndex={line1.length} isGradient />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Каждый сайт создаётся с нуля — под ваш бизнес, под вашу аудиторию, под ваши цели.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="/order">
            <Button
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 shadow-lg shadow-cyan-500/25"
              data-testid="button-hero-cta"
            >
              Заказать сайт
            </Button>
          </a>
          <Button
            variant="outline"
            onClick={scrollToPortfolio}
            className="backdrop-blur-sm"
            data-testid="button-hero-portfolio"
          >
            Смотреть работы
          </Button>
        </motion.div>
      </div>


      <div className="absolute top-1/4 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-slow" />
    </section>
  );
}
