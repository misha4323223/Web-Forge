import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, MapPin, Phone, Star, Flame, Leaf, ChefHat, Truck, ArrowLeft, ShoppingCart, Plus, Minus, X, Check, CreditCard, Wallet, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import foodHeroImg from "@assets/generated_images/asian_food_arrangement_table.webp";
import tomYumImg from "@assets/generated_images/tom_yum_shrimp_soup.webp";
import padThaiImg from "@assets/generated_images/pad_thai_chicken_noodles.webp";
import greenCurryImg from "@assets/generated_images/green_curry_coconut_milk.webp";
import springRollsImg from "@assets/generated_images/spring_rolls_crispy_vietnamese.webp";

const categories = [
  { id: "all", name: "Все блюда" },
  { id: "soups", name: "Супы" },
  { id: "noodles", name: "Лапша" },
  { id: "vegan", name: "Веган" },
];

const menuItems = [
  {
    id: 1,
    name: "Том Ям с креветками",
    description: "Острый тайский суп с креветками, грибами и лемонграссом",
    price: 590,
    image: tomYumImg,
    tags: ["острое", "хит"],
    calories: 280,
    category: "soups",
  },
  {
    id: 2,
    name: "Пад Тай с курицей",
    description: "Рисовая лапша с курицей, арахисом и ростками бамбука",
    price: 450,
    image: padThaiImg,
    tags: ["популярное"],
    calories: 520,
    category: "noodles",
  },
  {
    id: 3,
    name: "Зелёный карри",
    description: "Нежное куриное филе в кокосовом молоке с овощами",
    price: 520,
    image: greenCurryImg,
    tags: ["веган"],
    calories: 380,
    category: "vegan",
  },
  {
    id: 4,
    name: "Спринг роллы",
    description: "Хрустящие роллы с овощами и соусом sweet chili",
    price: 320,
    image: springRollsImg,
    tags: ["веган", "лёгкое"],
    calories: 180,
    category: "vegan",
  },
];

const reviews = [
  {
    id: 1,
    name: "Мария К.",
    rating: 5,
    text: "Невероятно вкусная еда! Доставили за 25 минут. Всё очень свежее и горячее. Обязательно закажу ещё!",
    avatar: "МК",
  },
  {
    id: 2,
    name: "Иван П.",
    rating: 5,
    text: "Том Ям просто восхитительный, как в настоящем тайском ресторане. Буду постоянным клиентом!",
    avatar: "ИП",
  },
  {
    id: 3,
    name: "Анна М.",
    rating: 5,
    text: "Отличное меню для веганов. Спринг роллы получились хрустящими. Спасибо за быструю доставку!",
    avatar: "АМ",
  },
];

const paymentMethods = [
  { icon: CreditCard, name: "Карта" },
  { icon: Wallet, name: "Электронный кошелек" },
  { icon: DollarSign, name: "Наличные" },
];

const features = [
  { icon: Truck, title: "Быстрая доставка", desc: "от 30 минут" },
  { icon: ChefHat, title: "Свежие продукты", desc: "готовим при заказе" },
  { icon: Leaf, title: "Веган меню", desc: "большой выбор" },
];

export default function FoodDelivery() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", address: "" });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const menuRef = useRef<HTMLElement>(null);

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  useDocumentMeta({
    title: "FoodFlow — Доставка тайской еды в Туле | Быстро и вкусно",
    description: "Заказывайте свежую тайскую еду с доставкой за 30 минут. Том Ям, Пад Тай, Карри. Меню с калориями. Веган опции.",
    keywords: "доставка еды, тайская кухня, доставка в Туле, суши, лапша, веган меню",
    ogTitle: "FoodFlow — Доставка еды | Дизайн от MP.WebStudio",
    ogDescription: "Быстрая доставка, свежие продукты, веган меню. Попробуйте тайскую кухню прямо сейчас!",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/food-delivery",
    canonical: "https://mp-webstudio.ru/demo/food-delivery"
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "FoodFlow", url: "https://mp-webstudio.ru/demo/food-delivery" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const addToCart = (id: number) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id]--;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const clearItem = (id: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[id];
      return newCart;
    });
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    item: menuItems.find(m => m.id === Number(id))!,
    quantity: qty
  })).filter(c => c.item);

  const cartTotal = cartItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone || !orderForm.address) return;
    setOrderSuccess(true);
    setTimeout(() => {
      setCartOpen(false);
      setOrderSuccess(false);
      setCart({});
      setOrderForm({ name: "", phone: "", address: "" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 dark:from-neutral-950 dark:to-neutral-900">
      <Link href="/#portfolio" className="fixed top-4 left-4 z-[100]">
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-orange-300/30 dark:border-white/20 hover:bg-white/90 dark:hover:bg-black/90"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </Link>

      {cartCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 shadow-lg" onClick={() => setCartOpen(true)} data-testid="button-view-cart">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Корзина ({cartCount}) — {cartTotal} р
          </Button>
        </div>
      )}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Ваш заказ
            </DialogTitle>
          </DialogHeader>
          
          {orderSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Заказ принят!</h3>
              <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
            </div>
          ) : (
            <>
              {cartItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cartItems.map(({ item, quantity }) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-sm text-orange-500">{item.price * quantity} р</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{quantity}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addToCart(item.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => clearItem(item.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Итого:</span>
                      <span className="text-orange-500">{cartTotal} р</span>
                    </div>
                    {cartTotal < 1000 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        До бесплатной доставки: {1000 - cartTotal} р
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleOrder} className="space-y-3">
                    <div>
                      <Label htmlFor="name">Ваше имя</Label>
                      <Input 
                        id="name" 
                        value={orderForm.name} 
                        onChange={(e) => setOrderForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Иван"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        value={orderForm.phone} 
                        onChange={(e) => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+7 (999) 123-45-67"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Адрес доставки</Label>
                      <Input 
                        id="address" 
                        value={orderForm.address} 
                        onChange={(e) => setOrderForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="ул. Примерная, д. 1, кв. 10"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                      Оформить заказ
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-red-500/90 pointer-events-none" />
        <img 
          src={foodHeroImg} 
          alt="Еда" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
        
        <nav className="relative z-50 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 pl-12">
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
              <Button size="lg" variant="secondary" onClick={scrollToMenu} data-testid="button-order">
                Заказать сейчас
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10" onClick={scrollToMenu} data-testid="button-menu">
                Смотреть меню
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="py-12 -mt-8 relative z-20 bg-gradient-to-b from-orange-500/15 to-white dark:from-orange-900/20 dark:to-neutral-950">
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

      <section ref={menuRef} className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50 dark:from-neutral-950 dark:to-orange-950/20">
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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {categories.map(cat => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className={selectedCategory === cat.id ? "bg-orange-500 hover:bg-orange-600 border-0" : ""}
                data-testid={`button-filter-${cat.id}`}
              >
                {cat.name}
              </Button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
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
                    {cart[item.id] > 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white border-0">
                          x{cart[item.id]}
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

      <section className="py-16 bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Отзывы клиентов</h2>
            <p className="text-muted-foreground">Вот что говорят наши постоянные клиенты</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full p-6 bg-white dark:bg-neutral-800 border-0 shadow-md hover-elevate">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-bold text-orange-600">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{review.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Закажите прямо сейчас</h2>
              <p className="text-white/80">Доставка от 30 минут в любую точку города</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-call">
                <a href="tel:+79991234567">
                  <Phone className="w-4 h-4 mr-2" />
                  Позвонить
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold">ВкусДом</span>
              </div>
              <p className="text-neutral-400 text-sm">Доставка азиатской кухни в вашем городе</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Контакты</h4>
              <div className="space-y-2 text-neutral-400 text-sm">
                <a href="tel:+79991234567" className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4" /> +7 (999) 123-45-67</a>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> ул. Примерная, 1</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> 10:00 - 23:00</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Рейтинг</h4>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-neutral-400 text-sm">4.9 / 5</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Способы оплаты</h4>
              <div className="flex gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-orange-500/20 transition-colors flex items-center justify-center cursor-pointer group"
                    title={method.name}
                    data-testid={`payment-${method.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <method.icon className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500 text-sm">
            Демо-сайт от WebStudio
          </div>
        </div>
      </footer>
    </div>
  );
}
