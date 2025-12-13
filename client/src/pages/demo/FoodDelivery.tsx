import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Star, Flame, Leaf, ChefHat, Truck, ArrowLeft, ShoppingCart, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const menuItems = [
  {
    id: 1,
    name: "Том Ям с креветками",
    description: "Острый тайский суп с креветками, грибами и лемонграссом",
    price: 590,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    tags: ["острое", "хит"],
    calories: 280,
  },
  {
    id: 2,
    name: "Пад Тай с курицей",
    description: "Рисовая лапша с курицей, арахисом и ростками бамбука",
    price: 450,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop",
    tags: ["популярное"],
    calories: 520,
  },
  {
    id: 3,
    name: "Зелёный карри",
    description: "Нежное куриное филе в кокосовом молоке с овощами",
    price: 520,
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    tags: ["веган"],
    calories: 380,
  },
  {
    id: 4,
    name: "Спринг роллы",
    description: "Хрустящие роллы с овощами и соусом sweet chili",
    price: 320,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    tags: ["веган", "лёгкое"],
    calories: 180,
  },
];

const features = [
  { icon: Truck, title: "Быстрая доставка", desc: "от 30 минут" },
  { icon: ChefHat, title: "Свежие продукты", desc: "готовим при заказе" },
  { icon: Leaf, title: "Веган меню", desc: "большой выбор" },
];

export default function FoodDelivery() {
  const [cart, setCart] = useState<number[]>([]);

  const addToCart = (id: number) => {
    setCart(prev => [...prev, id]);
  };

  const cartTotal = cart.reduce((sum, id) => {
    const item = menuItems.find(m => m.id === id);
    return sum + (item?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 dark:from-neutral-950 dark:to-neutral-900">
      <Link href="/#portfolio">
        <Button
          variant="ghost"
          className="fixed top-4 left-4 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </Link>

      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 shadow-lg" data-testid="button-view-cart">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Корзина ({cart.length}) — {cartTotal} р
          </Button>
        </div>
      )}

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-red-500/90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920')] bg-cover bg-center opacity-30" />
        
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-xl font-bold text-white">ВкусДом</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-white/90 text-sm">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              10:00 - 23:00
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              +7 (999) 123-45-67
            </span>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Бесплатная доставка от 1000 р
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Азиатская кухня с доставкой на дом
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Свежие блюда тайской и вьетнамской кухни. Готовим с любовью, доставляем с заботой.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" data-testid="button-order">
                Заказать сейчас
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10" data-testid="button-menu">
                Смотреть меню
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="py-12 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-6 bg-white dark:bg-neutral-800 border-0 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Популярные блюда
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Выберите из нашего меню или соберите свой заказ
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover-elevate border-0 shadow-md" data-testid={`card-menu-${item.id}`}>
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.tags.map(tag => (
                        <Badge
                          key={tag}
                          className={`text-xs ${
                            tag === "острое" ? "bg-red-500" :
                            tag === "хит" ? "bg-orange-500" :
                            tag === "веган" ? "bg-green-500" :
                            "bg-blue-500"
                          } text-white border-0`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {cart.filter(id => id === item.id).length > 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white border-0">
                          x{cart.filter(id => id === item.id).length}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-lg font-bold text-orange-500">{item.price} р</span>
                      <span className="text-xs text-muted-foreground">{item.calories} ккал</span>
                    </div>
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600" 
                      onClick={() => addToCart(item.id)}
                      data-testid={`button-add-${item.id}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      В корзину
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-orange-500 dark:bg-orange-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Закажите прямо сейчас</h2>
              <p className="text-white/80">Доставка от 30 минут в любую точку города</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" data-testid="button-call">
                <Phone className="w-4 h-4 mr-2" />
                Позвонить
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold">ВкусДом</span>
              </div>
              <p className="text-neutral-400">Доставка азиатской кухни в вашем городе</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-neutral-400">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +7 (999) 123-45-67</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> ул. Примерная, 1</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> 10:00 - 23:00</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Рейтинг</h4>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-neutral-400">4.9 / 5</span>
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
