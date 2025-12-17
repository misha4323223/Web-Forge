import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Globe, ShoppingCart, Gauge, Palette, Code } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Корпоративные сайты",
    description: "Сайты, которые формируют доверие к бренду и привлекают клиентов.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: ShoppingCart,
    title: "Интернет-магазины",
    description: "E-commerce с каталогом, корзиной и оплатой онлайн.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Palette,
    title: "UI/UX Дизайн",
    description: "Интуитивные и красивые интерфейсы для ваших продуктов.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Gauge,
    title: "Оптимизация",
    description: "Ускорение, SEO и повышение конверсии сайтов.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Code,
    title: "Техподдержка",
    description: "Обновления, развитие и бесперебойная работа проектов.",
    color: "from-indigo-500 to-purple-500",
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-24 md:py-32 relative overflow-hidden bg-card/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
            Услуги
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Что мы{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              предлагаем
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Полный спектр услуг для создания и развития вашего присутствия в интернете
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
            >
              <Card
                className="group relative overflow-visible h-full p-4 border-border bg-background/50 backdrop-blur-sm hover-elevate"
                data-testid={`card-service-${index}`}
              >
                <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${service.color} flex items-center justify-center mb-3`}>
                  <service.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-snug break-words hyphens-auto">{service.description}</p>

                <div className={`absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                  <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${service.color} opacity-[0.05]`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
