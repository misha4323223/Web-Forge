import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, MapPin, Phone, Star, Calendar, User, Check, ArrowLeft, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import { useAggregateRatingSchema } from "@/lib/useAggregateRatingSchema";
import autoServiceHeroImg from "@/assets/generated_images/modern_auto_service_garage_workshop_interior.png";
import serviceImg1 from "@/assets/stock_images/car_maintenance_oil__4b172ef8.jpg";
import serviceImg2 from "@/assets/stock_images/car_maintenance_oil__4b172ef8.jpg";
import serviceImg3 from "@/assets/stock_images/car_maintenance_oil__4b172ef8.jpg";
import serviceImg4 from "@/assets/stock_images/brake_service_car_ma_a2d2851b.jpg";
import serviceImg5 from "@/assets/stock_images/vehicle_inspection_d_e60ea11c.jpg";
import serviceImg6 from "@/assets/stock_images/engine_repair_mechan_8ba73ef9.jpg";

const services = [
  { id: 1, name: "ТО 1 (5 000 км)", duration: "1.5 часа", price: 2500, icon: Wrench, image: serviceImg1 },
  { id: 2, name: "ТО 2 (15 000 км)", duration: "2.5 часа", price: 4500, icon: Wrench, image: serviceImg2 },
  { id: 3, name: "Замена масла", duration: "30 мин", price: 800, icon: Zap, image: serviceImg3 },
  { id: 4, name: "Замена тормозных колодок", duration: "1.5 часа", price: 3500, icon: Wrench, image: serviceImg4 },
  { id: 5, name: "Диагностика", duration: "1 час", price: 1500, popular: true, icon: Zap, image: serviceImg5 },
  { id: 6, name: "Полная переборка двигателя", duration: "8 часов", price: 25000, icon: Wrench, image: serviceImg6 },
];

const mechanics = [
  { 
    id: 1, 
    name: "Сергей Петров", 
    role: "Главный механик", 
    experience: "12 лет",
    rating: 4.9,
    reviews: 187
  },
  { 
    id: 2, 
    name: "Иван Иванов", 
    role: "Мастер по ходовой", 
    experience: "8 лет",
    rating: 4.8,
    reviews: 142
  },
  { 
    id: 3, 
    name: "Алексей Сидоров", 
    role: "Мастер по двигателям", 
    experience: "10 лет",
    rating: 4.9,
    reviews: 165
  },
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function AutoService() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedMechanic, setSelectedMechanic] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const servicesRef = useRef<HTMLElement>(null);
  const mechanicsRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "ТехноПро Сервис — Автосервис | Профессиональное обслуживание",
    description: "Автосервис с опытными механиками. Техническое обслуживание, ремонт, диагностика. Онлайн-запись, качественный сервис, современное оборудование.",
    keywords: "автосервис, техническое обслуживание, ремонт авто, диагностика, запись в автосервис",
    ogTitle: "ТехноПро Сервис — Автосервис | Дизайн от MP.WebStudio",
    ogDescription: "Профессиональный автосервис с опытной командой механиков",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/auto-service",
    canonical: "https://mp-webstudio.ru/demo/auto-service"
  });

  const avgRating = (mechanics.reduce((sum, m) => sum + m.rating, 0) / mechanics.length).toFixed(1);
  const totalReviews = mechanics.reduce((sum, m) => sum + m.reviews, 0);

  useAggregateRatingSchema({
    name: "ТехноПро Сервис",
    description: "Профессиональный автосервис с опытными механиками",
    data: {
      ratingValue: parseFloat(avgRating),
      ratingCount: totalReviews
    }
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "ТехноПро Сервис", url: "https://mp-webstudio.ru/demo/auto-service" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToServices = () => servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToMechanics = () => mechanicsRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleMechanicSelect = (id: number) => {
    setSelectedMechanic(id);
    setStep(3);
    toast({
      title: "Мастер выбран",
      description: mechanics.find(m => m.id === id)?.name,
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
    if (selectedService && selectedMechanic && selectedTime && selectedDate) {
      toast({
        title: "Вы записаны!",
        description: `${services.find(s => s.id === selectedService)?.name} у ${mechanics.find(m => m.id === selectedMechanic)?.name}`,
      });
      setStep(1);
      setSelectedService(null);
      setSelectedMechanic(null);
      setSelectedTime(null);
      setSelectedDate("");
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-neutral-950 to-neutral-950 pointer-events-none" />
        <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: `url(${autoServiceHeroImg})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />
        
        <nav className="absolute top-0 left-0 right-0 z-50 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link href="/#portfolio">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/10 border border-white/20 hover:bg-white/20"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider">ТЕХНОПРО</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-300">
            <button onClick={scrollToServices} className="hover:text-blue-400 transition-colors cursor-pointer">Услуги</button>
            <button onClick={scrollToMechanics} className="hover:text-blue-400 transition-colors cursor-pointer">Мастера</button>
            <button onClick={scrollToBooking} className="hover:text-blue-400 transition-colors cursor-pointer">Запись</button>
            <button onClick={scrollToContact} className="hover:text-blue-400 transition-colors cursor-pointer">Контакты</button>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-black font-semibold" data-testid="button-book-header">
            Записаться
          </Button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30">
              Профессиональный автосервис
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Ваш автомобиль — в
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                надёжных руках
              </span>
            </h1>
            <p className="text-xl text-neutral-400 mb-8 max-w-lg">
              Полное техническое обслуживание и ремонт автомобилей любых марок. Современное оборудование и опытные механики.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-black font-semibold" data-testid="button-book-hero">
                <Calendar className="w-5 h-5 mr-2" />
                Записаться онлайн
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-700 text-white hover:bg-white/10" data-testid="button-prices">
                Посмотреть цены
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-neutral-400">08:00 - 18:00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-neutral-400">ул. Автозаводская, 28</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+79991234567" className="text-neutral-400 hover:text-blue-400 transition-colors">+7 (999) 123-45-67</a>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

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
              Полный спектр услуг по диагностике, ремонту и техническому обслуживанию
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
                  className={`overflow-hidden bg-neutral-800/50 border-neutral-700 hover-elevate cursor-pointer transition-all ${selectedService === service.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleServiceSelect(service.id)}
                  data-testid={`card-service-${service.id}`}
                >
                  <div className="h-40 relative overflow-hidden bg-neutral-700">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                    {service.popular && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-500 text-black border-0">Популярно</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-white">{service.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-400">{formatPrice(service.price)} ₽</span>
                      <Button size="sm" className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" data-testid={`button-select-service-${service.id}`}>
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

      <section ref={mechanicsRef} id="mechanics" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши мастера</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Опытные специалисты, прошедшие обучение и сертификацию
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {mechanics.map((mechanic, i) => (
              <motion.div
                key={mechanic.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden bg-neutral-800/50 border-neutral-700 hover-elevate cursor-pointer ${selectedMechanic === mechanic.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleMechanicSelect(mechanic.id)}
                  data-testid={`card-mechanic-${mechanic.id}`}
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-blue-600 to-neutral-900 flex items-center justify-center">
                    <User className="w-24 h-24 text-blue-200/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold mb-1">{mechanic.name}</h3>
                      <p className="text-blue-400 text-sm mb-2">{mechanic.role}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-neutral-300">
                          <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                          {mechanic.rating}
                        </span>
                        <span className="text-neutral-400">{mechanic.reviews} отзывов</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Опыт: {mechanic.experience}</span>
                      <Button size="sm" className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" data-testid={`button-select-mechanic-${mechanic.id}`}>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-black' : 'bg-neutral-700'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <div className="flex-1 h-1 bg-neutral-700 rounded">
                <div className={`h-full bg-blue-500 rounded transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-black' : 'bg-neutral-700'}`}>
                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <div className="flex-1 h-1 bg-neutral-700 rounded">
                <div className={`h-full bg-blue-500 rounded transition-all ${step > 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-black' : 'bg-neutral-700'}`}>
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
                          className={selectedTime === time ? 'bg-blue-500 text-black' : 'border-neutral-600 text-white hover:bg-neutral-700'}
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

            {selectedService && selectedMechanic && selectedTime && selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-neutral-700/50 rounded-lg"
              >
                <h4 className="font-semibold mb-3">Ваша запись:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>{services.find(s => s.id === selectedService)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>{mechanics.find(m => m.id === selectedMechanic)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-400">
                    {formatPrice(services.find(s => s.id === selectedService)?.price || 0)} ₽
                  </span>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-black font-semibold"
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

      <section ref={contactRef} id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Остались вопросы?</h2>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
              Свяжитесь с нами по телефону, напишите письмо или приезжайте в наш сервис
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm text-neutral-400">Телефон</p>
                  <a href="tel:+79991234567" className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                    +7 (999) 123-45-67
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm text-neutral-400">Адрес</p>
                  <p className="text-lg font-semibold text-white">
                    ул. Автозаводская, 28
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm text-neutral-400">График работы</p>
                  <p className="text-lg font-semibold text-white">
                    Пн-Сб: 08:00 - 18:00
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-neutral-400 text-sm">
          <p>© 2024 ТехноПро Сервис. Все права защищены. | Дизайн от <span className="text-white">MP.WebStudio</span></p>
        </div>
      </footer>
    </div>
  );
}
