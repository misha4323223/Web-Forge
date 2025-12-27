import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Menu, Truck, CreditCard, RefreshCw, ArrowLeft, Plus, X, Minus, Check, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import heroImg from "@assets/generated_images/streetwear_hero_banner_dark.webp";
import hoodieImg from "@assets/generated_images/black_oversized_hoodie_product.webp";
import tshirtImg from "@assets/generated_images/black_t-shirt_product_photo.webp";
import cargoImg from "@assets/generated_images/black_cargo_pants_product.webp";
import bomberImg from "@assets/generated_images/black_bomber_jacket_product.webp";
import bagImg from "@assets/generated_images/black_crossbody_bag_product.webp";
import beanieImg from "@assets/generated_images/black_beanie_hat_product.webp";

const products = [
  {
    id: 1,
    name: "Худи SHADOW Oversize",
    brand: "ТЕНЕВОЙ",
    price: 5990,
    oldPrice: 7490,
    image: hoodieImg,
    tag: "SALE",
    sizes: ["S", "M", "L", "XL"],
    category: "Худи и свитшоты",
  },
  {
    id: 2,
    name: "Футболка БАЗОВАЯ Чёрная",
    brand: "УЛИЦА",
    price: 2490,
    image: tshirtImg,
    tag: "Хит",
    sizes: ["M", "L", "XL"],
    category: "Футболки",
  },
  {
    id: 3,
    name: "Карго ТАКТИК с карманами",
    brand: "НОРД",
    price: 6990,
    image: cargoImg,
    sizes: ["S", "M", "L"],
    category: "Брюки",
  },
  {
    id: 4,
    name: "Бомбер ПИЛОТ Classic",
    brand: "УЛИЦА",
    price: 9990,
    oldPrice: 12990,
    image: bomberImg,
    tag: "SALE",
    sizes: ["M", "L", "XL", "XXL"],
    category: "Куртки",
  },
  {
    id: 5,
    name: "Сумка ПАТРУЛЬ Tactical",
    brand: "ТЕНЕВОЙ",
    price: 2990,
    image: bagImg,
    tag: "New",
    sizes: ["ONE SIZE"],
    category: "Аксессуары",
  },
  {
    id: 6,
    name: "Шапка МОРОЗ Beanie",
    brand: "НОРД",
    price: 1490,
    image: beanieImg,
    sizes: ["ONE SIZE"],
    category: "Аксессуары",
  },
];

const categories = [
  { name: "Все", count: 48 },
  { name: "Худи и свитшоты", count: 12 },
  { name: "Футболки", count: 18 },
  { name: "Брюки", count: 8 },
  { name: "Куртки", count: 6 },
  { name: "Аксессуары", count: 14 },
];

const brands = ["ТЕНЕВОЙ", "УЛИЦА", "НОРД", "БЕТОН", "РАЙОН"];

const features = [
  { icon: Truck, title: "Доставка по всей России", desc: "Курьером до двери" },
  { icon: CreditCard, title: "Оплата частями", desc: "Без процентов" },
  { icon: RefreshCw, title: "Возврат 14 дней", desc: "Без лишних вопросов" },
];

export default function StreetWearShop() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", email: "" });
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "new">("name");
  const { toast } = useToast();
  const productsRef = useRef<HTMLElement>(null);
  const brandsRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "SHADOWSTREET — Streetwear магазин | Худи, бомберы, карго",
    description: "Интернет-магазин уличной моды. Худи, футболки, карго, бомберы, аксессуары. Доставка по России, оплата частями, возврат 14 дней.",
    keywords: "streetwear, худи, одежда, бомбер, карго, интернет-магазин, уличная мода",
    ogTitle: "SHADOWSTREET — Streetwear магазин | Дизайн от MP.WebStudio",
    ogDescription: "Современная уличная мода, качественные материалы, быстрая доставка",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/streetwear",
    canonical: "https://mp-webstudio.ru/demo/streetwear"
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "SHADOWSTREET", url: "https://mp-webstudio.ru/demo/streetwear" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

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

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = activeCategory === "Все" || p.category === activeCategory;
      const matchesBrand = !activeBrand || p.brand === activeBrand;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "new":
          return b.id - a.id;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToBrands = () => brandsRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToFooter = () => footerRef.current?.scrollIntoView({ behavior: "smooth" });
  
  const handleNavClick = (item: string) => {
    setMobileMenuOpen(false);
    if (item === "Каталог") scrollToProducts();
    else if (item === "Бренды") scrollToBrands();
    else if (item === "SALE") {
      setActiveCategory("Все");
      scrollToProducts();
      toast({ title: "Раздел SALE", description: "Скидки на избранные товары!" });
    }
    else if (item === "О нас") scrollToFooter();
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

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800">
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full rounded-md aspect-[3/4] object-cover"
                />
              </div>
              <div>
                <DialogTitle className="text-white text-2xl font-black mb-2">{selectedProduct.name}</DialogTitle>
                <p className="text-amber-500 font-bold uppercase tracking-wider mb-4">{selectedProduct.brand}</p>
                
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-white">{selectedProduct.price.toLocaleString()} р</span>
                  {selectedProduct.oldPrice && (
                    <span className="text-lg text-neutral-500 line-through">{selectedProduct.oldPrice.toLocaleString()} р</span>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-white font-bold mb-3">Размеры</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(size => (
                      <Button
                        key={size}
                        variant="outline"
                        className="border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-500"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-white font-bold mb-2">Описание</h4>
                  <p className="text-neutral-400 text-sm">
                    Качественная вещь от бренда {selectedProduct.brand}. {selectedProduct.tag === "SALE" ? "Со скидкой! " : ""}
                    Хороший выбор для стрита и повседневного образа.
                  </p>
                </div>

                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold mb-3"
                  onClick={() => {
                    addToCart(selectedProduct.id);
                    setSelectedProduct(null);
                    toast({ title: "Добавлено в корзину!" });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить в корзину
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-neutral-700 text-neutral-300 hover:border-amber-500"
                  onClick={() => toggleFavorite(selectedProduct.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedProduct.id) ? "fill-current text-red-500" : ""}`} />
                  {favorites.includes(selectedProduct.id) ? "В избранном" : "Добавить в избранное"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ShoppingCart className="w-5 h-5 text-amber-500" />
              Корзина
            </DialogTitle>
          </DialogHeader>
          
          {orderSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Заказ оформлен!</h3>
              <p className="text-neutral-400">Мы свяжемся с вами для подтверждения</p>
            </div>
          ) : (
            <>
              {cartItems.length === 0 ? (
                <p className="text-center text-neutral-400 py-8">Корзина пуста</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cartItems.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3 p-2 rounded-md bg-neutral-800">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-white">{product.name}</p>
                          <p className="text-sm text-amber-500">{product.price * quantity} р</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400" onClick={() => removeFromCart(product.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm text-white">{quantity}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400" onClick={() => addToCart(product.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => clearItem(product.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-neutral-700 pt-4 mb-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Итого:</span>
                      <span className="text-amber-500">{cartTotal.toLocaleString()} р</span>
                    </div>
                  </div>

                  <form onSubmit={handleOrder} className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-neutral-300">Ваше имя</Label>
                      <Input 
                        id="name" 
                        value={orderForm.name} 
                        onChange={(e) => setOrderForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Иван"
                        className="bg-neutral-800 border-neutral-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-neutral-300">Телефон</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        value={orderForm.phone} 
                        onChange={(e) => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+7 (999) 123-45-67"
                        className="bg-neutral-800 border-neutral-700 text-white"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold">
                      Оформить заказ
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

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
            
            <h1 className="text-xl md:text-2xl font-black tracking-tight shrink-0">
              <span className="text-white">STREET</span>
              <span className="text-amber-500">WEAR</span>
            </h1>
            
            <nav className="hidden lg:flex items-center gap-6">
              {["Каталог", "Бренды", "SALE", "О нас"].map(item => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`text-sm font-medium transition-colors cursor-pointer ${item === "SALE" ? "text-red-500 hover:text-red-400" : "text-neutral-400 hover:text-white"}`}
                  data-testid={`link-nav-${item.toLowerCase()}`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-neutral-400 hover:text-white" data-testid="button-favorites">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="relative text-neutral-400 hover:text-white" onClick={() => setCartOpen(true)} data-testid="button-cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-neutral-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.nav 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-neutral-800 bg-black/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {["Каталог", "Бренды", "SALE", "О нас"].map(item => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`text-left text-sm font-medium py-2 cursor-pointer ${item === "SALE" ? "text-red-500" : "text-neutral-400 hover:text-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </header>

      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img 
          src={heroImg} 
          alt="Streetwear" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <Badge className="mb-4 bg-amber-500 text-black border-0 font-bold">
              НОВАЯ КОЛЛЕКЦИЯ 2024
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black leading-none mb-6">
              РОССИЙСКИЙ
              <br />
              <span className="text-amber-500">СТРИТВИР</span>
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              Лучшие российские бренды уличной одежды. Оригинальный дизайн, качественные материалы, честные цены.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={scrollToProducts} data-testid="button-shop-now">
                Смотреть каталог
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={scrollToBrands} data-testid="button-brands">
                Бренды
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6">
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
                <div className="w-12 h-12 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-neutral-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={brandsRef} className="py-12 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-6">Бренды</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={!activeBrand ? "default" : "outline"}
              className={!activeBrand ? "bg-amber-500 text-black font-bold" : "border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-500"}
              onClick={() => setActiveBrand(null)}
              data-testid="button-brand-all"
            >
              Все
            </Button>
            {brands.map(brand => (
              <Button
                key={brand}
                variant={activeBrand === brand ? "default" : "outline"}
                className={activeBrand === brand ? "bg-amber-500 text-black font-bold" : "border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-500"}
                onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                data-testid={`button-brand-${brand.toLowerCase()}`}
              >
                {brand}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section ref={productsRef} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Категории</h3>
                <div className="flex flex-row lg:flex-col flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`text-left px-4 py-2 rounded-md transition-colors ${
                        activeCategory === cat.name
                          ? "bg-amber-500 text-black font-bold"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                      }`}
                      data-testid={`button-category-${cat.name.toLowerCase()}`}
                    >
                      <span>{cat.name}</span>
                      <span className="ml-2 text-xs opacity-60">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Цена</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-2">От {minPrice.toLocaleString()} р</label>
                    <input
                      type="range"
                      min="0"
                      max="15000"
                      step="500"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-2">До {maxPrice.toLocaleString()} р</label>
                    <input
                      type="range"
                      min="0"
                      max="15000"
                      step="500"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-neutral-800 border-neutral-700 text-white"
                      data-testid="input-search"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 cursor-pointer"
                    data-testid="select-sort"
                  >
                    <option value="name">По названию</option>
                    <option value="price-asc">Цена: по возрастанию</option>
                    <option value="price-desc">Цена: по убыванию</option>
                    <option value="new">Новинки</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black">
                    {activeCategory === "Все" ? "Все товары" : activeCategory}
                  </h2>
                  <span className="text-sm text-neutral-500">{filteredProducts.length} из {products.length}</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden border-0 bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer" data-testid={`card-product-${product.id}`} onClick={() => setSelectedProduct(product)}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-800">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.tag && (
                          <Badge className={`absolute top-3 left-3 border-0 font-bold ${
                            product.tag === "SALE" ? "bg-red-500 text-white" :
                            product.tag === "New" ? "bg-green-500 text-white" :
                            "bg-amber-500 text-black"
                          }`}>
                            {product.tag}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-md ${favorites.includes(product.id) ? 'text-red-500' : 'text-white'}`}
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                          data-testid={`button-favorite-${product.id}`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                            onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                            data-testid={`button-add-cart-${product.id}`}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            В корзину
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">
                          {product.brand}
                        </p>
                        <h3 className="font-bold text-white mb-2">{product.name}</h3>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.sizes.map(size => (
                            <span key={size} className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                              {size}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">{product.price.toLocaleString()} р</span>
                          {product.oldPrice && (
                            <span className="text-sm text-neutral-500 line-through">{product.oldPrice.toLocaleString()} р</span>
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

      <section ref={footerRef} className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">
            Подпишись на <span className="text-amber-500">Telegram</span>
          </h2>
          <p className="text-neutral-400 mb-6 max-w-md mx-auto">
            Скидки, новинки и эксклюзивные дропы первыми. Никакого спама.
          </p>
          <Button size="lg" className="bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold" data-testid="button-telegram">
            Подписаться на канал
          </Button>
        </div>
      </section>

      <footer className="py-12 bg-black border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-2xl font-black">
              <span className="text-white">STREET</span>
              <span className="text-amber-500">WEAR</span>
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
