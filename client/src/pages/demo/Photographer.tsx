import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Mail, Phone, MapPin, Instagram, ArrowLeft, Play, ExternalLink, X, Check, Send } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import photographerHeroImg from "@assets/generated_images/photographer_workspace_studio_aesthetic.webp";
import portraitWomanImg from "@assets/generated_images/professional_woman_portrait_photography.webp";
import weddingSunsetImg from "@assets/generated_images/romantic_wedding_couple_sunset.webp";
import watchProductImg from "@assets/generated_images/luxury_watch_product_photo.webp";
import portraitManImg from "@assets/generated_images/professional_businessman_portrait_photo.webp";
import weddingAisleImg from "@assets/generated_images/bride_walking_down_aisle.webp";
import perfumeProductImg from "@assets/generated_images/luxury_perfume_bottle_product.webp";
import photographerPortraitImg from "@assets/generated_images/russian_male_photographer_portrait.webp";

const portfolioImages = [
  { id: 1, category: "Портреты", src: portraitWomanImg },
  { id: 2, category: "Свадьбы", src: weddingSunsetImg },
  { id: 3, category: "Предметка", src: watchProductImg },
  { id: 4, category: "Портреты", src: portraitManImg },
  { id: 5, category: "Свадьбы", src: weddingAisleImg },
  { id: 6, category: "Предметка", src: perfumeProductImg },
];

const services = [
  { name: "Портретная съёмка", price: "от 5 000 ₽", duration: "1-2 часа" },
  { name: "Свадебная съёмка", price: "от 25 000 ₽", duration: "8-12 часов" },
  { name: "Предметная съёмка", price: "от 3 000 ₽", duration: "за 10 фото" },
  { name: "Видеосъёмка", price: "от 15 000 ₽", duration: "1 день" },
];

const categories = ["Все", "Портреты", "Свадьбы", "Предметка"];

export default function Photographer() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const { toast } = useToast();

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsOrderModalOpen(true);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrderModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  useDocumentMeta({
    title: "Андрей Соколов — Фотограф в Туле | Свадьбы, портреты, предметка",
    description: "Профессиональная фотография: свадьбы, портреты, предметная съёмка, видеосъёмка. Создаю визуальные истории, которые остаются в памяти.",
    keywords: "фотограф, свадебная фотография, портреты, предметная съёмка, фото Тула, видеограф",
    ogTitle: "Андрей Соколов — Фотограф | Дизайн от MP.WebStudio",
    ogDescription: "Профессиональная фотосъёмка свадеб, портретов и предметов. Видеосъёмка и монтаж.",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/photographer",
    canonical: "https://mp-webstudio.ru/demo/photographer"
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "Андрей Соколов", url: "https://mp-webstudio.ru/demo/photographer" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredImages = activeCategory === "Все" 
    ? portfolioImages 
    : portfolioImages.filter(img => img.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Link href="/#portfolio" className="fixed top-4 left-4 z-[100]">
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-black/70 backdrop-blur-sm border border-white/20 hover:bg-black/90"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
      </Link>

      <header className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 pl-12">
            <Camera className="w-6 h-6 text-amber-400" />
            <span className="text-xl font-light tracking-wide">Андрей Соколов</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#portfolio" className="hover:text-white transition-colors">Портфолио</a>
            <a href="#services" className="hover:text-white transition-colors">Услуги</a>
            <a href="#about" className="hover:text-white transition-colors">Обо мне</a>
            <a href="#contact" className="hover:text-white transition-colors">Контакты</a>
          </nav>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black" onClick={() => setIsOrderModalOpen(true)}>
            Связаться
          </Button>
        </div>
      </header>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photographerHeroImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/40 to-neutral-950" />
        
        <motion.div 
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p 
            className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Фотограф и видеограф
          </motion.p>
          <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
            Андрей Соколов
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-xl mx-auto mb-8">
            Создаю визуальные истории, которые остаются в памяти навсегда
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black gap-2" onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
              <Camera className="w-5 h-5" />
              Смотреть работы
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 gap-2">
              <Play className="w-5 h-5" />
              Showreel
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      <section id="portfolio" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-amber-400 text-sm tracking-[0.2em] uppercase mb-2">Мои работы</p>
            <h2 className="text-4xl font-light">Портфолио</h2>
          </motion.div>

          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "bg-amber-500 text-black" : "text-neutral-400"}
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            layout
          >
            {filteredImages.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-[3/2] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setLightboxImage(img.src)}
                data-testid={`portfolio-image-${img.id}`}
              >
                <img 
                  src={img.src} 
                  alt={img.category}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-24 px-6 bg-neutral-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-amber-400 text-sm tracking-[0.2em] uppercase mb-2">Что я предлагаю</p>
            <h2 className="text-4xl font-light">Услуги</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleServiceClick(service.name)}
                className="cursor-pointer"
              >
                <Card className="bg-neutral-900/80 border-white/5 p-6 hover:border-amber-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-white group-hover:text-amber-400 transition-colors">{service.name}</h3>
                    <span className="text-amber-400 font-medium">{service.price}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-neutral-500 text-sm">{service.duration}</p>
                    <Button size="sm" variant="ghost" className="text-amber-400 h-8 px-2 group-hover:bg-amber-400/10">
                      Заказать
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img 
                  src={photographerPortraitImg}
                  alt="Андрей Соколов"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-amber-400 text-sm tracking-[0.2em] uppercase mb-2">Обо мне</p>
              <h2 className="text-4xl font-light mb-6">Привет, я Андрей</h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Профессиональный фотограф и видеограф с 8-летним опытом работы. 
                  Специализируюсь на портретной, свадебной и предметной съёмке.
                </p>
                <p>
                  Мой подход — найти уникальную историю в каждом кадре. 
                  Работаю с естественным светом и создаю атмосферные снимки, 
                  которые передают эмоции момента.
                </p>
                <p>
                  Снимал для журналов, брендов и частных клиентов по всей России.
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-light text-amber-400">500+</div>
                  <div className="text-sm text-neutral-500">Проектов</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-amber-400">8</div>
                  <div className="text-sm text-neutral-500">Лет опыта</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-amber-400">50+</div>
                  <div className="text-sm text-neutral-500">Свадеб</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-6 bg-neutral-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-amber-400 text-sm tracking-[0.2em] uppercase mb-2">Свяжитесь со мной</p>
            <h2 className="text-4xl font-light mb-8">Контакты</h2>
            
            <div className="space-y-4 mb-10">
              <a href="tel:+79001234567" className="flex items-center justify-center gap-3 text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-amber-400" />
                +7 (900) 123-45-67
              </a>
              <a href="mailto:photo@example.ru" className="flex items-center justify-center gap-3 text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-amber-400" />
                photo@example.ru
              </a>
              <div className="flex items-center justify-center gap-3 text-neutral-400">
                <MapPin className="w-5 h-5 text-amber-400" />
                Москва, Россия
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button size="icon" variant="outline" className="border-white/20 rounded-full">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black" onClick={() => setIsOrderModalOpen(true)}>
                Обсудить проект
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Андрей Соколов</span>
          </div>
          <p>Демо-концепт от MP.WebStudio</p>
        </div>
      </footer>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
            data-testid="lightbox-overlay"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-8 h-8" />
            </Button>
            <img 
              src={lightboxImage} 
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="bg-neutral-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Забронировать съёмку</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Оставьте заявку, и я свяжусь с вами в течение часа для обсуждения деталей.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrderSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Ваше имя</label>
              <Input placeholder="Иван" className="bg-neutral-800 border-white/10 text-white focus:border-amber-500/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Телефон</label>
              <Input placeholder="+7 (___) ___-__-__" className="bg-neutral-800 border-white/10 text-white focus:border-amber-500/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Услуга</label>
              <Input 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                placeholder="Выберите или введите услугу" 
                className="bg-neutral-800 border-white/10 text-white focus:border-amber-500/50" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Сообщение (необязательно)</label>
              <Textarea placeholder="Расскажите о вашей идее" className="bg-neutral-800 border-white/10 text-white focus:border-amber-500/50 min-h-[100px]" />
            </div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium h-12">
              Отправить заявку
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal (Demo) */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white text-center p-12">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-500/10">
            <Check className="w-10 h-10" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-light mb-4">Заявка отправлена!</DialogTitle>
          </DialogHeader>
          <div className="text-neutral-400 space-y-4 mb-8">
            <p>Это демонстрация работы формы. В реальном проекте:</p>
            <ul className="text-sm space-y-2 text-left bg-neutral-900/50 p-4 rounded-lg border border-white/5">
              <li className="flex items-start gap-2">
                <Send className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Данные мгновенно улетают в ваш Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Клиент получает подтверждение на Email</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Заявка сохраняется в CRM-панели</span>
              </li>
            </ul>
          </div>
          <Button 
            className="w-full bg-white text-black hover:bg-neutral-200"
            onClick={() => setIsSuccessModalOpen(false)}
          >
            Понятно
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
