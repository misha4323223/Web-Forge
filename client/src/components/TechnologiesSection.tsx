import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SiReact, SiNextdotjs, SiVuedotjs, SiTypescript, SiNodedotjs, SiPython, SiPostgresql, SiMongodb, SiTailwindcss, SiFigma, SiDocker, SiAmazonwebservices } from "react-icons/si";

const technologies = [
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
  { name: "Vue.js", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Figma", icon: SiFigma, color: "#F24E1E" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
  { name: "AWS", icon: SiAmazonwebservices, color: "#FF9900" },
];

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
            Работаем с проверенными технологиями для создания надёжных и масштабируемых решений
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
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
                data-testid={`tech-${tech.name.toLowerCase()}`}
              >
                <tech.icon
                  className="w-5 h-5 transition-colors duration-300"
                  style={{ color: tech.color }}
                />
                <span className="text-sm font-medium text-foreground">{tech.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
