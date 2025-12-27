import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Gift, Menu, Truck, CreditCard, RefreshCw, ArrowLeft, Plus, X, Minus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";

import giftBoxImg from "@assets/generated_images/classic_socks_gift_box.webp";
import businessImg from "@assets/generated_images/business_socks_gift_set.webp";
import noveltyImg from "@assets/generated_images/novelty_text_pattern_socks.webp";
import athleticImg from "@assets/generated_images/athletic_compression_running_socks.webp";
import colorfulImg from "@assets/generated_images/colorful_patterned_socks_set.webp";
import heroImg from "@assets/generated_images/socks_collection_hero_banner.webp";

const products = [
  {
    id: 1,
    name: "Набор «Классика»",
    description: "5 пар базовых носков",
    price: 1490,
    oldPrice: 1990,
    image: giftBoxImg,
    tag: "Хит",
    category: "Наборы",
  },
  {
    id: 2,
    name: "Набор «Босс»",
    description: "7 пар деловых носков",
    price: 2490,
    image: businessImg,
    tag: "Подарок",
    category: "Наборы",
  },
  {
    id: 3,
    name: "«Без фильтра»",
    description: "Носки с дерзкой надписью",
    price: 490,
    image: noveltyImg,
    tag: "New",
    category: "С надписями",
  },
  {
    id: 4,
    name: "«Царь»",
    description: "Золотая корона на чёрном",
    price: 590,
    oldPrice: 790,
    image: noveltyImg,
    tag: "SALE",
    category: "С надписями",
  },
  {
    id: 5,
    name: "Спорт PRO",
    description: "Компрессионные для бега",
    price: 790,
    image: athleticImg,
    category: "Спорт",
  },
  {
    id: 6,
    name: "Термо АКТИВ",
    description: "Для активного отдыха",
    price: 890,
    image: athleticImg,
    tag: "Зима",
    category: "Спорт",
  },
  {
    id: 7,
    name: "Набор «Яркий»",
    description: "5 пар цветных носков",
    price: 1690,
    image: colorfulImg,
    tag: "Подарок",
    category: "Наборы",
  },
  {
    id: 8,
    name: "«Лучший папа»",
    description: "Подарок для отца",
    price: 490,
    image: noveltyImg,
    category: "С надписями",
  },
];

const categories = [
  { name: "Все", count: 24, icon: null },
  { name: "Наборы", count: 8, icon: Gift },
  { name: "С надписями", count: 10, icon: null },
  { name: "Спорт", count: 6, icon: null },
];

const features = [
  { icon: Truck, title: "Бесплатная доставка", desc: "От 1500 рублей" },
  { icon: Gift, title: "Подарочная упаковка", desc: "Красивая коробка" },
  { icon: RefreshCw, title: "Обмен и возврат", desc: "14 дней" },
];

const heroCategories = [
  {
    title: "Подарочные наборы",
    description: "Огромный выбор ярких носков в наборах для подарка по любому поводу",
    image: giftBoxImg,
    filter: "Наборы",
  },
  {
    title: "Носки с надписями",
    description: "Новая форма выражения. От простых до самых дерзких фраз",
    image: noveltyImg,
    filter: "С надписями",
  },
  {
    title: "Носки для спорта",
    description: "Примечательные носки для любых активностей",
    image: athleticImg,
    filter: "Спорт",
  },
];

export default function SocksShop() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", email: "" });
  const { toast } = useToast();
  const productsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "SockLove — Интернет-магазин носков | Подарочные наборы, спорт",
    description: "Магазин необычных носков. Подарочные наборы, носки с надписями, спортивные. Бесплатная доставка от 1500 ₽. Красивая упаковка и обмен за 14 дней.",
    keywords: "носки, подарок, спортивные носки, интернет-магазин, наборы подарков",
    ogTitle: "SockLove — Магазин носков | Дизайн от MP.WebStudio",
    ogDescription: "Огромный выбор носков для подарков и спорта. Быстрая доставка, красивая упаковка",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/socks",
    canonical: "https://mp-webstudio.ru/demo/socks"
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "SockLove", url: "https://mp-webstudio.ru/demo/socks" }
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
      if (newCart[id] > 1) newCart[id]--;
      else delete newCart[id];
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
    product: products.find(p => p.id === Number(id))!,
    quantity: qty
  })).filter(c => c.product);

  const cartTotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleNavClick = (item: string) => {
    setMobileMenuOpen(false);
    if (item === "Каталог") scrollToProducts();
    else if (item === "Наборы") {
      setActiveCategory("Наборы");
      scrollToProducts();
    }
    else if (item === "SALE") {
      scrollToProducts();
      toast({ title: "Раздел SALE", description: "Скидки на избранные носки!" });
    }
    else if (item === "Доставка") featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone) return;
    setOrderSuccess(true);
    setTimeout(() => {
      setCartOpen(false);
      setOrderSuccess(false);
      setCart({});
      setOrderForm({ name: "", phone: "", email: "" });
    }, 2000);
  };

  const filteredProducts = activeCategory === "Все" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-rose-500" />
              Корзина
            </DialogTitle>
          </DialogHeader>
          
          {orderSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Заказ оформлен!</h3>
              <p className="text-muted-foreground">Мы свяжемся с вами для подтверждения</p>
            </div>
          ) : (
            <>
              {cartItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cartItems.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-sm text-rose-500">{product.price * quantity} р</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeFromCart(product.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{quantity}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addToCart(product.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => clearItem(product.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Итого:</span>
                      <span className="text-rose-500">{cartTotal} р</span>
                    </div>
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
                    <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
                      Оформить заказ
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link href="/#portfolio">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-rose-100/60 border border-rose-200 hover:bg-rose-100/80"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="w-5 h-5 text-rose-600" />
                </Button>
              </Link>
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-rose-500">SOCK</span>
                <span className="text-neutral-900">STYLE</span>
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              {["Каталог", "Наборы", "SALE", "Доставка"].map(item => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`text-sm font-medium transition-colors cursor-pointer ${item === "SALE" ? "text-rose-500 hover:text-rose-400" : "text-neutral-600 hover:text-neutral-900"}`}
                  data-testid={`link-nav-${item.toLowerCase()}`}
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-neutral-600 hover:text-neutral-900" onClick={() => setCartOpen(true)} data-testid="button-cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-neutral-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.nav 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 bg-white"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {["Каталог", "Наборы", "SALE", "Доставка"].map(item => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`text-left text-sm font-medium py-2 cursor-pointer ${item === "SALE" ? "text-rose-500" : "text-neutral-600 hover:text-neutral-900"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </header>

      <section className="py-12 md:py-16 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Стильные <span className="text-rose-500">мужские носки</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-xl mx-auto">
              Подарочные наборы, носки с надписями и для спорта. Яркий подарок для любого случая.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {heroCategories.map((cat, index) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className="group overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => { setActiveCategory(cat.filter); scrollToProducts(); }}
                  data-testid={`card-hero-${cat.filter.toLowerCase()}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={cat.image} 
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-bold mb-1">{cat.title}</h3>
                      <p className="text-sm text-white/80">{cat.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="py-8 border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{feature.title}</h3>
                  <p className="text-sm text-neutral-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={productsRef} className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-48 flex-shrink-0">
              <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Категории</h3>
              <div className="flex flex-row md:flex-col flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`text-left px-4 py-2 rounded-full transition-colors text-sm ${
                      activeCategory === cat.name
                        ? "bg-rose-500 text-white font-bold"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                    data-testid={`button-category-${cat.name.toLowerCase()}`}
                  >
                    {cat.name}
                    <span className="ml-1 opacity-60">({cat.count})</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-black">
                  {activeCategory === "Все" ? "Все товары" : activeCategory}
                </h2>
                <span className="text-sm text-neutral-500">{filteredProducts.length} товаров</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow" data-testid={`card-product-${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-neutral-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.tag && (
                          <Badge className={`absolute top-3 left-3 border-0 font-bold ${
                            product.tag === "SALE" ? "bg-red-500 text-white" :
                            product.tag === "New" ? "bg-green-500 text-white" :
                            product.tag === "Подарок" ? "bg-rose-500 text-white" :
                            product.tag === "Хит" ? "bg-amber-500 text-white" :
                            "bg-blue-500 text-white"
                          }`}>
                            {product.tag}
                          </Badge>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold"
                            onClick={() => addToCart(product.id)}
                            data-testid={`button-add-cart-${product.id}`}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            В корзину
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-rose-500 font-medium uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <h3 className="font-bold text-neutral-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-neutral-500 mb-3">{product.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-neutral-900">{product.price} р</span>
                          {product.oldPrice && (
                            <span className="text-sm text-neutral-400 line-through">{product.oldPrice} р</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-rose-500 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-black mb-4">
            Собери свой набор
          </h2>
          <p className="text-rose-100 mb-6 max-w-md mx-auto">
            Выбери любые носки и мы упакуем их в красивую подарочную коробку
          </p>
          <Button size="lg" className="bg-white text-rose-500 hover:bg-rose-50 font-bold" onClick={scrollToProducts} data-testid="button-create-set">
            Создать набор
          </Button>
        </div>
      </section>

      <footer className="py-12 bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-2xl font-black">
              <span className="text-rose-500">SOCK</span>
              <span className="text-white">STYLE</span>
            </div>
            <p className="text-sm text-neutral-500">
              Демо-сайт от WebStudio
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
