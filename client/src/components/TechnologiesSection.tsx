import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SiReact, SiNextdotjs, SiVuedotjs, SiTypescript, SiNodedotjs, SiPython, SiPostgresql, SiTailwindcss, SiTelegram, SiVk } from "react-icons/si";
import { Cloud, CreditCard, Server, Database, Truck, Building2, BarChart3, MapPin } from "lucide-react";

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
  { name: "Робокасса", icon: CreditCard, color: "#F7931A" },
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

function TechBadge({ tech }: { tech: TechItem }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm whitespace-nowrap"
      data-testid={`tech-${tech.name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <tech.icon className="w-4 h-4 flex-shrink-0" style={{ color: tech.color }} />
      <span className="text-sm font-medium text-foreground">{tech.name}</span>
    </div>
  );
}

function MarqueeRow({ items, direction = "left", speed = 30 }: { items: TechItem[]; direction?: "left" | "right"; speed?: number }) {
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div className="relative overflow-hidden py-2">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div
        className="flex gap-4"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {duplicatedItems.map((tech, index) => (
          <TechBadge key={`${tech.name}-${index}`} tech={tech} />
        ))}
      </div>
      
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-33.333%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export function TechnologiesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.03),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-4">
            Технологии
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Используем{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              современный стек
            </span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Проверенные технологии и российские сервисы
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-3"
        >
          <MarqueeRow items={programmingTech} direction="left" speed={25} />
          <MarqueeRow items={russianServices} direction="right" speed={35} />
        </motion.div>
      </div>
    </section>
  );
}
