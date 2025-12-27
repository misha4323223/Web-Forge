import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Scissors, Clock, MapPin, Phone, Star, Calendar, User, Check, ArrowLeft, Instagram, X, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import { useAggregateRatingSchema } from "@/lib/useAggregateRatingSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}
import barberHeroImg from "@assets/generated_images/stylish_barbershop_interior.webp";
import alexeyImg from "@assets/generated_images/russian_barber_alexey_portrait.webp";
import dmitryImg from "@assets/generated_images/russian_barber_dmitry_portrait.webp";
import maximImg from "@assets/generated_images/russian_barber_maxim_portrait.webp";
import galleryImg1 from "@assets/generated_images/modern_undercut_fade_haircut.webp";
import galleryImg2 from "@assets/generated_images/professional_beard_styling_result.webp";
import galleryImg3 from "@assets/generated_images/classic_gentleman_side_part.webp";
import galleryImg4 from "@assets/generated_images/trendy_textured_crop_fade.webp";
import pomadeImg from "@assets/generated_images/premium_hair_pomade_product_photography.png";
import beardOilImg from "@assets/generated_images/luxury_beard_oil_product_photography.png";
import shampooImg from "@assets/generated_images/premium_beard_shampoo_product_photography.png";

const products = [
  {
    id: 1,
    name: "Помада для укладки",
    brand: "Kings Grooming",
    price: 1800,
    image: pomadeImg,
    description: "Сильная фиксация, матовый финиш"
  },
  {
    id: 2,
    name: "Масло для бороды",
    brand: "Kings Grooming",
    price: 1200,
    image: beardOilImg,
    description: "Питает и смягчает даже самую жесткую бороду"
  },
  {
    id: 3,
    name: "Шампунь для бороды",
    brand: "Kings Grooming",
    price: 1500,
    image: shampooImg,
    description: "Глубокое очищение и свежесть"
  }
];

const services = [
  { id: 1, name: "Мужская стрижка", duration: "45 мин", price: 1500, icon: Scissors },
  { id: 2, name: "Стрижка машинкой", duration: "30 мин", price: 1000, icon: Scissors },
  { id: 3, name: "Моделирование бороды", duration: "30 мин", price: 1200, icon: Scissors },
  { id: 4, name: "Королевское бритьё", duration: "40 мин", price: 1800, icon: Scissors },
  { id: 5, name: "Стрижка + борода", duration: "60 мин", price: 2500, popular: true, icon: Scissors },
  { id: 6, name: "Детская стрижка", duration: "30 мин", price: 800, icon: Scissors },
];

const barbers = [
  { 
    id: 1, 
    name: "Алексей", 
    role: "Старший барбер", 
    experience: "8 лет",
    image: alexeyImg,
    rating: 4.9,
    reviews: 234
  },
  { 
    id: 2, 
    name: "Дмитрий", 
    role: "Барбер", 
    experience: "5 лет",
    image: dmitryImg,
    rating: 4.8,
    reviews: 156
  },
  { 
    id: 3, 
    name: "Максим", 
    role: "Барбер", 
    experience: "3 года",
    image: maximImg,
    rating: 4.7,
    reviews: 89
  },
];

const timeSlots = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const gallery = [
  galleryImg1,
  galleryImg2,
  galleryImg3,
  galleryImg4,
];

export default function BarberShop() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();
  
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} теперь в вашей корзине`,
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter((item): item is CartItem => item !== null));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const servicesRef = useRef<HTMLElement>(null);
  const barbersRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "KingsCut — Барбершоп в Туле | Мужские стрижки и борода",
    description: "Профессиональная барбершоп с 3 мастерами. Мужские стрижки, королевское бритьё, моделирование бороды. Запись онлайн, опытные барберы.",
    keywords: "барбершоп, мужские стрижки, борода, укладка волос, барбер Тула, стрижка машинкой",
    ogTitle: "KingsCut — Барбершоп | Дизайн от MP.WebStudio",
    ogDescription: "Профессиональные барберы, качественное обслуживание, современный дизайн",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/barber",
    canonical: "https://mp-webstudio.ru/demo/barber"
  });

  const avgRating = (barbers.reduce((sum, b) => sum + b.rating, 0) / barbers.length).toFixed(1);
  const totalReviews = barbers.reduce((sum, b) => sum + b.reviews, 0);

  useAggregateRatingSchema({
    name: "KingsCut Барбершоп",
    description: "Профессиональная барбершоп с опытными мастерами",
    data: {
      ratingValue: parseFloat(avgRating),
      ratingCount: totalReviews
    }
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "KingsCut", url: "https://mp-webstudio.ru/demo/barber" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToServices = () => servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToBarbers = () => barbersRef.current?.scrollIntoView({ behavior: "smooth" });
  const shopRef = useRef<HTMLElement>(null);
  const scrollToShop = () => shopRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleServiceSelect = (id: number) => {
    setSelectedService(id);
    setStep(2);
    toast({
      title: "Услуга выбрана",
      description: services.find(s => s.id === id)?.name,
    });
  };

  const handleBarberSelect = (id: number) => {
    setSelectedBarber(id);
    setStep(3);
    toast({
      title: "Мастер выбран",
      description: barbers.find(b => b.id === id)?.name,
    });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    toast({
      title: "Время выбрано",
      description: `${selectedDate} в ${time}`,
    });
  };

  const handleBook = () => {
    if (selectedService && selectedBarber && selectedTime && selectedDate) {
      toast({
        title: "Вы записаны!",
        description: `${services.find(s => s.id === selectedService)?.name} у ${barbers.find(b => b.id === selectedBarber)?.name}`,
      });
      setStep(1);
      setSelectedService(null);
      setSelectedBarber(null);
      setSelectedTime(null);
      setSelectedDate("");
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/#portfolio">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-wider">BLADE</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-300">
            <button onClick={scrollToServices} className="hover:text-amber-400 transition-colors cursor-pointer">Услуги</button>
            <button onClick={scrollToBarbers} className="hover:text-amber-400 transition-colors cursor-pointer">Мастера</button>
            <button onClick={scrollToShop} className="hover:text-amber-400 transition-colors cursor-pointer">Магазин</button>
            <button onClick={scrollToBooking} className="hover:text-amber-400 transition-colors cursor-pointer">Запись</button>
            <button onClick={scrollToContact} className="hover:text-amber-400 transition-colors cursor-pointer">Контакты</button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-neutral-300 hover:text-amber-400"
              onClick={() => setIsCartOpen(true)}
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" data-testid="button-book-header" onClick={scrollToBooking}>
              Записаться
            </Button>
          </div>
        </div>
      </header>

      <div className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-neutral-950 to-neutral-950 pointer-events-none" />
        <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: `url(${barberHeroImg})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30">
              Премиум барбершоп
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Стиль — это
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                искусство
              </span>
            </h1>
            <p className="text-xl text-neutral-400 mb-8 max-w-lg">
              Мужская парикмахерская с атмосферой и вниманием к деталям. Только лучшие мастера.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" data-testid="button-book-hero">
                <Calendar className="w-5 h-5 mr-2" />
                Записаться онлайн
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-700 text-white hover:bg-white/10" data-testid="button-prices">
                Посмотреть цены
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-400">10:00 - 22:00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-400">ул. Пушкина, 15</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <a href="tel:+79991234567" className="text-neutral-400 hover:text-amber-400 transition-colors">+7 (999) 123-45-67</a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <section ref={servicesRef} id="services" className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши услуги</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Профессиональный уход за волосами и бородой
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className={`p-6 bg-neutral-800/50 border-neutral-700 hover-elevate cursor-pointer transition-all ${selectedService === service.id ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => handleServiceSelect(service.id)}
                  data-testid={`card-service-${service.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-amber-400" />
                    </div>
                    {service.popular && (
                      <Badge className="bg-amber-500 text-black border-0">Хит</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{service.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-amber-400">{formatPrice(service.price)} ₽</span>
                    <Button size="sm" className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" data-testid={`button-select-service-${service.id}`}>
                      Выбрать
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={barbersRef} id="barbers" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши мастера</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Профессионалы своего дела с многолетним опытом
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {barbers.map((barber, i) => (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden bg-neutral-800/50 border-neutral-700 hover-elevate cursor-pointer ${selectedBarber === barber.id ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => handleBarberSelect(barber.id)}
                  data-testid={`card-barber-${barber.id}`}
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src={barber.image} 
                      alt={barber.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold mb-1">{barber.name}</h3>
                      <p className="text-amber-400 text-sm mb-2">{barber.role}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-neutral-300">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {barber.rating}
                        </span>
                        <span className="text-neutral-400">{barber.reviews} отзывов</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Опыт: {barber.experience}</span>
                      <Button size="sm" className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" data-testid={`button-select-barber-${barber.id}`}>
                        Выбрать
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={shopRef} id="shop" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Магазин косметики</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Профессиональные средства для ухода, которые мы используем в работе
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden bg-neutral-800/50 border-neutral-700 hover-elevate group">
                  <div className="aspect-square relative overflow-hidden bg-neutral-900">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
                        <h3 className="text-xl font-bold">{product.name}</h3>
                      </div>
                    </div>
                    <p className="text-neutral-400 text-sm mb-6 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{product.price} ₽</span>
                      <Button 
                        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Купить
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={bookingRef} id="booking" className="py-20 bg-neutral-900">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Онлайн-запись</h2>
            <p className="text-neutral-400">
              Выберите услугу, мастера и удобное время
            </p>
          </motion.div>

          <Card className="p-8 bg-neutral-800/50 border-neutral-700">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-amber-500 text-black' : 'bg-neutral-700'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <div className="flex-1 h-1 bg-neutral-700 rounded">
                <div className={`h-full bg-amber-500 rounded transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-amber-500 text-black' : 'bg-neutral-700'}`}>
                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <div className="flex-1 h-1 bg-neutral-700 rounded">
                <div className={`h-full bg-amber-500 rounded transition-all ${step > 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-amber-500 text-black' : 'bg-neutral-700'}`}>
                3
              </div>
            </div>

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Выберите дату</label>
                  <Input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-neutral-700 border-neutral-600 text-white"
                    data-testid="input-date"
                  />
                </div>
                {selectedDate && (
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Выберите время</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={selectedTime === time ? 'bg-amber-500 text-black' : 'border-neutral-600 text-white hover:bg-neutral-700'}
                          onClick={() => handleTimeSelect(time)}
                          data-testid={`button-time-${time}`}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedService && selectedBarber && selectedTime && selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-neutral-700/50 rounded-lg"
              >
                <h4 className="font-semibold mb-3">Ваша запись:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    <span>{services.find(s => s.id === selectedService)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>{barbers.find(b => b.id === selectedBarber)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-400">
                    {formatPrice(services.find(s => s.id === selectedService)?.price || 0)} ₽
                  </span>
                  <Button 
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                    onClick={handleBook}
                    data-testid="button-confirm-booking"
                  >
                    Подтвердить запись
                  </Button>
                </div>
              </motion.div>
            )}

            {step < 3 && (
              <p className="text-center text-neutral-400 mt-8">
                {step === 1 ? 'Выберите услугу выше' : 'Выберите мастера выше'}
              </p>
            )}
          </Card>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши работы</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-square overflow-hidden rounded-lg"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer ref={contactRef} id="contact" className="py-12 bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-wider">BLADE</span>
              </div>
              <p className="text-sm text-neutral-400">
                Премиум барбершоп для настоящих мужчин
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-amber-400">Услуги</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>Мужские стрижки</li>
                <li>Моделирование бороды</li>
                <li>Королевское бритьё</li>
                <li>Магазин косметики</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-amber-400">Часы работы</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>Пн-Пт: 10:00 - 22:00</li>
                <li>Сб: 10:00 - 20:00</li>
                <li>Вс: 11:00 - 18:00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-amber-400">Контакты</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+79991234567" className="hover:text-amber-400 transition-colors">+7 (999) 123-45-67</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  ул. Пушкина, 15
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  @blade_barbershop
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
            <p>Демо-сайт создан в <a href="https://mp-webstudio.ru" className="text-amber-400 hover:underline">MP.WebStudio</a></p>
          </div>
        </div>
      </footer>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Корзина
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                Корзина пуста
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{item.name}</h4>
                        <p className="text-amber-400 text-sm font-bold">{item.price} ₽</p>
                      </div>
                      <div className="flex items-center gap-2 bg-neutral-900 rounded-md p-1 border border-neutral-700">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-neutral-400 hover:text-white"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-neutral-400 hover:text-white"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-neutral-400">Итого:</span>
                    <span className="text-2xl font-bold text-amber-400">{cartTotal} ₽</span>
                  </div>
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-12"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Оформить заказ
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Success Dialog (Demo) */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white text-center p-12">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-500/10">
            <Check className="w-10 h-10" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-4">Заказ принят!</DialogTitle>
          </DialogHeader>
          <div className="text-neutral-400 space-y-4 mb-8">
            <p>Это демонстрация процесса покупки. В реальном магазине клиент был бы перенаправлен на страницу оплаты через защищенный шлюз.</p>
            <p className="text-sm border-l-2 border-amber-500 pl-4 italic text-left">
              Интеграция MP.WebStudio включает автоматическую отправку уведомлений в Telegram владельцу и Email-подтверждение клиенту.
            </p>
          </div>
          <Button 
            className="w-full bg-white text-black hover:bg-neutral-200"
            onClick={() => {
              setIsCheckoutOpen(false);
              setCart([]);
            }}
          >
            Понятно
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
