import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SiReact, SiNextdotjs, SiVuedotjs, SiTypescript, SiNodedotjs, SiPython, SiPostgresql, SiTailwindcss, SiTelegram, SiVk } from "react-icons/si";
import { Cloud, CreditCard, Server, Database, Truck, Building2, BarChart3, MapPin, Code, Layers } from "lucide-react";

const programmingTech = [
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
  { name: "Vue.js", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
];

const russianServices = [
  { name: "Яндекс Cloud", icon: Cloud, color: "#FC3F1D" },
  { name: "VK Cloud", icon: Server, color: "#0077FF" },
  { name: "ЮКасса", icon: CreditCard, color: "#00BFFF" },
  { name: "Яндекс.Метрика", icon: BarChart3, color: "#FC3F1D" },
  { name: "1С", icon: Database, color: "#FFD700" },
  { name: "Битрикс24", icon: Building2, color: "#2FC7F7" },
  { name: "СДЭК", icon: Truck, color: "#00B33C" },
  { name: "DaData", icon: MapPin, color: "#FF6B35" },
  { name: "Telegram Bot", icon: SiTelegram, color: "#26A5E4" },
  { name: "VK API", icon: SiVk, color: "#0077FF" },
];

interface TechItem {
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

function TechPill({ tech, index, isInView }: { tech: TechItem; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.05 * index }}
      className="group"
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/50 border border-border backdrop-blur-sm hover-elevate cursor-default transition-all duration-300"
        style={{
          boxShadow: `0 0 0 0 ${tech.color}20`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 20px 0 ${tech.color}30`;
          e.currentTarget.style.borderColor = `${tech.color}50`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 0 ${tech.color}20`;
          e.currentTarget.style.borderColor = "";
        }}
        data-testid={`tech-${tech.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <tech.icon
          className="w-5 h-5 transition-colors duration-300"
          style={{ color: tech.color }}
        />
        <span className="text-sm font-medium text-foreground">{tech.name}</span>
      </div>
    </motion.div>
  );
}

export function TechnologiesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.03),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
            Технологии
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Используем{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              современный стек
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Работаем с проверенными технологиями и российскими сервисами для надёжных решений
          </p>
        </motion.div>

        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Code className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-foreground">Технологии разработки</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-5">
              {programmingTech.map((tech, index) => (
                <TechPill key={tech.name} tech={tech} index={index} isInView={isInView} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-foreground">Российские сервисы и интеграции</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-5">
              {russianServices.map((tech, index) => (
                <TechPill key={tech.name} tech={tech} index={index + programmingTech.length} isInView={isInView} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
