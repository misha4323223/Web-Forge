import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, PenTool, Code, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Обсуждение",
    description: "Изучаем ваш бизнес, цели и задачи. Определяем функционал и составляем ТЗ.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "Дизайн",
    description: "Создаём рабочую версию и отправляем превью. Вносим правки до согласования.",
    icon: PenTool,
  },
  {
    number: "03",
    title: "Интеграции",
    description: "Подключаем оплату, доставку, аналитику. Проводим тестирование.",
    icon: Code,
  },
  {
    number: "04",
    title: "Запуск",
    description: "Разворачиваем на сервере, настраиваем домен и передаём продукт.",
    icon: Rocket,
  },
];

export function ProcessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="process" className="py-16 md:py-24 relative overflow-hidden bg-card/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.05),transparent_70%)]" />

      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-4">
            Процесс
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Как мы{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              работаем
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-cyan-500/20" />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * index }}
                className="relative pl-12 md:pl-16"
              >
                <div className="absolute left-0 md:left-2 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <step.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                
                <div className="pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-primary/60">{step.number}</span>
                    <h3 className="text-lg font-bold text-foreground" data-testid={`process-step-${index + 1}`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
