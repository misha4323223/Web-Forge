import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
              О студии
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Мы создаём{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                цифровые решения
              </span>{" "}
              для вашего бизнеса
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              WebStudio — команда профессионалов, которая объединяет креативный дизайн и
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
