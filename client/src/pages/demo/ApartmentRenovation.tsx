import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Clock, MapPin, Phone, Star, ArrowLeft, 
  Shield, Award, Users, Hammer, Paintbrush, Wrench, Ruler, Check
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

import livingRoomImg from "@assets/generated_images/modern_living_room_renovation.webp";
import kitchenImg from "@assets/generated_images/modern_kitchen_renovation_result.webp";
import bathroomImg from "@assets/generated_images/modern_bathroom_renovation_result.webp";
import bedroomImg from "@assets/generated_images/modern_bedroom_renovation_result.webp";
import workImg from "@assets/generated_images/renovation_work_in_progress.webp";
import beforeAfterImg from "@assets/generated_images/before_after_renovation_comparison.webp";
import planningImg from "@assets/generated_images/renovation_planning_blueprints_tools.webp";

const services = [
  { 
    id: 1, 
    name: "Косметический ремонт", 
    description: "Обновление отделки без перепланировки",
    priceFrom: 3500, 
    unit: "м²",
    duration: "от 2 недель",
    icon: Paintbrush 
  },
  { 
    id: 2, 
    name: "Капитальный ремонт", 
    description: "Полная переделка с заменой коммуникаций",
    priceFrom: 8000, 
    unit: "м²",
    duration: "от 1 месяца",
    popular: true,
    icon: Hammer 
  },
  { 
    id: 3, 
    name: "Ремонт под ключ", 
    description: "С дизайн-проектом и меблировкой",
    priceFrom: 15000, 
    unit: "м²",
    duration: "от 2 месяцев",
    icon: Home 
  },
  { 
    id: 4, 
    name: "Ремонт ванной", 
    description: "Полный ремонт санузла под ключ",
    priceFrom: 150000, 
    unit: "комплект",
    duration: "от 10 дней",
    icon: Wrench 
  },
  { 
    id: 5, 
    name: "Ремонт кухни", 
    description: "С установкой гарнитура и техники",
    priceFrom: 200000, 
    unit: "комплект",
    duration: "от 2 недель",
    icon: Home 
  },
  { 
    id: 6, 
    name: "Дизайн-проект", 
    description: "3D-визуализация и чертежи",
    priceFrom: 1500, 
    unit: "м²",
    duration: "от 5 дней",
    icon: Ruler 
  },
];

const portfolio = [
  { 
    id: 1, 
    title: "Квартира 85 м²", 
    type: "Капитальный ремонт",
    location: "ЖК Солнечный",
    image: livingRoomImg
  },
  { 
    id: 2, 
    title: "Кухня-гостиная", 
    type: "Ремонт под ключ",
    location: "ЖК Центральный",
    image: kitchenImg
  },
  { 
    id: 3, 
    title: "Ванная комната", 
    type: "Косметический ремонт",
    location: "ул. Пушкина",
    image: bathroomImg
  },
  { 
    id: 4, 
    title: "Спальня 18 м²", 
    type: "Ремонт под ключ",
    location: "ЖК Престиж",
    image: bedroomImg
  },
];

const advantages = [
  { icon: Shield, title: "Гарантия 3 года", description: "На все виды работ" },
  { icon: Award, title: "Фиксированная цена", description: "Без скрытых платежей" },
  { icon: Users, title: "500+ объектов", description: "Успешно завершено" },
  { icon: Ruler, title: "Точные сроки", description: "Сдаём вовремя" },
];

const steps = [
  { num: 1, title: "Замер", description: "Бесплатный выезд специалиста" },
  { num: 2, title: "Смета", description: "Детальный расчёт стоимости" },
  { num: 3, title: "Договор", description: "Фиксация цены и сроков" },
  { num: 4, title: "Работы", description: "Ремонт с контролем качества" },
  { num: 5, title: "Сдача", description: "Приёмка и гарантия" },
];

export default function ApartmentRenovation() {
  const [formData, setFormData] = useState({ name: "", phone: "", area: "", description: "" });
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const { toast } = useToast();
  const servicesRef = useRef<HTMLElement>(null);
  const portfolioRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "RenoMaster — Ремонт квартир в Туле | Капитальный, косметический, под ключ",
    description: "Компания по ремонту квартир. Косметический, капитальный, ремонт под ключ. 500+ объектов, гарантия 3 года, фиксированная цена.",
    keywords: "ремонт квартиры, капитальный ремонт, косметический ремонт, дизайн, ремонт под ключ, Тула",
    ogTitle: "RenoMaster — Ремонт квартир | Дизайн от MP.WebStudio",
    ogDescription: "Профессиональный ремонт квартир под ключ. Фиксированная цена, гарантия качества",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/renovation",
    canonical: "https://mp-webstudio.ru/demo/renovation"
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "RenoMaster", url: "https://mp-webstudio.ru/demo/renovation" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToServices = () => servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToPortfolio = () => portfolioRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToProcess = () => processRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Заявка отправлена!",
      description: "Мы перезвоним вам для бесплатной консультации",
    });
    setFormData({ name: "", phone: "", area: "", description: "" });
  };

  const handleCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setCallbackSuccess(true);
    setTimeout(() => {
      setCallbackOpen(false);
      setCallbackSuccess(false);
      setFormData({ name: "", phone: "", area: "", description: "" });
    }, 2000);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-500" />
              Заказать звонок
            </DialogTitle>
          </DialogHeader>
          
          {callbackSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Заявка принята!</h3>
              <p className="text-muted-foreground">Мы перезвоним вам в течение 30 минут</p>
            </div>
          ) : (
            <form onSubmit={handleCallback} className="space-y-4">
              <div>
                <Label htmlFor="cb-name">Ваше имя</Label>
                <Input 
                  id="cb-name"
                  value={formData.name} 
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Иван"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cb-phone">Телефон</Label>
                <Input 
                  id="cb-phone"
                  type="tel"
                  value={formData.phone} 
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+7 (999) 123-45-67"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600">
                Перезвоните мне
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/#portfolio">
              <Button
                variant="ghost"
                size="icon"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Hammer className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-amber-700">РемонтПро</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <button onClick={scrollToServices} className="hover:text-amber-600 transition-colors cursor-pointer">Услуги</button>
            <button onClick={scrollToPortfolio} className="hover:text-amber-600 transition-colors cursor-pointer">Портфолио</button>
            <button onClick={scrollToProcess} className="hover:text-amber-600 transition-colors cursor-pointer">Как мы работаем</button>
            <button onClick={scrollToContact} className="hover:text-amber-600 transition-colors cursor-pointer">Контакты</button>
          </div>

          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setCallbackOpen(true)} data-testid="button-call-header">
            <Phone className="w-4 h-4 mr-2" />
            Вызвать замерщика
          </Button>
        </div>
      </header>

      <div className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 pointer-events-none" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none" 
          style={{ backgroundImage: `url(${livingRoomImg})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-amber-100 text-amber-700 border-amber-200">
              Ремонт квартир в Москве
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Ремонт, который 
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {" "}меняет жизнь
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Превращаем старые квартиры в современное жильё. 
              Фиксированная цена, точные сроки, гарантия 3 года.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={scrollToContact} data-testid="button-calculate">
                <Ruler className="w-5 h-5 mr-2" />
                Рассчитать стоимость
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={scrollToPortfolio} data-testid="button-portfolio">
                Смотреть работы
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-4 h-4 text-amber-500" />
                <span>Бесплатный замер</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-4 h-4 text-amber-500" />
                <span>Договор и смета</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-4 h-4 text-amber-500" />
                <span>Гарантия 3 года</span>
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
              src={beforeAfterImg} 
              alt="До и после ремонта" 
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">500+ объектов</div>
                  <div className="text-sm text-gray-500">успешно завершено</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                    <adv.icon className="w-7 h-7 text-amber-600" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Услуги и цены</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Полный спектр ремонтных работ любой сложности
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
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    {service.popular && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
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
                    <div className="font-bold text-amber-600">
                      от {formatPrice(service.priceFrom)} ₽/{service.unit}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section ref={portfolioRef} id="portfolio" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Наши работы</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Примеры завершённых объектов в Москве
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {portfolio.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden bg-white border-gray-100 hover-elevate group">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <Badge variant="outline" className="mb-3 border-amber-200 text-amber-700">
                      {item.type}
                    </Badge>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section ref={processRef} id="process" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Как мы работаем</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              5 простых шагов до вашего идеального ремонта
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <img 
              src={workImg} 
              alt="Процесс работы" 
              className="w-full h-64 md:h-80 object-cover rounded-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section ref={contactRef} id="contact" className="py-20 bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Бесплатный расчёт стоимости</h2>
            <p className="text-amber-100 max-w-xl mx-auto">
              Оставьте заявку и получите смету в течение 24 часов
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
                  placeholder="Иван"
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
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Площадь (м²)</label>
                <Input 
                  placeholder="50"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="border-gray-200"
                  data-testid="input-area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип ремонта</label>
                <Textarea 
                  placeholder="Какой ремонт планируете?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-gray-200"
                  rows={1}
                  data-testid="input-description"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              data-testid="button-submit"
            >
              Получить бесплатную смету
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
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Hammer className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">РемонтПро</span>
              </div>
              <p className="text-sm">
                Профессиональный ремонт квартир в Москве 
                с гарантией качества
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Контакты</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+74959876543" className="hover:text-white transition-colors">+7 (495) 987-65-43</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  г. Москва, ул. Строителей, 10
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Пн-Сб: 9:00 - 20:00
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Услуги</h4>
              <ul className="space-y-2 text-sm">
                <li>Косметический ремонт</li>
                <li>Капитальный ремонт</li>
                <li>Ремонт под ключ</li>
                <li>Дизайн-проект</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>2024 РемонтПро. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
