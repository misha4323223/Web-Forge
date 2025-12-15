import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

import sweetDelightsImg from "@assets/image_1765623150824.webp";
import socksHeroImg from "@assets/generated_images/socks_collection_hero_image.webp";
import travelHeroImg from "@assets/generated_images/tropical_beach_travel_destination.webp";
import barberHeroImg from "@assets/generated_images/stylish_barbershop_interior.webp";
import foodHeroImg from "@assets/generated_images/asian_food_arrangement_table.png";
import fitnessHeroImg from "@assets/generated_images/modern_gym_interior_purple.png";
import cosmeticsHeroImg from "@assets/stock_images/cosmetics_skincare_p_2775c0e7.webp";
import streetwearHeroImg from "@assets/generated_images/streetwear_hero_banner_dark.webp";

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
    image: foodHeroImg,
    demoUrl: "/demo/food-delivery",
    badgeType: "concept" as const,
  },
  {
    id: 3,
    title: "ФОРМА",
    description: "Концепт сайта фитнес-студии. Тёмный стиль, расписание тренировок, тарифные планы.",
    tags: ["React", "Framer Motion", "Dark Theme"],
    image: fitnessHeroImg,
    demoUrl: "/demo/fitness",
    badgeType: "concept" as const,
  },
  {
    id: 4,
    title: "NATURA",
    description: "Концепт интернет-магазина косметики. Минималистичный дизайн, каталог товаров, избранное и корзина.",
    tags: ["React", "E-commerce", "Minimalist"],
    image: cosmeticsHeroImg,
    demoUrl: "/demo/cosmetics",
    badgeType: "concept" as const,
  },
  {
    id: 5,
    title: "STREETWEAR",
    description: "Концепт магазина российского стритвира. Тёмная тема, категории, бренды, корзина.",
    tags: ["React", "E-commerce", "Dark Theme"],
    image: streetwearHeroImg,
    demoUrl: "/demo/streetwear",
    badgeType: "concept" as const,
  },
  {
    id: 6,
    title: "SOCKSTYLE",
    description: "Концепт магазина стильных мужских носков. Подарочные наборы, носки с надписями, спортивные.",
    tags: ["React", "E-commerce", "Light Theme"],
    image: socksHeroImg,
    demoUrl: "/demo/socks",
    badgeType: "concept" as const,
  },
  {
    id: 7,
    title: "ДримТур",
    description: "Концепт сайта туристического агентства. Популярные направления, горячие туры, бронирование.",
    tags: ["React", "Travel", "Booking"],
    image: travelHeroImg,
    demoUrl: "/demo/travel",
    badgeType: "concept" as const,
  },
  {
    id: 8,
    title: "SHARP",
    description: "Концепт сайта барбершопа. Услуги, мастера, онлайн-запись, галерея работ.",
    tags: ["React", "Booking", "Dark Theme"],
    image: barberHeroImg,
    demoUrl: "/demo/barber",
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
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
            Портфолио
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Наши работы
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Примеры сайтов, которые мы создаём. Кликните на любой проект, чтобы посмотреть демо.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="group cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-purple-500/30 transition-all duration-300 hover-elevate"
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
                    <Badge 
                      className={`text-xs ${
                        item.badgeType === "live" 
                          ? "bg-green-500/90 text-white border-0" 
                          : "bg-purple-500/90 text-white border-0"
                      }`}
                    >
                      {item.badgeType === "live" ? "Live" : "Концепт"}
                    </Badge>
                  </div>
                  {item.externalUrl && (
                    <div className="absolute top-4 left-4">
                      <ExternalLink className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs bg-secondary/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-secondary/50">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
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
