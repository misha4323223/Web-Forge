import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Phone, Star, Calendar, User, Check, ArrowLeft, DollarSign, Bed, Bath } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import { useAggregateRatingSchema } from "@/lib/useAggregateRatingSchema";
import realEstateHeroImg from "@/assets/generated_images/modern_luxury_real_estate_agency_office.png";
import propertyImg1 from "@/assets/generated_images/luxury_central_moscow_apartment_interior.png";
import propertyImg2 from "@/assets/generated_images/modern_luxury_cottage_with_garden_plot.png";
import propertyImg3 from "@/assets/generated_images/minimalist_compact_studio_apartment.png";
import propertyImg4 from "@/assets/generated_images/luxury_penthouse_with_panoramic_views.png";
import propertyImg5 from "@/assets/generated_images/modern_townhouse_near_forest_park.png";
import propertyImg6 from "@/assets/generated_images/class_a_premium_office_space_interior.png";

const properties = [
  { id: 1, name: "Апартаменты в центре", beds: 3, baths: 2, area: 120, price: 12500000, type: "Квартира", image: propertyImg1 },
  { id: 2, name: "Коттедж с участком", beds: 4, baths: 3, area: 250, price: 35000000, type: "Дом", popular: true, image: propertyImg2 },
  { id: 3, name: "Студия на Арбате", beds: 1, baths: 1, area: 45, price: 5000000, type: "Квартира", image: propertyImg3 },
  { id: 4, name: "Пентхаус с панорамой", beds: 5, baths: 4, area: 300, price: 85000000, type: "Апартаменты", image: propertyImg4 },
  { id: 5, name: "Таунхаус у лесопарка", beds: 3, baths: 2, area: 180, price: 18000000, type: "Дом", image: propertyImg5 },
  { id: 6, name: "Офис класса А", beds: 0, baths: 2, area: 150, price: 25000000, type: "Коммерция", image: propertyImg6 },
];

const agents = [
  { 
    id: 1, 
    name: "Виктория Волкова", 
    role: "Топ-агент", 
    experience: "15 лет",
    deals: 342,
    rating: 4.9,
    reviews: 298
  },
  { 
    id: 2, 
    name: "Антон Морозов", 
    role: "Агент по люксу", 
    experience: "12 лет",
    deals: 187,
    rating: 4.8,
    reviews: 215
  },
  { 
    id: 3, 
    name: "Елена Смирнова", 
    role: "Коммерческий агент", 
    experience: "10 лет",
    deals: 124,
    rating: 4.9,
    reviews: 178
  },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function RealEstateAgency() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const propertiesRef = useRef<HTMLElement>(null);
  const agentsRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "ЛюксПро — Агентство недвижимости | Покупка и продажа",
    description: "Агентство недвижимости с опытными агентами. Апартаменты, дома, коммерческая недвижимость. Персональный сервис, честные цены, онлайн-просмотры.",
    keywords: "недвижимость, апартаменты, купить дом, агенство, агент по недвижимости",
    ogTitle: "ЛюксПро — Агентство недвижимости | Дизайн от MP.WebStudio",
    ogDescription: "Премиум агенство недвижимости с лучшими предложениями на рынке",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/real-estate",
    canonical: "https://mp-webstudio.ru/demo/real-estate"
  });

  const avgRating = (agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1);
  const totalReviews = agents.reduce((sum, a) => sum + a.reviews, 0);

  useAggregateRatingSchema({
    name: "ЛюксПро Агенство недвижимости",
    description: "Премиум агенство недвижимости с опытными агентами",
    data: {
      ratingValue: parseFloat(avgRating),
      ratingCount: totalReviews
    }
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "ЛюксПро", url: "https://mp-webstudio.ru/demo/real-estate" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToProperties = () => propertiesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToAgents = () => agentsRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  const handlePropertySelect = (id: number) => {
    setSelectedProperty(id);
    setStep(2);
    toast({
      title: "Объект выбран",
      description: properties.find(p => p.id === id)?.name,
    });
  };

  const handleAgentSelect = (id: number) => {
    setSelectedAgent(id);
    setStep(3);
    toast({
      title: "Агент выбран",
      description: agents.find(a => a.id === id)?.name,
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
    if (selectedProperty && selectedAgent && selectedTime && selectedDate) {
      toast({
        title: "Просмотр запланирован!",
        description: `${properties.find(p => p.id === selectedProperty)?.name} с ${agents.find(a => a.id === selectedAgent)?.name}`,
      });
      setStep(1);
      setSelectedProperty(null);
      setSelectedAgent(null);
      setSelectedTime(null);
      setSelectedDate("");
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Link href="/#portfolio">
        <Button
          variant="ghost"
          className="fixed top-2 left-4 z-50 bg-black/80 backdrop-blur-sm text-white hover:text-white hover:bg-white/10"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </Link>

      <header className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-neutral-950 to-neutral-950 pointer-events-none" />
        <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: `url(${realEstateHeroImg})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />
        
        <nav className="absolute top-0 left-0 right-0 z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider">ЛЮКСПРО</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-300">
            <button onClick={scrollToProperties} className="hover:text-emerald-400 transition-colors cursor-pointer">Объекты</button>
            <button onClick={scrollToAgents} className="hover:text-emerald-400 transition-colors cursor-pointer">Агенты</button>
            <button onClick={scrollToBooking} className="hover:text-emerald-400 transition-colors cursor-pointer">Просмотр</button>
            <button onClick={scrollToContact} className="hover:text-emerald-400 transition-colors cursor-pointer">Контакты</button>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold" data-testid="button-book-header">
            Записаться
          </Button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Премиум агенство недвижимости
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Найди свой идеальный
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                дом
              </span>
            </h1>
            <p className="text-xl text-neutral-400 mb-8 max-w-lg">
              Более 300 проектов успешно завершено. Апартаменты, дома, коммерческая недвижимость. Прозрачность и честность во всём.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold" data-testid="button-book-hero">
                <Calendar className="w-5 h-5 mr-2" />
                Запланировать просмотр
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-700 text-white hover:bg-white/10" data-testid="button-properties">
                Посмотреть объекты
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-neutral-400">09:00 - 19:00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-neutral-400">Москва, центр</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="tel:+79991234567" className="text-neutral-400 hover:text-emerald-400 transition-colors">+7 (999) 123-45-67</a>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <section ref={propertiesRef} id="properties" className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Избранные объекты</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Лучшие предложения на рынке недвижимости
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden bg-neutral-800/50 border-neutral-700 hover-elevate cursor-pointer transition-all ${selectedProperty === property.id ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => handlePropertySelect(property.id)}
                  data-testid={`card-property-${property.id}`}
                >
                  <div className="h-40 relative overflow-hidden bg-neutral-700">
                    <img 
                      src={property.image} 
                      alt={property.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                    {property.popular && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-emerald-500 text-black border-0">Хит</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-white">{property.name}</h3>
                    <p className="text-sm text-neutral-400 mb-4">{property.type}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                      {property.beds > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          {property.beds} спальн.
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {property.baths}
                      </span>
                      <span>{property.area} м²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-400">{formatPrice(property.price)} ₽</span>
                      <Button size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" data-testid={`button-select-property-${property.id}`}>
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

      <section ref={agentsRef} id="agents" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши агенты</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Опытные профессионалы, помогут вам найти идеальное решение
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden bg-neutral-800/50 border-neutral-700 hover-elevate cursor-pointer ${selectedAgent === agent.id ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => handleAgentSelect(agent.id)}
                  data-testid={`card-agent-${agent.id}`}
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-emerald-600 to-neutral-900 flex items-center justify-center">
                    <User className="w-24 h-24 text-emerald-200/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
                      <p className="text-emerald-400 text-sm mb-2">{agent.role}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-neutral-300">
                          <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                          {agent.rating}
                        </span>
                        <span className="text-neutral-400">{agent.reviews} отзывов</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="text-neutral-400">Опыт: {agent.experience}</p>
                        <p className="text-emerald-400 font-semibold">{agent.deals} сделок</p>
                      </div>
                      <Button size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" data-testid={`button-select-agent-${agent.id}`}>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Запланировать просмотр</h2>
            <p className="text-neutral-400">
              Выберите объект, агента и удобное время
            </p>
          </motion.div>

          <Card className="p-8 bg-neutral-800/50 border-neutral-700">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-500 text-black' : 'bg-neutral-700'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <div className="flex-1 h-1 bg-neutral-700 rounded">
                <div className={`h-full bg-emerald-500 rounded transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-500 text-black' : 'bg-neutral-700'}`}>
                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <div className="flex-1 h-1 bg-neutral-700 rounded">
                <div className={`h-full bg-emerald-500 rounded transition-all ${step > 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-emerald-500 text-black' : 'bg-neutral-700'}`}>
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
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={selectedTime === time ? 'bg-emerald-500 text-black' : 'border-neutral-600 text-white hover:bg-neutral-700'}
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

            {selectedProperty && selectedAgent && selectedTime && selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-neutral-700/50 rounded-lg"
              >
                <h4 className="font-semibold mb-3">Ваш просмотр:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-400" />
                    <span>{properties.find(p => p.id === selectedProperty)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>{agents.find(a => a.id === selectedAgent)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatPrice(properties.find(p => p.id === selectedProperty)?.price || 0)} ₽
                  </span>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                    onClick={handleBook}
                    data-testid="button-confirm-booking"
                  >
                    Запланировать
                  </Button>
                </div>
              </motion.div>
            )}

            {step < 3 && (
              <p className="text-center text-neutral-400 mt-8">
                {step === 1 ? 'Выберите объект выше' : 'Выберите агента выше'}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Свяжитесь с нами</h2>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
              Наши специалисты помогут вам найти идеальный вариант
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-emerald-400" />
                <div className="text-left">
                  <p className="text-sm text-neutral-400">Телефон</p>
                  <a href="tel:+79991234567" className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors">
                    +7 (999) 123-45-67
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-emerald-400" />
                <div className="text-left">
                  <p className="text-sm text-neutral-400">Адрес</p>
                  <p className="text-lg font-semibold text-white">
                    Москва, центр города
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-400" />
                <div className="text-left">
                  <p className="text-sm text-neutral-400">График работы</p>
                  <p className="text-lg font-semibold text-white">
                    Пн-Пт: 09:00 - 19:00
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-neutral-400 text-sm">
          <p>© 2024 ЛюксПро. Все права защищены. | Дизайн от <span className="text-white">MP.WebStudio</span></p>
        </div>
      </footer>
    </div>
  );
}
