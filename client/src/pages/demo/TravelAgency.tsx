import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Calendar, Star, Users, Sun, Palmtree, Mountain, Ship, ArrowLeft, Clock, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useAggregateRatingSchema } from "@/lib/useAggregateRatingSchema";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import travelHeroImg from "@assets/generated_images/tropical_beach_travel_destination.webp";
import maldivesImg from "@assets/generated_images/maldives_beach_paradise_resort.webp";
import parisImg from "@assets/generated_images/paris_eiffel_tower_sunset.webp";
import baliImg from "@assets/generated_images/bali_rice_terraces_tropical.webp";
import dubaiImg from "@assets/generated_images/dubai_skyline_night_burj.webp";
import santoriniImg from "@assets/generated_images/santorini_greece_blue_domes.webp";
import tokyoImg from "@assets/generated_images/tokyo_neon_cityscape_night.webp";

const destinations = [
  { 
    id: 1, 
    name: "Мальдивы", 
    country: "Мальдивы",
    image: maldivesImg,
    price: 185000, 
    duration: "7 ночей",
    rating: 4.9,
    reviews: 234,
    tag: "Пляжный отдых"
  },
  { 
    id: 2, 
    name: "Париж", 
    country: "Франция",
    image: parisImg,
    price: 95000, 
    duration: "5 ночей",
    rating: 4.8,
    reviews: 512,
    tag: "Романтика"
  },
  { 
    id: 3, 
    name: "Бали", 
    country: "Индонезия",
    image: baliImg,
    price: 125000, 
    duration: "10 ночей",
    rating: 4.7,
    reviews: 389,
    tag: "Экзотика"
  },
  { 
    id: 4, 
    name: "Дубай", 
    country: "ОАЭ",
    image: dubaiImg,
    price: 145000, 
    duration: "7 ночей",
    rating: 4.8,
    reviews: 456,
    tag: "Люкс"
  },
  { 
    id: 5, 
    name: "Санторини", 
    country: "Греция",
    image: santoriniImg,
    price: 110000, 
    duration: "6 ночей",
    rating: 4.9,
    reviews: 278,
    tag: "Острова"
  },
  { 
    id: 6, 
    name: "Токио", 
    country: "Япония",
    image: tokyoImg,
    price: 175000, 
    duration: "8 ночей",
    rating: 4.8,
    reviews: 321,
    tag: "Культура"
  },
];

const categories = [
  { icon: Sun, name: "Пляжный отдых", count: 124 },
  { icon: Mountain, name: "Горы", count: 56 },
  { icon: Ship, name: "Круизы", count: 32 },
  { icon: Palmtree, name: "Экзотика", count: 78 },
];

const stats = [
  { value: "15+", label: "Лет опыта" },
  { value: "50K+", label: "Довольных клиентов" },
  { value: "100+", label: "Направлений" },
  { value: "24/7", label: "Поддержка" },
];

export default function TravelAgency() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<typeof destinations[0] | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", email: "" });
  const [consultPhone, setConsultPhone] = useState("");
  const { toast } = useToast();
  const destinationsRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "WayToTravel — Туристическое агентство | Туры по миру",
    description: "Подберём идеальный тур для вас. Мальдивы, Париж, Бали, Дубай, Санторини. 15+ лет опыта, 50K+ довольных клиентов. Консультация и бронирование онлайн.",
    keywords: "туризм, туры, путешествия, агентство, Мальдивы, Бали, Дубай, горячие туры",
    ogTitle: "WayToTravel — Туристическое агентство | Дизайн от MP.WebStudio",
    ogDescription: "Незабываемые путешествия по всему миру. Консультация и бронирование онлайн",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/travel",
    canonical: "https://mp-webstudio.ru/demo/travel"
  });

  const avgDestRating = (destinations.reduce((sum, d) => sum + d.rating, 0) / destinations.length).toFixed(1);
  const totalDestReviews = destinations.reduce((sum, d) => sum + d.reviews, 0);

  useAggregateRatingSchema({
    name: "WayToTravel Туристическое агентство",
    description: "Туристическое агентство с опытом 15+ лет и 50K+ довольных клиентов",
    data: {
      ratingValue: parseFloat(avgDestRating),
      ratingCount: totalDestReviews
    }
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "WayToTravel", url: "https://mp-webstudio.ru/demo/travel" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(x => x !== id));
    } else {
      setFavorites(prev => [...prev, id]);
      const dest = destinations.find(d => d.id === id);
      toast({
        title: "Добавлено в избранное",
        description: dest?.name,
      });
    }
  };

  const openBooking = (dest: typeof destinations[0]) => {
    setSelectedDestination(dest);
    setBookingOpen(true);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingOpen(false);
      setBookingSuccess(false);
      setSelectedDestination(null);
      setBookingForm({ name: "", phone: "", email: "" });
    }, 2000);
  };

  const handleConsultation = () => {
    if (!consultPhone) return;
    toast({ title: "Заявка принята!", description: "Менеджер свяжется с вами в ближайшее время" });
    setConsultPhone("");
  };

  const scrollToDestinations = () => destinationsRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToCategories = () => categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {favorites.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge className="bg-sky-500 text-white border-0 px-4 py-2 text-sm shadow-lg">
            <Heart className="w-4 h-4 mr-2 inline fill-current" />
            В избранном: {favorites.length}
          </Badge>
        </div>
      )}

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-sky-500" />
              Заявка на тур
            </DialogTitle>
          </DialogHeader>
          
          {bookingSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Заявка отправлена!</h3>
              <p className="text-muted-foreground">Менеджер свяжется с вами в ближайшее время</p>
            </div>
          ) : (
            <>
              {selectedDestination && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                  <img src={selectedDestination.image} alt={selectedDestination.name} className="w-16 h-12 rounded object-cover" />
                  <div>
                    <p className="font-semibold">{selectedDestination.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedDestination.duration} | от {formatPrice(selectedDestination.price)} р</p>
                  </div>
                </div>
              )}
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <Label htmlFor="book-name">Ваше имя</Label>
                  <Input 
                    id="book-name"
                    value={bookingForm.name} 
                    onChange={(e) => setBookingForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Иван Иванов"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="book-phone">Телефон</Label>
                  <Input 
                    id="book-phone"
                    type="tel"
                    value={bookingForm.phone} 
                    onChange={(e) => setBookingForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="book-email">Email</Label>
                  <Input 
                    id="book-email"
                    type="email"
                    value={bookingForm.email} 
                    onChange={(e) => setBookingForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="ivan@mail.ru"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-teal-500">
                  Отправить заявку
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <header className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-500 to-teal-500 pointer-events-none" />
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 pointer-events-none" style={{ backgroundImage: `url(${travelHeroImg})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
        
        <nav className="absolute top-0 left-0 right-0 z-50 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link href="/#portfolio">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/20 border border-white/30 hover:bg-white/30"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TravelDream</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <button onClick={scrollToDestinations} className="hover:text-white transition-colors cursor-pointer">Направления</button>
            <button onClick={scrollToCategories} className="hover:text-white transition-colors cursor-pointer">Категории</button>
            <button onClick={scrollToContact} className="hover:text-white transition-colors cursor-pointer">Контакты</button>
          </div>
          <Button className="bg-white text-sky-600 hover:bg-white/90" data-testid="button-consultation">
            Консультация
          </Button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Горящие туры со скидкой до 40%
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Открой мир
              <br />
              <span className="text-yellow-300">
                мечты
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Подберём идеальный тур для вашего незабываемого отпуска. Более 100 направлений по всему миру.
            </p>

            <Card className="max-w-3xl mx-auto p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-0 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="Куда хотите поехать?" 
                    className="pl-10 h-12 border-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-destination"
                  />
                </div>
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    type="date" 
                    className="pl-10 h-12 border-slate-200"
                    data-testid="input-date"
                  />
                </div>
                <Button className="h-12 px-8 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600" onClick={scrollToDestinations} data-testid="button-search">
                  Найти туры
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 h-32" />
      </header>

      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={categoriesRef} id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Выберите тип отдыха</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Подберём идеальное направление под ваши предпочтения
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 text-center hover-elevate cursor-pointer group" data-testid={`card-category-${i}`}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100 dark:from-sky-900/30 dark:to-teal-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <cat.icon className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h3 className="font-semibold mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count} туров</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={destinationsRef} id="destinations" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Популярные направления</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Лучшие предложения по проверенным направлениям
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden group hover-elevate" data-testid={`card-destination-${dest.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={dest.image} 
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-white/90 text-slate-800 border-0">
                      {dest.tag}
                    </Badge>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={`absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/40 ${favorites.includes(dest.id) ? 'text-red-500' : 'text-white'}`}
                      onClick={() => toggleFavorite(dest.id)}
                      data-testid={`button-favorite-${dest.id}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(dest.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{dest.name}</h3>
                      <p className="text-sm text-white/80 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {dest.country}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{dest.rating}</span>
                        <span className="text-muted-foreground">({dest.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {dest.duration}
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">от</p>
                        <p className="text-2xl font-bold text-sky-600">{formatPrice(dest.price)} ₽</p>
                      </div>
                      <Button className="bg-gradient-to-r from-sky-500 to-teal-500" onClick={() => openBooking(dest)} data-testid={`button-book-${dest.id}`}>
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-sky-500 to-teal-500">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы к путешествию?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Оставьте заявку и наш менеджер подберёт идеальный тур специально для вас
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Input 
                placeholder="Ваш телефон" 
                value={consultPhone}
                onChange={(e) => setConsultPhone(e.target.value)}
                className="h-12 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                data-testid="input-phone"
              />
              <Button className="h-12 px-8 bg-white text-sky-600 hover:bg-white/90" onClick={handleConsultation} data-testid="button-request">
                Получить консультацию
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer ref={contactRef} id="contact" className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TravelDream</span>
              </div>
              <p className="text-sm text-slate-400">
                Ваш надёжный партнёр в мире путешествий с 2009 года
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Направления</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Пляжный отдых</li>
                <li>Экскурсионные туры</li>
                <li>Горнолыжные курорты</li>
                <li>Круизы</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>О нас</li>
                <li>Отзывы</li>
                <li>Вакансии</li>
                <li>Контакты</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="tel:+74951234567" className="hover:text-sky-400 transition-colors">+7 (495) 123-45-67</a></li>
                <li>info@traveldream.ru</li>
                <li>Москва, ул. Тверская, 1</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>Демо-сайт создан в <a href="https://mp-webstudio.ru" className="text-sky-400 hover:underline">MP.WebStudio</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
