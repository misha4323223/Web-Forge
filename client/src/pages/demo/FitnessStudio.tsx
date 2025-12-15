import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Dumbbell, Users, Calendar, Zap, Heart, Trophy, ArrowLeft, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const classes = [
  { id: 1, name: "Силовая тренировка", time: "07:00", trainer: "Алексей", duration: "60 мин", spots: 8 },
  { id: 2, name: "Йога", time: "09:00", trainer: "Марина", duration: "75 мин", spots: 12 },
  { id: 3, name: "HIIT", time: "12:00", trainer: "Дмитрий", duration: "45 мин", spots: 5 },
  { id: 4, name: "Пилатес", time: "14:00", trainer: "Анна", duration: "60 мин", spots: 10 },
  { id: 5, name: "Бокс", time: "18:00", trainer: "Сергей", duration: "60 мин", spots: 6 },
  { id: 6, name: "Стретчинг", time: "20:00", trainer: "Елена", duration: "45 мин", spots: 15 },
];

const stats = [
  { icon: Users, value: "500+", label: "Активных членов" },
  { icon: Dumbbell, value: "50+", label: "Тренажёров" },
  { icon: Trophy, value: "15", label: "Тренеров" },
];

const plans = [
  { name: "Базовый", price: 2500, features: ["Тренажёрный зал", "Раздевалки", "Душевые"] },
  { name: "Стандарт", price: 4500, features: ["Всё из Базового", "Групповые занятия", "Сауна"], popular: true },
  { name: "Премиум", price: 7500, features: ["Всё из Стандарт", "Персональный тренер", "Питание"] },
];

export default function FitnessStudio() {
  const [bookedClasses, setBookedClasses] = useState<number[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const bookClass = (id: number) => {
    if (bookedClasses.includes(id)) {
      setBookedClasses(prev => prev.filter(x => x !== id));
      toast({
        title: "Запись отменена",
        description: "Вы отменили запись на занятие",
      });
    } else {
      setBookedClasses(prev => [...prev, id]);
      const cls = classes.find(c => c.id === id);
      toast({
        title: "Вы записаны!",
        description: `${cls?.name} в ${cls?.time}`,
      });
    }
  };

  const selectPlan = (planName: string) => {
    setSelectedPlan(planName);
    toast({
      title: "Тариф выбран",
      description: `Вы выбрали тариф "${planName}"`,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Link href="/#portfolio">
        <Button
          variant="ghost"
          className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-sm text-white hover:text-white hover:bg-white/10"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </Link>

      {bookedClasses.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge className="bg-violet-500 text-white border-0 px-4 py-2 text-sm">
            <Calendar className="w-4 h-4 mr-2 inline" />
            Записей: {bookedClasses.length}
          </Badge>
        </div>
      )}

      <header className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-neutral-950 to-neutral-950" />
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" 
          alt="Фитнес" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
        
        <nav className="absolute top-0 left-0 right-0 z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ФОРМА</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-300">
            <a href="#schedule" className="hover:text-white transition-colors">Расписание</a>
            <a href="#pricing" className="hover:text-white transition-colors">Абонементы</a>
            <a href="#contact" className="hover:text-white transition-colors">Контакты</a>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700" data-testid="button-trial">
            Пробное занятие
          </Button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/30">
              Первое занятие бесплатно
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Твоя лучшая
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                форма
              </span>
            </h1>
            <p className="text-xl text-neutral-400 mb-8 max-w-lg">
              Современный фитнес-клуб с профессиональными тренерами и новейшим оборудованием
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700" data-testid="button-start">
                Начать тренировки
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-700 text-white hover:bg-white/5" data-testid="button-tour">
                Виртуальный тур
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-neutral-600 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
            />
          </div>
        </motion.div>
      </header>

      <section className="py-20 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-violet-400" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-neutral-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="schedule" className="py-20 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Расписание на сегодня</h2>
            <p className="text-neutral-400">Выберите занятие и запишитесь онлайн</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, index) => {
              const isBooked = bookedClasses.includes(cls.id);
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-5 border transition-colors ${isBooked ? 'border-violet-500 bg-violet-500/10' : 'border-neutral-700 bg-neutral-800/50 hover:border-violet-500/50'}`} data-testid={`card-class-${cls.id}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{cls.name}</h3>
                        <p className="text-sm text-neutral-400">Тренер: {cls.trainer}</p>
                      </div>
                      {isBooked ? (
                        <Badge className="bg-violet-500 text-white border-0">
                          <Check className="w-3 h-3 mr-1" />
                          Записан
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-0">
                          {cls.spots} мест
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {cls.time}
                      </span>
                      <span>{cls.duration}</span>
                    </div>
                    <Button 
                      variant={isBooked ? "default" : "outline"}
                      className={`w-full ${isBooked ? 'bg-violet-600 hover:bg-violet-700' : 'border-neutral-600 text-neutral-200 hover:bg-violet-600 hover:border-violet-600 hover:text-white'}`}
                      onClick={() => bookClass(cls.id)}
                      data-testid={`button-book-${cls.id}`}
                    >
                      {isBooked ? "Отменить запись" : "Записаться"}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Абонементы</h2>
            <p className="text-neutral-400">Выберите подходящий тариф</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const isSelected = selectedPlan === plan.name;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-6 border ${plan.popular ? 'border-violet-500 bg-gradient-to-b from-violet-500/10 to-transparent' : isSelected ? 'border-violet-500' : 'border-neutral-700 bg-neutral-800/30'}`} data-testid={`card-plan-${plan.name.toLowerCase()}`}>
                    {plan.popular && (
                      <Badge className="mb-4 bg-violet-500 text-white border-0">Популярный</Badge>
                    )}
                    {isSelected && !plan.popular && (
                      <Badge className="mb-4 bg-green-500 text-white border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Выбран
                      </Badge>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-neutral-400"> р/мес</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex items-center gap-2 text-neutral-300">
                          <Heart className="w-4 h-4 text-violet-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${isSelected ? 'bg-green-600 hover:bg-green-700' : plan.popular ? 'bg-violet-600 hover:bg-violet-700' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                      onClick={() => selectPlan(plan.name)}
                      data-testid={`button-select-${plan.name.toLowerCase()}`}
                    >
                      {isSelected ? "Выбрано" : "Выбрать"}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <footer id="contact" className="py-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-violet-500" />
                <span className="text-xl font-bold">ФОРМА</span>
              </div>
              <p className="text-neutral-400">Фитнес-клуб нового поколения</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-neutral-400">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +7 (999) 123-45-67</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> ул. Спортивная, 10</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> 06:00 - 24:00</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Подписка</h4>
              <p className="text-neutral-400 mb-4">Получайте новости и акции</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  className="flex-1 bg-neutral-800 border-neutral-700"
                  data-testid="input-email-subscribe"
                />
                <Button className="bg-violet-600 hover:bg-violet-700" data-testid="button-subscribe">
                  OK
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-500 text-sm">
            Демо-сайт от WebStudio
          </div>
        </div>
      </footer>
    </div>
  );
}
