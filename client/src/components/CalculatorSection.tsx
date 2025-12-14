import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, ArrowRight, Check } from "lucide-react";

type ProjectType = "landing" | "corporate" | "shop";

interface Feature {
  id: string;
  label: string;
  price: number;
  description?: string;
  availableFor: ProjectType[];
}

interface ProjectTypeConfig {
  value: ProjectType;
  label: string;
  basePrice: number;
  description: string;
  includes: string[];
}

const projectTypes: ProjectTypeConfig[] = [
  {
    value: "landing",
    label: "Лендинг",
    basePrice: 15000,
    description: "Одностраничный продающий сайт",
    includes: [
      "Адаптивный дизайн (мобильный + ПК)",
      "До 7 секций",
      "Форма обратной связи",
      "Базовые анимации",
      "SEO-основа",
      "Хостинг на Яндекс Cloud",
    ],
  },
  {
    value: "corporate",
    label: "Корпоративный сайт",
    basePrice: 40000,
    description: "Многостраничный сайт компании",
    includes: [
      "Всё из лендинга",
      "До 10 страниц",
      "Навигация между страницами",
      "Единый шаблон дизайна",
      "Страница контактов с картой",
    ],
  },
  {
    value: "shop",
    label: "Интернет-магазин",
    basePrice: 80000,
    description: "Каталог, корзина, оформление заказа",
    includes: [
      "Всё из корпоративного сайта",
      "Каталог товаров",
      "Карточки товаров",
      "Корзина покупок",
      "Оформление заказа",
      "Категории товаров",
    ],
  },
];

const features: Feature[] = [
  { id: "calculator", label: "Калькулятор стоимости", price: 5000, description: "Интерактивный расчёт", availableFor: ["landing", "corporate", "shop"] },
  { id: "gallery", label: "Галерея / Портфолио", price: 5000, description: "Слайдер с лайтбоксом", availableFor: ["landing", "corporate", "shop"] },
  { id: "messengers", label: "Виджеты мессенджеров", price: 3000, description: "WhatsApp, Telegram", availableFor: ["landing", "corporate", "shop"] },
  { id: "analytics", label: "Яндекс.Метрика", price: 3000, description: "Подключение аналитики", availableFor: ["landing", "corporate", "shop"] },
  { id: "email_notify", label: "Email-уведомления", price: 5000, description: "Письма о заявках", availableFor: ["landing", "corporate", "shop"] },
  { id: "telegram_notify", label: "Telegram-уведомления", price: 5000, description: "Заявки в Telegram-бот", availableFor: ["landing", "corporate", "shop"] },
  { id: "animations", label: "Продвинутые анимации", price: 8000, description: "Параллакс, 3D-эффекты", availableFor: ["landing", "corporate", "shop"] },
  { id: "chat_widget", label: "Чат-виджет", price: 3000, description: "Jivo, Tawk.to", availableFor: ["landing", "corporate", "shop"] },
  { id: "popup", label: "Pop-up окна", price: 3000, description: "При выходе, по таймеру", availableFor: ["landing", "corporate", "shop"] },
  { id: "countdown", label: "Таймер акции", price: 2000, description: "Обратный отсчёт", availableFor: ["landing", "corporate", "shop"] },
  { id: "multilang", label: "Мультиязычность", price: 10000, description: "2+ языка", availableFor: ["landing", "corporate", "shop"] },
  { id: "extra_sections", label: "Доп. секции (5 шт)", price: 5000, description: "Сверх базовых", availableFor: ["landing"] },
  { id: "extra_pages", label: "Доп. страницы (5 шт)", price: 10000, description: "Сверх базовых", availableFor: ["corporate"] },
  { id: "blog", label: "Блог / Новости", price: 15000, description: "Раздел статей", availableFor: ["corporate", "shop"] },
  { id: "search", label: "Поиск по сайту", price: 8000, description: "Умный поиск", availableFor: ["corporate", "shop"] },
  { id: "team", label: "Страница команды", price: 5000, description: "Карточки сотрудников", availableFor: ["corporate"] },
  { id: "booking", label: "Онлайн-запись", price: 15000, description: "Календарь бронирования", availableFor: ["landing", "corporate"] },
  { id: "payment", label: "Онлайн-оплата", price: 15000, description: "Robokassa / ЮKassa", availableFor: ["landing", "corporate", "shop"] },
  { id: "crm", label: "Интеграция CRM", price: 20000, description: "AmoCRM, Bitrix24", availableFor: ["landing", "corporate", "shop"] },
  { id: "filters", label: "Фильтры и сортировка", price: 10000, description: "По параметрам товаров", availableFor: ["shop"] },
  { id: "favorites", label: "Избранное", price: 5000, description: "Сохранение товаров", availableFor: ["shop"] },
  { id: "admin", label: "Админ-панель", price: 25000, description: "Управление товарами", availableFor: ["shop"] },
  { id: "telegram_shop", label: "Telegram-магазин", price: 20000, description: "Мини-приложение", availableFor: ["shop"] },
  { id: "delivery", label: "Интеграция доставки", price: 15000, description: "СДЭК, Boxberry", availableFor: ["shop"] },
];

export function CalculatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [projectType, setProjectType] = useState<ProjectType>("landing");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const currentProjectType = projectTypes.find((p) => p.value === projectType);
  const basePrice = currentProjectType?.basePrice || 0;

  const availableFeatures = useMemo(() => {
    return features.filter((f) => f.availableFor.includes(projectType));
  }, [projectType]);

  const featuresPrice = selectedFeatures.reduce((sum, featureId) => {
    const feature = features.find((f) => f.id === featureId);
    if (feature && feature.availableFor.includes(projectType)) {
      return sum + feature.price;
    }
    return sum;
  }, 0);

  const totalPrice = basePrice + featuresPrice;

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleProjectTypeChange = (value: ProjectType) => {
    setProjectType(value);
    setSelectedFeatures((prev) =>
      prev.filter((featureId) => {
        const feature = features.find((f) => f.id === featureId);
        return feature?.availableFor.includes(value);
      })
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  return (
    <section id="calculator" className="py-24 md:py-32 relative overflow-hidden bg-card/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
            Калькулятор
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Рассчитайте{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              стоимость проекта
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Выберите тип сайта и добавьте нужные функции — цена рассчитается автоматически
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4">Выберите основу</h3>
              <RadioGroup
                value={projectType}
                onValueChange={(value) => handleProjectTypeChange(value as ProjectType)}
                className="space-y-4"
              >
                {projectTypes.map((type) => (
                  <div key={type.value}>
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="peer sr-only"
                      data-testid={`radio-input-${type.value}`}
                    />
                    <Label
                      htmlFor={type.value}
                      className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-md border border-border bg-card/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover-elevate"
                      data-testid={`radio-label-${type.value}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-lg text-foreground">{type.label}</span>
                          <span className="text-sm font-mono text-primary">
                            {formatPrice(type.basePrice)} ₽
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {type.includes.map((item, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-emerald-500" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-2">Дополнительные функции</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Выберите опции для расширения возможностей сайта
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {availableFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`flex items-start gap-3 p-4 rounded-md border cursor-pointer transition-all ${
                      selectedFeatures.includes(feature.id)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card/50"
                    }`}
                    onClick={() => toggleFeature(feature.id)}
                    data-testid={`checkbox-container-${feature.id}`}
                  >
                    <Checkbox
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      className="mt-0.5"
                      data-testid={`checkbox-${feature.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{feature.label}</span>
                        <span className="text-xs font-mono text-primary whitespace-nowrap">
                          +{formatPrice(feature.price)} ₽
                        </span>
                      </div>
                      {feature.description && (
                        <span className="text-xs text-muted-foreground">{feature.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-primary/20 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Итого</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{currentProjectType?.label}</span>
                  <span className="font-mono">{formatPrice(basePrice)} ₽</span>
                </div>
                {selectedFeatures.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    {selectedFeatures.map((featureId) => {
                      const feature = features.find((f) => f.id === featureId);
                      if (!feature || !feature.availableFor.includes(projectType)) return null;
                      return (
                        <div key={featureId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate mr-2">{feature.label}</span>
                          <span className="font-mono whitespace-nowrap">+{formatPrice(feature.price)} ₽</span>
                        </div>
                      );
                    })}
                  </>
                )}
                <div className="h-px bg-border" />
                <div className="flex justify-between items-end pt-2">
                  <span className="font-medium">Стоимость</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {formatPrice(totalPrice)} ₽
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-6">
                * Окончательная стоимость определяется после обсуждения деталей проекта
              </p>

              <a href="/order">
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  data-testid="button-calculator-cta"
                >
                  Заказать сайт
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
