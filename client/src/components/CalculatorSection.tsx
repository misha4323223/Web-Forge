import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calculator, ArrowRight, Check, ChevronDown, Plus, X, Mail, Phone, MapPin } from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import { ParticleBackground } from "./ParticleBackground";

interface FlyingLetterProps {
  letter: string;
  index: number;
  totalLetters: number;
  isGradient?: boolean;
  isInView: boolean;
}

function FlyingLetter({ letter, index, totalLetters, isGradient, isInView }: FlyingLetterProps) {
  const isAndroid = useMemo(() => {
    return /Android/i.test(navigator.userAgent);
  }, []);

  const startPosition = useMemo(() => {
    if (isAndroid) {
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.2,
      };
    }
    const angle = (index / totalLetters) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 200 + Math.random() * 300;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 100,
      rotate: (Math.random() - 0.5) * 180,
      scale: 0.5 + Math.random() * 0.3,
    };
  }, [index, totalLetters, isAndroid]);

  const delay = index * 0.02;

  if (letter === " ") {
    return <span className="inline-block w-[0.3em]">&nbsp;</span>;
  }

  return (
    <motion.span
      className={`inline-block ${isGradient ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" : ""}`}
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        rotate: startPosition.rotate,
        scale: startPosition.scale,
        opacity: 0,
        filter: isAndroid ? "blur(2px)" : "blur(6px)",
      }}
      animate={isInView ? {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      } : {}}
      transition={isAndroid ? {
        duration: 0.4,
        delay: delay,
        ease: "easeOut",
      } : {
        duration: 0.6,
        delay: delay,
        type: "spring",
        stiffness: 120,
        damping: 14,
      }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {letter}
    </motion.span>
  );
}

interface AnimatedTextProps {
  text: string;
  startIndex: number;
  isGradient?: boolean;
  isInView: boolean;
}

function AnimatedText({ text, startIndex, isGradient, isInView }: AnimatedTextProps) {
  const words = text.split(" ");
  let letterIndex = startIndex;

  return (
    <>
      {words.map((word, wordIdx) => {
        const wordStartIndex = letterIndex;
        letterIndex += word.length + 1;
        
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {word.split("").map((letter, i) => (
              <FlyingLetter
                key={i}
                letter={letter}
                index={wordStartIndex + i}
                totalLetters={startIndex + text.length + 10}
                isGradient={isGradient}
                isInView={isInView}
              />
            ))}
            {wordIdx < words.length - 1 && <span className="inline-block w-[0.3em]">&nbsp;</span>}
          </span>
        );
      })}
    </>
  );
}

type ProjectType = "bizcard" | "landing" | "corporate" | "shop";

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
    value: "bizcard",
    label: "Сайт-визитка",
    basePrice: 45000,
    description: "Компактный сайт о вас или компании",
    includes: [
      "Адаптивный дизайн (мобильный + ПК)",
      "Одна страница",
      "Контактная информация",
      "Базовый дизайн",
      "SEO-основа",
      "Хостинг включён",
      "Форма обратной связи",
    ],
  },
  {
    value: "landing",
    label: "Лендинг",
    basePrice: 75000,
    description: "Одностраничный продающий сайт",
    includes: [
      "Адаптивный дизайн (мобильный + ПК)",
      "До 7 секций",
      "Форма обратной связи",
      "Базовые анимации",
      "SEO-основа",
      "Хостинг включён",
      "Система аналитики",
      "Виджеты мессенджеров (WhatsApp, Telegram)",
      "Email-уведомления",
    ],
  },
  {
    value: "corporate",
    label: "Корпоративный сайт",
    basePrice: 140000,
    description: "Многостраничный сайт компании со всеми необходимыми инструментами",
    includes: [
      "Всё из лендинга",
      "До 10 страниц",
      "Навигация между страницами",
      "Единый шаблон дизайна",
      "Страница контактов с картой",
      "Галерея / Портфолио",
      "Блог / Новости",
      "Система аналитики",
    ],
  },
  {
    value: "shop",
    label: "Интернет-магазин",
    basePrice: 200000,
    description: "Полнофункциональный магазин со всеми инструментами",
    includes: [
      "Всё из корпоративного сайта",
      "Каталог товаров",
      "Карточки товаров",
      "Корзина покупок",
      "Оформление заказа",
      "Категории товаров",
      "Онлайн-оплата (платёжные системы)",
      "Интеграция доставки",
      "Фильтры и сортировка товаров",
      "Личные кабинеты клиентов",
      "Email-уведомления",
      "Поиск по сайту",
      "Блог / Новости",
      "Админ-панель",
      "Система аутентификации (для админки)",
      "Система аналитики",
    ],
  },
];

const features: Feature[] = [
  { id: "extra_pages_bizcard", label: "Доп. страницы (3 шт)", price: 8000, description: "Сверх базовых", availableFor: ["bizcard"] },
  { id: "map", label: "Карта с адресом", price: 5000, description: "Интерактивная карта", availableFor: ["bizcard"] },
  { id: "calculator", label: "Калькулятор стоимости", price: 12000, description: "Интерактивный расчёт", availableFor: ["landing", "corporate", "shop"] },
  { id: "gallery", label: "Галерея / Портфолио", price: 10000, description: "Слайдер с лайтбоксом", availableFor: ["bizcard", "landing", "shop"] },
  { id: "messengers", label: "Виджеты мессенджеров", price: 7000, description: "WhatsApp, Telegram", availableFor: ["bizcard", "corporate", "shop"] },
  { id: "email_notify", label: "Email-уведомления", price: 10000, description: "Письма о заявках", availableFor: ["corporate"] },
  { id: "telegram_notify", label: "Telegram-уведомления", price: 12000, description: "Заявки в Telegram-бот", availableFor: ["landing", "corporate", "shop"] },
  { id: "animations", label: "Продвинутые анимации", price: 20000, description: "Параллакс, 3D-эффекты", availableFor: ["bizcard", "landing", "corporate", "shop"] },
  { id: "chat_widget", label: "Чат-виджет поддержки", price: 7000, description: "Онлайн-чат с клиентами", availableFor: ["bizcard", "landing", "corporate", "shop"] },
  { id: "popup", label: "Pop-up окна", price: 7000, description: "При выходе, по таймеру", availableFor: ["landing", "corporate", "shop"] },
  { id: "countdown", label: "Таймер акции", price: 5000, description: "Обратный отсчёт", availableFor: ["landing", "corporate", "shop"] },
  { id: "multilang", label: "Мультиязычность", price: 30000, description: "2+ языка", availableFor: ["bizcard", "landing", "corporate", "shop"] },
  { id: "extra_sections", label: "Доп. секции (5 шт)", price: 12000, description: "Сверх базовых", availableFor: ["landing"] },
  { id: "extra_pages", label: "Доп. страницы (5 шт)", price: 20000, description: "Сверх базовых", availableFor: ["corporate"] },
  { id: "blog", label: "Блог / Новости", price: 35000, description: "Раздел статей", availableFor: [] },
  { id: "search", label: "Поиск по сайту", price: 15000, description: "Умный поиск", availableFor: ["corporate"] },
  { id: "team", label: "Страница команды", price: 10000, description: "Карточки сотрудников", availableFor: ["corporate"] },
  { id: "booking", label: "Онлайн-запись", price: 35000, description: "Календарь бронирования", availableFor: ["landing", "corporate"] },
  { id: "payment", label: "Онлайн-оплата", price: 35000, description: "Платёжные системы", availableFor: ["landing", "corporate"] },
  { id: "crm", label: "Интеграция CRM", price: 45000, description: "Синхронизация с CRM-системой", availableFor: ["landing", "corporate", "shop"] },
  { id: "filters", label: "Фильтры и сортировка", price: 20000, description: "По параметрам товаров", availableFor: [] },
  { id: "favorites", label: "Избранное", price: 10000, description: "Сохранение товаров", availableFor: ["shop"] },
  { id: "customer_accounts", label: "Личные кабинеты клиентов", price: 20000, description: "История заказов, сохранённые адреса", availableFor: [] },
  { id: "telegram_shop", label: "Telegram-магазин", price: 50000, description: "Мини-приложение", availableFor: ["shop"] },
  { id: "delivery", label: "Интеграция доставки", price: 30000, description: "Служба логистики", availableFor: [] },
  { id: "ai_integration", label: "Интеграция ИИ", price: 60000, description: "Чат-бот, рекомендации товаров", availableFor: ["corporate", "shop"] },
  { id: "custom", label: "Другое / Индивидуальная функция", price: 0, description: "Обсудим отдельно", availableFor: ["bizcard", "landing", "corporate", "shop"] },
  { id: "exclusive_design", label: "Эксклюзивный дизайн", price: 30000, description: "Уникальный кастомный дизайн", availableFor: ["bizcard", "landing", "corporate", "shop"] },
];

type CalculatorFormData = {
  name: string;
  phone: string;
  email: string;
  description: string;
};

export function CalculatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [projectType, setProjectType] = useState<ProjectType>("bizcard");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [expandedType, setExpandedType] = useState<ProjectType | null>("bizcard");
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const { toast } = useToast();

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(z.object({
      name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
      phone: z.string().min(10, "Введите корректный номер телефона"),
      email: z.string().email("Введите корректный email"),
      description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
    })),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CalculatorFormData) => {
      const currentProjectType = projectTypes.find((p) => p.value === projectType)!;
      const currentBasePrice = currentProjectType?.basePrice || 0;
      
      const currentFeaturesPrice = selectedFeatures.reduce((sum, featureId) => {
        const feature = features.find((f) => f.id === featureId);
        if (feature && feature.availableFor.includes(projectType)) {
          return sum + feature.price;
        }
        return sum;
      }, 0);
      
      const currentTotalPrice = currentBasePrice + currentFeaturesPrice;

      const selectedFeaturesList = selectedFeatures
        .map((fId) => {
          const feature = features.find((f) => f.id === fId);
          return feature ? `${feature.label} (+${feature.price} ₽)` : null;
        })
        .filter(Boolean);

      const response = await apiRequest("POST", "/api/send-calculator-order", {
        ...data,
        projectType,
        selectedFeatures: selectedFeaturesList,
        basePrice: currentBasePrice,
        totalPrice: currentTotalPrice,
      });
      return response.json();
    },
    onSuccess: () => {
      setOpenOrderModal(false);
      form.reset();
      toast({
        title: "Заказ отправлен!",
        description: "Мы получили вашу заявку и свяжемся с вами вскоре.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заказ. Попробуйте позже.",
        variant: "destructive",
      });
    },
  });

  const currentProjectType = projectTypes.find((p) => p.value === projectType);
  const basePrice = currentProjectType?.basePrice || 0;

  const getAvailableFeatures = (type: ProjectType) => {
    return features.filter((f) => f.availableFor.includes(type));
  };

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
    setExpandedType(value);
    setSelectedFeatures((prev) =>
      prev.filter((featureId) => {
        const feature = features.find((f) => f.id === featureId);
        return feature?.availableFor.includes(value);
      })
    );
  };

  const toggleExpanded = (type: ProjectType) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const getSelectedCountForType = (type: ProjectType) => {
    return selectedFeatures.filter((fId) => {
      const feature = features.find((f) => f.id === fId);
      return feature?.availableFor.includes(type);
    }).length;
  };

  const line1 = "Готовы ";
  const line2 = "начать проект?";

  return (
    <section id="calculator" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.08),transparent_50%)]" />
      </div>

      <ParticleBackground />

      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="absolute top-1/4 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="neon-badge">
              <span className="neon-badge-text">Расчёт стоимости / Контакты</span>
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 overflow-hidden">
            <AnimatedText text={line1} startIndex={0} isInView={isInView} />
            <div className="block sm:inline">
              <AnimatedText text={line2} startIndex={line1.length} isGradient isInView={isInView} />
            </div>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Выберите тип сайта и добавьте нужные функции — цена рассчитается автоматически
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-muted-foreground text-base max-w-2xl mx-auto pt-2"
          >
            Оставьте заявку и мы свяжемся с вами для бесплатной консультации
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4">Выберите основу и доп. опции</h3>
              <RadioGroup
                value={projectType}
                onValueChange={(value) => handleProjectTypeChange(value as ProjectType)}
                className="space-y-4"
              >
                {projectTypes.map((type) => {
                  const typeFeatures = getAvailableFeatures(type.value);
                  const selectedCount = getSelectedCountForType(type.value);
                  const isExpanded = expandedType === type.value;
                  const isSelected = projectType === type.value;

                  return (
                    <div key={type.value} className="space-y-0">
                      <RadioGroupItem
                        value={type.value}
                        id={type.value}
                        className="peer sr-only"
                        data-testid={`radio-input-${type.value}`}
                      />
                      <Label
                        htmlFor={type.value}
                        className={`flex flex-col p-4 rounded-md border cursor-pointer transition-all hover-elevate ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card/50"
                        } ${isExpanded && isSelected ? "rounded-b-none border-b-0" : ""}`}
                        data-testid={`radio-label-${type.value}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg text-foreground">{type.label}</span>
                              <span className="text-sm font-mono text-primary">
                                {formatPrice(type.basePrice)} ₽
                              </span>
                              {selectedCount > 0 && isSelected && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                  +{selectedCount} опций
                                </span>
                              )}
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
                          {isSelected && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpanded(type.value); }}
                              className="shrink-0 gap-1"
                              data-testid={`button-expand-${type.value}`}
                            >
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Опции</span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </Button>
                          )}
                        </div>
                      </Label>

                      <AnimatePresence>
                        {isExpanded && isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-primary/5 border border-primary border-t-0 rounded-b-md">
                              <p className="text-sm text-muted-foreground mb-3">
                                Доп. опции для «{type.label}»:
                              </p>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {typeFeatures.map((feature) => (
                                  <div
                                    key={feature.id}
                                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                                      selectedFeatures.includes(feature.id)
                                        ? "border-primary bg-background/80"
                                        : "border-border/50 bg-background/40"
                                    }`}
                                    onClick={(e) => { e.stopPropagation(); toggleFeature(feature.id); }}
                                    data-testid={`checkbox-container-${feature.id}`}
                                  >
                                    <Checkbox
                                      checked={selectedFeatures.includes(feature.id)}
                                      onCheckedChange={() => {}}
                                      className="mt-0.5"
                                      data-testid={`checkbox-${feature.id}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-foreground">{feature.label}</span>
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
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </RadioGroup>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
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

              <p className="text-xs text-muted-foreground mb-4">
                * Окончательная стоимость определяется после обсуждения деталей проекта
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => setOpenOrderModal(true)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  data-testid="button-send-order"
                >
                  Отправить заявку
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="/order" className="block">
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                    data-testid="button-calculator-cta"
                  >
                    Заказать сайт
                  </Button>
                </a>
              </div>
            </Card>

            <div className="mt-6 p-6 rounded-md bg-card/50 border border-border backdrop-blur-sm">
              <h4 className="font-bold mb-4 text-base">Свяжитесь с нами</h4>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3" data-testid="contact-info-email">
                  <div className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <a href="mailto:mpwebstudio1@gmail.com" className="text-sm text-foreground font-medium hover:text-primary transition-colors">
                      mpwebstudio1@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3" data-testid="contact-info-phone">
                  <div className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Телефон</div>
                    <a href="tel:+79531814136" className="text-sm text-foreground font-medium hover:text-primary transition-colors">
                      +7 (953) 181-41-36
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3" data-testid="contact-info-location">
                  <div className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Город</div>
                    <div className="text-sm text-foreground font-medium">Тула, Россия</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-md bg-background/50 border border-border">
                <h5 className="font-bold mb-3 text-sm">Мессенджеры</h5>
                <div className="flex gap-2">
                  <a href="https://t.me/MPWebStudio_ru" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10"
                      data-testid="button-contact-telegram"
                    >
                      <SiTelegram className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="https://wa.me/79531814136" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10"
                      data-testid="button-contact-whatsapp"
                    >
                      <SiWhatsapp className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={openOrderModal} onOpenChange={setOpenOrderModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-order-modal">
          <DialogHeader>
            <DialogTitle>Оформить заказ</DialogTitle>
            <DialogDescription>
              Заполните форму ниже, чтобы отправить заказ. Слева указаны выбранные услуги и итоговая стоимость.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-card/50 rounded-md border border-border">
                <h3 className="font-bold mb-3 text-sm">Состав заказа</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {projectTypes.find((p) => p.value === projectType)?.label}
                    </span>
                    <span className="font-mono">{formatPrice(basePrice)} ₽</span>
                  </div>
                  {selectedFeatures.length > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      {selectedFeatures.map((featureId) => {
                        const feature = features.find((f) => f.id === featureId);
                        if (!feature || !feature.availableFor.includes(projectType)) return null;
                        return (
                          <div key={featureId} className="flex justify-between">
                            <span className="text-muted-foreground truncate mr-2">{feature.label}</span>
                            <span className="font-mono whitespace-nowrap">+{formatPrice(feature.price)} ₽</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Итого:</span>
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {formatPrice(totalPrice)} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ваше имя *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Иван Иванов"
                          {...field}
                          className="bg-background/50"
                          data-testid="input-order-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          {...field}
                          className="bg-background/50"
                          data-testid="input-order-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ivan@example.com"
                          {...field}
                          className="bg-background/50"
                          data-testid="input-order-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание проекта *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Расскажите о вашем проекте..."
                          rows={4}
                          {...field}
                          className="bg-background/50 resize-none"
                          data-testid="input-order-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  disabled={mutation.isPending}
                  data-testid="button-submit-order"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Отправляем...
                    </span>
                  ) : (
                    "Заказать"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
