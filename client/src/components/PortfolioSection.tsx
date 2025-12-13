import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

import sweetDelightsImg from "@assets/image_1765623150824.png";

const portfolioItems = [
  {
    id: 1,
    title: "Sweet Delights",
    description: "Интернет-магазин сладостей с админкой, Telegram-приложением, оплатой Robokassa и хранением в Яндекс Cloud.",
    tags: ["React", "Node.js", "PostgreSQL", "Robokassa", "Telegram"],
    image: sweetDelightsImg,
    externalUrl: "https://sweetdelights.store/",
    badgeType: "live" as const,
  },
  {
    id: 2,
    title: "ВкусДом",
    description: "Концепт лендинга для доставки азиатской еды. Яркий дизайн, анимированное меню, корзина заказа.",
    tags: ["React", "Framer Motion", "Tailwind"],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    demoUrl: "/demo/food-delivery",
    badgeType: "concept" as const,
  },
  {
    id: 3,
    title: "ФОРМА",
    description: "Концепт сайта фитнес-студии. Тёмный стиль, расписание тренировок, тарифные планы.",
    tags: ["React", "Framer Motion", "Dark Theme"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    demoUrl: "/demo/fitness",
    badgeType: "concept" as const,
  },
  {
    id: 4,
    title: "NATURA",
    description: "Концепт интернет-магазина косметики. Минималистичный дизайн, каталог товаров, избранное и корзина.",
    tags: ["React", "E-commerce", "Minimalist"],
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop",
    demoUrl: "/demo/cosmetics",
    badgeType: "concept" as const,
  },
  {
    id: 5,
    title: "STREETWEAR",
    description: "Концепт магазина российского стритвира. Тёмная тема, категории, бренды, корзина.",
    tags: ["React", "E-commerce", "Dark Theme"],
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=600&h=400&fit=crop",
    demoUrl: "/demo/streetwear",
    badgeType: "concept" as const,
  },
];

export function PortfolioSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [, setLocation] = useLocation();

  const handleItemClick = (item: typeof portfolioItems[0]) => {
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank", "noopener,noreferrer");
    } else if (item.demoUrl) {
      setLocation(item.demoUrl);
    }
  };

  return (
    <section id="portfolio" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
            Портфолио
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Проекты и{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              демо-концепты
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Реализованные проекты и примеры сайтов для разных ниш — кликните, чтобы посмотреть вживую.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <Card
                className="group relative overflow-hidden p-0 border-border bg-card/50 backdrop-blur-sm hover-elevate cursor-pointer h-full"
                onClick={() => handleItemClick(item)}
                data-testid={`card-portfolio-${item.id}`}
              >
                <div className="h-48 relative overflow-hidden rounded-t-md">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    {item.badgeType === "live" ? (
                      <Badge variant="secondary" className="bg-emerald-500/90 backdrop-blur-sm text-white border-0">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-purple-500/90 backdrop-blur-sm text-white border-0">
                        Концепт
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.externalUrl && (
                      <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-mono text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
