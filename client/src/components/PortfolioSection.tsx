import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X } from "lucide-react";
import { useLocation } from "wouter";

import sweetDelightsImg from "@assets/image_1765623150824.webp";
import socksHeroImg from "@assets/generated_images/socks_collection_hero_image.webp";
import travelHeroImg from "@assets/generated_images/tropical_beach_travel_destination.webp";
import barberHeroImg from "@assets/generated_images/stylish_barbershop_interior.webp";
import foodHeroImg from "@assets/generated_images/asian_food_arrangement_table.png";
import fitnessHeroImg from "@assets/generated_images/modern_gym_interior_purple.png";
import cosmeticsHeroImg from "@assets/stock_images/cosmetics_skincare_p_2775c0e7.webp";
import streetwearHeroImg from "@assets/generated_images/streetwear_hero_banner_dark.png";
import dentalHeroImg from "@assets/generated_images/dental_clinic_modern_reception.png";
import renovationHeroImg from "@assets/generated_images/modern_living_room_renovation.png";

const portfolioItems = [
  {
    id: 1,
    title: "Сладкие наслаждения",
    subtitle: "Интернет-магазин сладостей",
    description: "Интернет-магазин сладостей с админкой, Telegram-приложением, оплатой Robokassa и хранением в Яндекс Cloud.",
    tags: ["React", "Node.js", "PostgreSQL", "Robokassa", "Telegram"],
    image: sweetDelightsImg,
    externalUrl: "https://sweetdelights.store/",
    badgeType: "live" as const,
    category: "E-commerce",
  },
  {
    id: 2,
    title: "Вкусдом",
    subtitle: "Доставка еды",
    description: "Концепт лендинга для доставки азиатской еды. Яркий дизайн, анимированное меню, корзина заказа.",
    tags: ["React", "Framer Motion", "Tailwind"],
    image: foodHeroImg,
    demoUrl: "/demo/food-delivery",
    badgeType: "concept" as const,
    category: "Food",
  },
  {
    id: 3,
    title: "Фитнес клуб",
    subtitle: "Фитнес-студия",
    description: "Концепт сайта фитнес-студии. Тёмный стиль, расписание тренировок, тарифные планы.",
    tags: ["React", "Framer Motion", "Dark Theme"],
    image: fitnessHeroImg,
    demoUrl: "/demo/fitness",
    badgeType: "concept" as const,
    category: "Dark Theme",
  },
  {
    id: 4,
    title: "Natura",
    subtitle: "Интернет-магазин косметики",
    description: "Концепт интернет-магазина косметики. Минималистичный дизайн, каталог товаров, избранное и корзина.",
    tags: ["React", "E-commerce", "Minimalist"],
    image: cosmeticsHeroImg,
    demoUrl: "/demo/cosmetics",
    badgeType: "concept" as const,
    category: "E-commerce",
  },
  {
    id: 5,
    title: "Streetwear",
    subtitle: "Интернет-магазин одежды",
    description: "Концепт магазина российского стритвира. Тёмная тема, категории, бренды, корзина.",
    tags: ["React", "E-commerce", "Dark Theme"],
    image: streetwearHeroImg,
    demoUrl: "/demo/streetwear",
    badgeType: "concept" as const,
    category: "E-commerce",
  },
  {
    id: 6,
    title: "Sockstyle",
    subtitle: "Интернет-магазин носков",
    description: "Концепт магазина стильных мужских носков. Подарочные наборы, носки с надписями, спортивные.",
    tags: ["React", "E-commerce", "Light Theme"],
    image: socksHeroImg,
    demoUrl: "/demo/socks",
    badgeType: "concept" as const,
    category: "E-commerce",
  },
  {
    id: 7,
    title: "Дримтур",
    subtitle: "Туристическое агентство",
    description: "Концепт сайта туристического агентства. Популярные направления, горячие туры, бронирование.",
    tags: ["React", "Travel", "Booking"],
    image: travelHeroImg,
    demoUrl: "/demo/travel",
    badgeType: "concept" as const,
    category: "Booking",
  },
  {
    id: 8,
    title: "Barbershop",
    subtitle: "Барбершоп",
    description: "Концепт сайта барбершопа. Услуги, мастера, онлайн-запись, галерея работ.",
    tags: ["React", "Booking", "Dark Theme"],
    image: barberHeroImg,
    demoUrl: "/demo/barber",
    badgeType: "concept" as const,
    category: "Booking",
  },
  {
    id: 9,
    title: "Дентапро",
    subtitle: "Стоматологическая клиника",
    description: "Концепт сайта стоматологической клиники. Услуги, врачи, онлайн-запись, акции.",
    tags: ["React", "Medical", "Light Theme"],
    image: dentalHeroImg,
    demoUrl: "/demo/dental",
    badgeType: "concept" as const,
    category: "Medical",
  },
  {
    id: 10,
    title: "Ремонтмастер",
    subtitle: "Ремонт квартир",
    description: "Концепт сайта ремонта квартир. Портфолио работ, калькулятор стоимости, этапы работ.",
    tags: ["React", "Services", "Calculator"],
    image: renovationHeroImg,
    demoUrl: "/demo/renovation",
    badgeType: "concept" as const,
    category: "Services",
  },
];

// Позиции звёзд в созвездии (в процентах)
const starPositions = [
  { x: 50, y: 15 },   // 1 - центр верх
  { x: 20, y: 25 },   // 2 - левый верх
  { x: 80, y: 20 },   // 3 - правый верх
  { x: 35, y: 45 },   // 4 - левый центр
  { x: 65, y: 40 },   // 5 - правый центр
  { x: 25, y: 60 },   // 6 - левый низ (сдвинут правее)
  { x: 50, y: 55 },   // 7 - центр
  { x: 80, y: 55 },   // 8 - правый (сдвинут левее)
  { x: 30, y: 75 },   // 9 - левый низ
  { x: 70, y: 80 },   // 10 - правый низ
];

// Связи между проектами по категориям
const connections: [number, number][] = [
  [0, 3], [0, 4], [0, 5], // E-commerce связи (Сладкие наслаждения, Natura, Streetwear, Sockstyle)
  [3, 4], [3, 5], [4, 5],
  [2, 4], [2, 7], // Dark Theme связи (Фитнес клуб, Streetwear, Barbershop)
  [6, 7], // Booking связи (Дримтур, Barbershop)
];

function Nebulae() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          left: "10%",
          top: "20%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{
          right: "5%",
          top: "40%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
        }}
      />
      <div 
        className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{
          left: "40%",
          bottom: "10%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

function ShootingStars() {
  const shootingStars = useMemo(() => 
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      startX: 10 + Math.random() * 30,
      startY: 5 + Math.random() * 20,
      duration: 2 + Math.random() * 2,
      delay: i * 4 + Math.random() * 3,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: [0, 300],
            y: [0, 200],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 8,
            ease: "easeOut",
          }}
        >
          <div 
            className="w-1 h-1 bg-white rounded-full"
            style={{
              boxShadow: "0 0 6px #fff, -20px 0 15px rgba(255,255,255,0.5), -40px 0 10px rgba(255,255,255,0.3), -60px 0 5px rgba(255,255,255,0.1)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function StarParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            opacity: [0.2, 0.9, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ConstellationLines({ hoveredId }: { hoveredId: number | null }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
          <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)" />
          <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
        </linearGradient>
        <linearGradient id="lineGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
          <stop offset="50%" stopColor="rgba(168, 85, 247, 1)" />
          <stop offset="100%" stopColor="rgba(168, 85, 247, 0.5)" />
        </linearGradient>
      </defs>
      {connections.map(([from, to], index) => {
        const isActive = hoveredId !== null && (from === hoveredId || to === hoveredId);
        return (
          <motion.line
            key={index}
            x1={`${starPositions[from].x}%`}
            y1={`${starPositions[from].y}%`}
            x2={`${starPositions[to].x}%`}
            y2={`${starPositions[to].y}%`}
            stroke={isActive ? "url(#lineGradientActive)" : "url(#lineGradient)"}
            strokeWidth={isActive ? 2 : 1}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: isActive ? 1 : 0.4 }}
            transition={{ duration: 1.5, delay: index * 0.1 }}
          />
        );
      })}
    </svg>
  );
}

function StarNode({ 
  item, 
  position, 
  index,
  isHovered,
  onHover,
  onClick,
}: { 
  item: typeof portfolioItems[0];
  position: { x: number; y: number };
  index: number;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onClick: () => void;
}) {
  const starSize = item.badgeType === "live" ? 20 : 14;
  const glowColor = item.badgeType === "live" ? "rgba(34, 197, 94, 0.6)" : "rgba(168, 85, 247, 0.6)";
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isHovered ? 50 : 10,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      data-testid={`star-${item.id}`}
    >
      {/* Пульсирующее свечение */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: starSize * 3,
          height: starSize * 3,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Ядро звезды */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: starSize,
          height: starSize,
          background: item.badgeType === "live" 
            ? "radial-gradient(circle, #22c55e 0%, #16a34a 100%)"
            : "radial-gradient(circle, #a855f7 0%, #7c3aed 100%)",
          boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
        }}
        whileHover={{ scale: 1.5 }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      {/* Подпись под звездой */}
      <div 
        className="absolute whitespace-nowrap pointer-events-none text-center"
        style={{
          top: starSize + 10,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <p className="text-[10px] md:text-xs text-purple-300/80 font-medium">
          {item.subtitle}
        </p>
      </div>

      {/* Превью при наведении */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ 
              top: position.y > 70 ? "auto" : starSize + 15,
              bottom: position.y > 70 ? starSize + 15 : "auto",
              right: position.x >= 50 ? 0 : "auto",
              left: position.x < 50 ? 0 : "auto",
              zIndex: 100,
            }}
            initial={{ opacity: 0, y: position.y > 70 ? 10 : -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position.y > 70 ? 10 : -10, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="relative w-44 rounded-lg overflow-hidden shadow-2xl border border-white/20 bg-black/50 backdrop-blur-sm">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-24 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-[10px] text-white/70">{item.subtitle}</p>
                <p className="text-xs font-semibold text-white truncate">{item.title}</p>
              </div>
              {item.badgeType === "live" && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProjectCard({ 
  item, 
  onClose,
  onNavigate,
}: { 
  item: typeof portfolioItems[0];
  onClose: () => void;
  onNavigate: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md"
      >
        <Card className="overflow-hidden bg-card/95 backdrop-blur-md border-purple-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            data-testid="button-close-card"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="h-56 relative overflow-hidden">
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            <div className="absolute top-4 left-4">
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
              <div className="absolute top-4 right-14">
                <ExternalLink className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
          
          <div className="p-6">
            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
            <p className="text-muted-foreground mb-4">{item.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <motion.button
              className="w-full py-3 px-4 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigate}
              data-testid="button-view-project"
            >
              {item.externalUrl ? "Открыть сайт" : "Смотреть демо"}
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function PortfolioSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [, setLocation] = useLocation();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);

  const handleItemClick = (item: typeof portfolioItems[0]) => {
    setSelectedItem(item);
  };

  const handleNavigate = () => {
    if (selectedItem) {
      if (selectedItem.externalUrl) {
        window.open(selectedItem.externalUrl, "_blank", "noopener,noreferrer");
      } else if (selectedItem.demoUrl) {
        setLocation(selectedItem.demoUrl);
      }
      setSelectedItem(null);
    }
  };

  return (
    <section id="portfolio" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
            Портфолио
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Созвездие проектов
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Наведите на звезду, чтобы увидеть проект. Линии соединяют похожие проекты.
          </p>
        </motion.div>

        {/* Созвездие */}
        <div 
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ 
            height: "min(600px, 80vh)",
            background: "radial-gradient(ellipse at center, rgba(15, 10, 30, 0.95) 0%, rgba(5, 5, 15, 0.98) 100%)",
          }}
        >
          <Nebulae />
          <StarParticles />
          <ShootingStars />
          <ConstellationLines hoveredId={hoveredId} />
          
          {portfolioItems.map((item, index) => (
            <StarNode
              key={item.id}
              item={item}
              position={starPositions[index]}
              index={index}
              isHovered={hoveredId === index}
              onHover={setHoveredId}
              onClick={() => handleItemClick(item)}
            />
          ))}

          {/* Легенда */}
          <div className="absolute bottom-4 left-4 flex items-center gap-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span>Live проект</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              <span>Концепт</span>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно проекта */}
      <AnimatePresence>
        {selectedItem && (
          <ProjectCard
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
