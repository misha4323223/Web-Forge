import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Heart, Search, Star, Sparkles, Leaf, Droplet, ArrowLeft, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import heroImg from "@assets/stock_images/cosmetics_skincare_p_2775c0e7.webp";
import moisturizerImg from "@assets/stock_images/face_moisturizer_cre_59e07cda.webp";
import serumImg from "@assets/stock_images/vitamin_c_serum_drop_c449b45e.webp";
import micellarImg from "@assets/stock_images/micellar_water_clean_dda3e93a.webp";
import maskImg from "@assets/stock_images/face_mask_cosmetic_s_4961cbaf.webp";
import tonerImg from "@assets/stock_images/toner_bottle_skincar_632250d7.webp";
import nightCreamImg from "@assets/stock_images/night_cream_luxury_s_7bf4c694.webp";

const products = [
  {
    id: 1,
    name: "Увлажняющий крем",
    brand: "HYDRA",
    price: 2890,
    oldPrice: 3490,
    image: moisturizerImg,
    rating: 4.8,
    reviews: 124,
    tag: "Хит",
  },
  {
    id: 2,
    name: "Сыворотка с витамином C",
    brand: "GLOW",
    price: 3450,
    image: serumImg,
    rating: 4.9,
    reviews: 89,
    tag: "Новинка",
  },
  {
    id: 3,
    name: "Мицеллярная вода",
    brand: "PURE",
    price: 890,
    image: micellarImg,
    rating: 4.7,
    reviews: 256,
  },
  {
    id: 4,
    name: "Маска для лица",
    brand: "CARE",
    price: 1290,
    image: maskImg,
    rating: 4.6,
    reviews: 78,
    tag: "Веган",
  },
  {
    id: 5,
    name: "Тоник с гиалуроновой кислотой",
    brand: "HYDRA",
    price: 1890,
    image: tonerImg,
    rating: 4.8,
    reviews: 145,
  },
  {
    id: 6,
    name: "Ночной крем",
    brand: "RESTORE",
    price: 3290,
    oldPrice: 3990,
    image: nightCreamImg,
    rating: 4.9,
    reviews: 67,
    tag: "Скидка",
  },
];

const categories = ["Все", "Увлажнение", "Очищение", "Антивозрастной", "Для тела"];

const features = [
  { icon: Leaf, title: "Натуральный состав", desc: "Без парабенов и сульфатов" },
  { icon: Droplet, title: "Гипоаллергенно", desc: "Подходит чувствительной коже" },
  { icon: Sparkles, title: "Результат", desc: "Видимый эффект за 14 дней" },
];

export default function CosmeticsShop() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [cart, setCart] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addToCart = (id: number) => {
    setCart(prev => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950">
      <Link href="/#portfolio">
        <Button
          variant="ghost"
          className="fixed top-2 left-4 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </Link>

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-stone-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-light tracking-widest text-stone-800 dark:text-white">
              NATURA
            </h1>
            
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 z-10" />
                <Input
                  type="text"
                  placeholder="Поиск товаров..."
                  className="w-full pl-10 rounded-full bg-stone-100 dark:bg-neutral-800 border-0"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" data-testid="button-favorites">
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-stone-100 to-amber-50 dark:from-rose-950/30 dark:via-neutral-950 dark:to-amber-950/20" />
        <img 
          src={heroImg} 
          alt="Косметика" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 border-0">
                Новая коллекция
              </Badge>
              <h2 className="text-4xl md:text-6xl font-light text-stone-800 dark:text-white mb-6 leading-tight">
                Естественная
                <br />
                <span className="font-normal italic text-rose-500">красота</span>
              </h2>
              <p className="text-lg text-stone-600 dark:text-neutral-400 mb-8">
                Корейская косметика с натуральным составом для вашей ежедневной заботы о коже
              </p>
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8" data-testid="button-shop-now">
                Смотреть каталог
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <img 
                src={heroImg} 
                alt="Коллекция косметики" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b border-stone-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium text-stone-800 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-neutral-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-light text-stone-800 dark:text-white">
              Популярные товары
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-full ${activeCategory === cat ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  data-testid={`button-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden border-0 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-lg transition-shadow" data-testid={`card-product-${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-neutral-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.tag && (
                      <Badge className={`absolute top-3 left-3 border-0 ${
                        product.tag === "Хит" ? "bg-amber-500" :
                        product.tag === "Новинка" ? "bg-emerald-500" :
                        product.tag === "Скидка" ? "bg-rose-500" :
                        "bg-green-600"
                      } text-white`}>
                        {product.tag}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-3 right-3 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full ${favorites.includes(product.id) ? 'text-rose-500' : ''}`}
                      onClick={() => toggleFavorite(product.id)}
                      data-testid={`button-favorite-${product.id}`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        className="w-full bg-rose-500 hover:bg-rose-600 rounded-full"
                        onClick={() => addToCart(product.id)}
                        data-testid={`button-add-cart-${product.id}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        В корзину
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-stone-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                      {product.brand}
                    </p>
                    <h3 className="font-medium text-stone-800 dark:text-white mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-stone-600 dark:text-neutral-400">{product.rating}</span>
                      </div>
                      <span className="text-xs text-stone-400 dark:text-neutral-500">
                        ({product.reviews} отзывов)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-stone-800 dark:text-white">{product.price} р</span>
                      {product.oldPrice && (
                        <span className="text-sm text-stone-400 line-through">{product.oldPrice} р</span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-rose-50 dark:bg-rose-950/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-stone-800 dark:text-white mb-4">
            Подпишитесь на рассылку
          </h2>
          <p className="text-stone-600 dark:text-neutral-400 mb-6">
            Получите скидку 15% на первый заказ
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Ваш email"
              className="flex-1 rounded-full"
              data-testid="input-newsletter"
            />
            <Button className="bg-rose-500 hover:bg-rose-600 rounded-full px-8" data-testid="button-newsletter">
              Подписаться
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-white dark:bg-neutral-950 border-t border-stone-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xl font-light tracking-widest text-stone-800 dark:text-white">
              NATURA
            </span>
            <p className="text-sm text-stone-500 dark:text-neutral-400">
              Демо-сайт от WebStudio
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
