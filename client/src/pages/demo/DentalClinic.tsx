import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Clock, MapPin, Phone, Star, Calendar, Check, ArrowLeft, 
  Shield, Award, Users, Sparkles 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import { useAggregateRatingSchema } from "@/lib/useAggregateRatingSchema";

import heroImg from "@assets/generated_images/dental_clinic_modern_reception.webp";
import treatmentImg from "@assets/generated_images/dental_treatment_room_interior.webp";
import femaleDocImg from "@assets/generated_images/russian_female_dentist_portrait.webp";
import maleDocImg from "@assets/generated_images/russian_male_dentist_portrait.webp";
import instrumentsImg from "@assets/generated_images/dental_instruments_close-up.webp";
import smileImg from "@assets/generated_images/perfect_white_smile_close-up.webp";
import xrayImg from "@assets/generated_images/dental_x-ray_equipment_modern.webp";

const services = [
  { 
    id: 1, 
    name: "Профессиональная чистка", 
    description: "Удаление зубного камня и налёта ультразвуком",
    price: 4500, 
    duration: "60 мин",
    icon: Sparkles 
  },
  { 
    id: 2, 
    name: "Лечение кариеса", 
    description: "Пломбирование с использованием современных материалов",
    price: 5500, 
    duration: "45 мин",
    icon: Heart 
  },
  { 
    id: 3, 
    name: "Отбеливание зубов", 
    description: "Профессиональное отбеливание ZOOM 4",
    price: 18000, 
    duration: "90 мин",
    popular: true,
    icon: Sparkles 
  },
  { 
    id: 4, 
    name: "Имплантация", 
    description: "Установка импланта Nobel Biocare под ключ",
    price: 55000, 
    duration: "120 мин",
    icon: Award 
  },
  { 
    id: 5, 
    name: "Виниры", 
    description: "Керамические виниры E.max",
    price: 35000, 
    duration: "2 визита",
    icon: Star 
  },
  { 
    id: 6, 
    name: "Брекеты", 
    description: "Установка брекет-системы с сопровождением",
    price: 95000, 
    duration: "18 мес",
    icon: Check 
  },
];

const doctors = [
  { 
    id: 1, 
    name: "Елена Смирнова", 
    role: "Главный врач, терапевт", 
    experience: "15 лет",
    image: femaleDocImg,
    specialization: "Эстетическая стоматология, виниры"
  },
  { 
    id: 2, 
    name: "Андрей Козлов", 
    role: "Хирург-имплантолог", 
    experience: "12 лет",
    image: maleDocImg,
    specialization: "Имплантация, костная пластика"
  },
];

const advantages = [
  { icon: Shield, title: "Гарантия 5 лет", description: "На все виды работ" },
  { icon: Award, title: "Европейское оборудование", description: "Только сертифицированная техника" },
  { icon: Users, title: "10 000+ пациентов", description: "Доверяют нам свои улыбки" },
  { icon: Heart, title: "Безболезненное лечение", description: "Современная анестезия" },
];

export default function DentalClinic() {
  const [formData, setFormData] = useState({ name: "", phone: "", service: "" });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { toast } = useToast();
  const servicesRef = useRef<HTMLElement>(null);
  const doctorsRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "SmileCare — Стоматология в Туле | Лечение, имплантация, отбеливание",
    description: "Современная стоматологическая клиника. Профессиональное лечение кариеса, имплантация, отбеливание ZOOM 4. Европейское оборудование, гарантия 5 лет.",
    keywords: "стоматолог, клиника, лечение зубов, имплантация, отбеливание, Тула, зубной врач",
    ogTitle: "SmileCare — Стоматология | Дизайн от MP.WebStudio",
    ogDescription: "Профессиональные врачи, современное оборудование, гарантия на все работы",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/dental",
    canonical: "https://mp-webstudio.ru/demo/dental"
  });

  useAggregateRatingSchema({
    name: "SmileCare Стоматология",
    description: "Современная стоматологическая клиника с профессиональными врачами",
    data: {
      ratingValue: 4.8,
      ratingCount: 287
    }
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "SmileCare", url: "https://mp-webstudio.ru/demo/dental" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToServices = () => servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToDoctors = () => doctorsRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToAbout = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Заявка отправлена!",
      description: "Мы перезвоним вам в течение 15 минут",
    });
    setFormData({ name: "", phone: "", service: "" });
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingOpen(false);
      setBookingSuccess(false);
      setFormData({ name: "", phone: "", service: "" });
    }, 2000);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              Запись на приём
            </DialogTitle>
          </DialogHeader>
          
          {bookingSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Заявка отправлена!</h3>
              <p className="text-muted-foreground">Мы перезвоним вам в течение 15 минут</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <Label htmlFor="book-name">Ваше имя</Label>
                <Input 
                  id="book-name"
                  value={formData.name} 
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Иван Иванов"
                  required
                />
              </div>
              <div>
                <Label htmlFor="book-phone">Телефон</Label>
                <Input 
                  id="book-phone"
                  type="tel"
                  value={formData.phone} 
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+7 (999) 123-45-67"
                  required
                />
              </div>
              <div>
                <Label htmlFor="book-service">Какая услуга интересует?</Label>
                <Input 
                  id="book-service"
                  value={formData.service} 
                  onChange={(e) => setFormData(f => ({ ...f, service: e.target.value }))}
                  placeholder="Профессиональная чистка"
                />
              </div>
              <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600">
                Записаться
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 pointer-events-none" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" 
          style={{ backgroundImage: `url(${heroImg})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
        
        <nav className="absolute top-0 left-0 right-0 z-50 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link href="/#portfolio">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-teal-100/60 border border-teal-200 hover:bg-teal-100/80"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-5 h-5 text-teal-600" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-teal-700">DentaPro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <button onClick={scrollToServices} className="hover:text-teal-600 transition-colors cursor-pointer">Услуги</button>
            <button onClick={scrollToDoctors} className="hover:text-teal-600 transition-colors cursor-pointer">Врачи</button>
            <button onClick={scrollToAbout} className="hover:text-teal-600 transition-colors cursor-pointer">О клинике</button>
            <button onClick={scrollToContact} className="hover:text-teal-600 transition-colors cursor-pointer">Контакты</button>
          </div>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setBookingOpen(true)} data-testid="button-book-header">
            <Phone className="w-4 h-4 mr-2" />
            Записаться
          </Button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-teal-100 text-teal-700 border-teal-200">
              Стоматология нового поколения
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Здоровая улыбка — 
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                {" "}ваша визитка
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Современная клиника с европейским оборудованием. 
              Безболезненное лечение и гарантия на все работы.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setBookingOpen(true)} data-testid="button-book-hero">
                <Calendar className="w-5 h-5 mr-2" />
                Записаться на приём
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={scrollToServices} data-testid="button-prices">
                Узнать цены
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500" />
                <span className="text-gray-600">9:00 - 21:00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500" />
                <span className="text-gray-600">ул. Ленина, 45</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-500" />
                <a href="tel:+74951234567" className="text-gray-600 hover:text-teal-600 transition-colors">+7 (495) 123-45-67</a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <img 
              src={smileImg} 
              alt="Здоровая улыбка" 
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">4.9 / 5</div>
                  <div className="text-sm text-gray-500">500+ отзывов</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Advantages */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 text-center bg-white border-gray-100 hover-elevate">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                    <adv.icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-sm text-gray-500">{adv.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section ref={servicesRef} id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Наши услуги</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Полный спектр стоматологических услуг по доступным ценам
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
                  className="p-6 bg-white border-gray-100 hover-elevate h-full"
                  data-testid={`card-service-${service.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-teal-600" />
                    </div>
                    {service.popular && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        Популярно
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {service.duration}
                    </div>
                    <div className="font-bold text-teal-600">от {formatPrice(service.price)} ₽</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section ref={doctorsRef} id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Наши врачи</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Опытные специалисты с профильным образованием
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {doctors.map((doctor, i) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden bg-white border-gray-100 hover-elevate">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-teal-600 mb-2">{doctor.role}</p>
                    <p className="text-sm text-gray-500 mb-3">{doctor.specialization}</p>
                    <Badge variant="outline" className="border-gray-200 text-gray-600">
                      Опыт {doctor.experience}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Gallery */}
      <section ref={aboutRef} id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">О клинике</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Современное оборудование и комфортная атмосфера
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <img 
                src={treatmentImg} 
                alt="Лечебный кабинет" 
                className="w-full h-64 lg:h-80 object-cover rounded-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <img 
                src={instrumentsImg} 
                alt="Инструменты" 
                className="w-full h-64 lg:h-80 object-cover rounded-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <img 
                src={xrayImg} 
                alt="Рентген" 
                className="w-full h-64 object-cover rounded-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <img 
                src={heroImg} 
                alt="Ресепшн" 
                className="w-full h-64 object-cover rounded-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section ref={contactRef} id="contact" className="py-20 bg-gradient-to-br from-teal-500 to-cyan-600">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Запишитесь на приём</h2>
            <p className="text-teal-100 max-w-xl mx-auto">
              Оставьте заявку и мы перезвоним вам в течение 15 минут
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-xl"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ваше имя</label>
                <Input 
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-gray-200"
                  data-testid="input-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                <Input 
                  placeholder="+7 (999) 123-45-67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-200"
                  data-testid="input-phone"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Услуга</label>
              <Textarea 
                placeholder="Какая услуга вас интересует?"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="border-gray-200"
                rows={3}
                data-testid="input-service"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              data-testid="button-submit"
            >
              Записаться на приём
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </motion.form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DentaPro</span>
              </div>
              <p className="text-sm">
                Современная стоматологическая клиника 
                с европейским уровнем сервиса
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Контакты</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+74951234567" className="hover:text-white transition-colors">+7 (495) 123-45-67</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  г. Москва, ул. Ленина, 45
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Пн-Вс: 9:00 - 21:00
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Услуги</h4>
              <ul className="space-y-2 text-sm">
                <li>Терапевтическая стоматология</li>
                <li>Имплантация зубов</li>
                <li>Ортодонтия</li>
                <li>Эстетическая стоматология</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>2024 DentaPro. Все права защищены. Лицензия No ЛО-77-01-012345</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
