import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CreditCard, FileText, Check, ArrowLeft, ChevronDown, Plus, Building2 } from "lucide-react";

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
      "Адаптивный дизайн",
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
      "Адаптивный дизайн",
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
      "Навигация",
      "Единый шаблон",
      "Страница контактов",
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
      "Всё из корп. сайта",
      "Каталог товаров",
      "Карточки товаров",
      "Корзина",
      "Оформление заказа",
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

type PaymentMethod = "card" | "invoice";

const orderSchema = z.object({
  clientName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  clientEmail: z.string().email("Введите корректный email"),
  clientPhone: z.string().min(10, "Введите корректный телефон"),
  projectType: z.enum(["bizcard", "landing", "corporate", "shop"]),
  projectDescription: z.string().min(10, "Опишите проект подробнее"),
  contractAccepted: z.literal(true, {
    errorMap: () => ({ message: "Необходимо принять условия договора" }),
  }),
  offerAccepted: z.literal(true, {
    errorMap: () => ({ message: "Необходимо принять публичную оферту" }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Необходимо принять политику конфиденциальности" }),
  }),
  companyName: z.string().optional(),
  companyInn: z.string().optional(),
  companyKpp: z.string().optional(),
  companyAddress: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const formatDate = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `«${day}» ${month} ${year} г.`;
};

const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

const generateContractText = (
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  projectType: string,
  projectDescription: string,
  amount: number,
  selectedFeatureLabels: string[]
) => {
  const projectTypeLabel = projectTypes.find(p => p.value === projectType)?.label || projectType;
  const prepayment = Math.round(amount / 2);
  
  const featuresText = selectedFeatureLabels.length > 0 
    ? `\n\nДополнительные функции:\n${selectedFeatureLabels.map(f => `    • ${f}`).join('\n')}`
    : '';
  
  return `ДОГОВОР ОКАЗАНИЯ УСЛУГ

${formatDate()}

ИСПОЛНИТЕЛЬ: MP.WebStudio, применяющий специальный налоговый режим «Налог на профессиональный доход» (самозанятый), действующий на основании справки о постановке на учёт в качестве плательщика НПД,

и

ЗАКАЗЧИК: ${clientName || "_______________"}
Телефон: ${clientPhone || "_______________"}
Email: ${clientEmail || "_______________"}

совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:

═══════════════════════════════════════════════════════

1. ПРЕДМЕТ ДОГОВОРА

1.1. Исполнитель обязуется оказать Заказчику услуги по разработке:
    ✓ ${projectTypeLabel}${featuresText}

1.2. Описание проекта:
${projectDescription || "Будет согласовано дополнительно"}

1.3. Заказчик обязуется принять и оплатить оказанные услуги.

═══════════════════════════════════════════════════════

2. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ

2.1. Стоимость услуг: ${formatPrice(amount)} рублей

2.2. НДС не облагается на основании п. 8 ст. 2 ФЗ от 27.11.2018 № 422-ФЗ.

2.3. Порядок оплаты:
    • Предоплата 50%: ${formatPrice(prepayment)} рублей — при заключении договора
    • Остаток 50%: ${formatPrice(prepayment)} рублей — после подписания Акта

2.4. Исполнитель формирует чек из приложения «Мой налог» после каждого платежа.

═══════════════════════════════════════════════════════

3. СРОКИ ВЫПОЛНЕНИЯ РАБОТ

3.1. Срок выполнения: от 5 до 20 рабочих дней с момента получения предоплаты и материалов.

3.2. Этапы:
    1) Создание первой версии сайта
    2) Внесение правок (до 3 итераций)
    3) Размещение на хостинге и запуск

═══════════════════════════════════════════════════════

4. ОБЯЗАННОСТИ СТОРОН

4.1. Исполнитель обязуется:
    • Выполнить работы качественно и в срок
    • Предоставлять промежуточные результаты
    • Вносить правки (до 3 итераций)
    • Передать все доступы к готовому сайту

4.2. Заказчик обязуется:
    • Предоставить материалы (логотип, тексты, фото)
    • Своевременно согласовывать результаты (3 рабочих дня)
    • Оплатить услуги в срок

═══════════════════════════════════════════════════════

5. ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА

5.1. Гарантийный срок: 14 календарных дней с даты подписания Акта.

5.2. В течение гарантийного срока бесплатно устраняются технические ошибки.

5.3. Гарантия не распространяется на:
    • Изменения, внесённые Заказчиком или третьими лицами
    • Проблемы с хостингом или доменом

═══════════════════════════════════════════════════════

6. ИНТЕЛЛЕКТУАЛЬНАЯ СОБСТВЕННОСТЬ

6.1. Все права на сайт переходят к Заказчику после полной оплаты.

6.2. Исполнитель вправе использовать результат в портфолио.

═══════════════════════════════════════════════════════

7. АКЦЕПТ ОФЕРТЫ

Оплачивая услуги, Заказчик подтверждает:
    ✓ Ознакомление с условиями договора
    ✓ Согласие с условиями договора
    ✓ Согласие на обработку персональных данных

Акцептом оферты является оплата предоплаты.

═══════════════════════════════════════════════════════

Контакты Исполнителя:
MP.WebStudio | https://mp-webstudio.ru
`;
};

export default function Order() {
  const [selectedType, setSelectedType] = useState<ProjectType>("bizcard");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [expandedType, setExpandedType] = useState<ProjectType | null>("bizcard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      projectType: "bizcard",
      projectDescription: "",
      contractAccepted: false,
      offerAccepted: false,
      privacyAccepted: false,
      companyName: "",
      companyInn: "",
      companyKpp: "",
      companyAddress: "",
    },
  });

  const currentProjectType = projectTypes.find((p) => p.value === selectedType);
  const basePrice = currentProjectType?.basePrice || 0;

  const getAvailableFeatures = (type: ProjectType) => {
    return features.filter((f) => f.availableFor.includes(type));
  };

  const featuresPrice = selectedFeatures.reduce((sum, featureId) => {
    const feature = features.find((f) => f.id === featureId);
    if (feature && feature.availableFor.includes(selectedType)) {
      return sum + feature.price;
    }
    return sum;
  }, 0);

  const totalPrice = basePrice + featuresPrice;
  const prepayment = Math.round(totalPrice / 2);

  const selectedFeatureLabels = selectedFeatures
    .map(id => features.find(f => f.id === id)?.label)
    .filter(Boolean) as string[];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleProjectTypeChange = (value: ProjectType) => {
    setSelectedType(value);
    setExpandedType(value);
    form.setValue("projectType", value);
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

  const getSelectedCountForType = (type: ProjectType) => {
    return selectedFeatures.filter((fId) => {
      const feature = features.find((f) => f.id === fId);
      return feature?.availableFor.includes(type);
    }).length;
  };

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const featuresInfo = selectedFeatures.join(",");
      
      const response = await apiRequest("POST", "/api/orders", {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        projectType: data.projectType,
        projectDescription: data.projectDescription + (featuresInfo ? `\n\nДоп. функции: ${selectedFeatureLabels.join(", ")}` : ""),
        amount: prepayment.toString(),
        selectedFeatures: featuresInfo,
        totalAmount: totalPrice.toString(),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
  });

  const createBankInvoiceMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const featuresInfo = selectedFeatures.join(",");
      
      const response = await apiRequest("POST", "/api/bank-invoice", {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        projectType: data.projectType,
        projectDescription: data.projectDescription + (featuresInfo ? `\n\nДоп. функции: ${selectedFeatureLabels.join(", ")}` : ""),
        amount: prepayment.toString(),
        selectedFeatures: featuresInfo,
        totalAmount: totalPrice.toString(),
        companyName: data.companyName,
        companyInn: data.companyInn,
        companyKpp: data.companyKpp,
        companyAddress: data.companyAddress,
      });
      return response.json();
    },
    onSuccess: () => {
      setInvoiceSuccess(true);
    },
  });

  const onSubmit = (data: OrderFormData) => {
    if (paymentMethod === "invoice") {
      if (!data.companyName || !data.companyInn) {
        form.setError("companyName", { message: "Укажите название компании" });
        form.setError("companyInn", { message: "Укажите ИНН" });
        return;
      }
      createBankInvoiceMutation.mutate(data);
    } else {
      createOrderMutation.mutate(data);
    }
  };

  const isPending = createOrderMutation.isPending || createBankInvoiceMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <a href="/">
              <Button variant="ghost" className="mb-6" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </a>
            <div className="text-center">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
                Оформление заказа
              </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Заказать{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                разработку сайта
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
                Выберите тип сайта, добавьте нужные функции и оформите заказ
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4">1. Выберите основу и доп. опции</h3>
                <RadioGroup
                  value={selectedType}
                  onValueChange={(value) => handleProjectTypeChange(value as ProjectType)}
                  className="space-y-3"
                >
                  {projectTypes.map((type) => {
                    const typeFeatures = getAvailableFeatures(type.value);
                    const selectedCount = getSelectedCountForType(type.value);
                    const isExpanded = expandedType === type.value;
                    const isSelected = selectedType === type.value;

                    return (
                      <div key={type.value} className="space-y-0">
                        <RadioGroupItem
                          value={type.value}
                          id={`order-${type.value}`}
                          className="peer sr-only"
                          data-testid={`radio-${type.value}`}
                        />
                        <Label
                          htmlFor={`order-${type.value}`}
                          className={`flex flex-col p-4 rounded-md border cursor-pointer transition-all hover-elevate ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card/50"
                          } ${isExpanded && isSelected ? "rounded-b-none border-b-0" : ""}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-foreground">{type.label}</span>
                                <span className="text-sm font-mono text-primary">
                                  {formatPrice(type.basePrice)} ₽
                                </span>
                                {selectedCount > 0 && isSelected && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                    +{selectedCount} опций
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
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
                                      data-testid={`feature-${feature.id}`}
                                    >
                                      <Checkbox
                                        checked={selectedFeatures.includes(feature.id)}
                                        onCheckedChange={() => {}}
                                        className="mt-0.5"
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

              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">2. Ваши данные</h3>
                      
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-client-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="clientEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} data-testid="input-client-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="clientPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Телефон</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} data-testid="input-client-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="projectDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Опишите ваш проект</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[100px]"
                              {...field}
                              data-testid="input-project-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-semibold">3. Способ оплаты</h3>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                        className="grid sm:grid-cols-2 gap-3"
                      >
                        <div className="relative">
                          <RadioGroupItem
                            value="card"
                            id="payment-card"
                            className="peer sr-only"
                            data-testid="radio-payment-card"
                          />
                          <Label
                            htmlFor="payment-card"
                            className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all hover-elevate ${
                              paymentMethod === "card"
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card/50"
                            }`}
                          >
                            <CreditCard className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-medium">Картой онлайн</div>
                              <div className="text-xs text-muted-foreground">Для физлиц - картой или электронным кошельком</div>
                            </div>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem
                            value="invoice"
                            id="payment-invoice"
                            className="peer sr-only"
                            data-testid="radio-payment-invoice"
                          />
                          <Label
                            htmlFor="payment-invoice"
                            className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all hover-elevate ${
                              paymentMethod === "invoice"
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card/50"
                            }`}
                          >
                            <Building2 className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-medium">По счёту</div>
                              <div className="text-xs text-muted-foreground">Для юрлиц и ИП</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>

                      <AnimatePresence>
                        {paymentMethod === "invoice" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-md mt-2">
                              <p className="text-sm text-muted-foreground">
                                Заполните реквизиты компании. Счёт будет отправлен на email.
                              </p>
                              
                              <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Название компании *</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-company-name" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid sm:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="companyInn"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>ИНН *</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-company-inn" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="companyKpp"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>КПП (для ООО)</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-company-kpp" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="companyAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Юридический адрес</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-company-address" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="border-t border-border pt-6 space-y-3">
                      <FormField
                        control={form.control}
                        name="offerAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-offer"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                Я принимаю условия{" "}
                                <a href="/offer" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline" data-testid="link-offer">
                                  публичной оферты
                                </a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="privacyAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-privacy"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                Я согласен с{" "}
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline" data-testid="link-privacy">
                                  политикой конфиденциальности
                                </a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contractAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-contract"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                Я ознакомлен и принимаю условия{" "}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button type="button" className="text-primary underline hover:no-underline" data-testid="link-contract">
                                      договора-оферты
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh]">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Договор-оферта
                                      </DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="h-[60vh] pr-4">
                                      <div className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                                        {generateContractText(
                                          form.watch("clientName"),
                                          form.watch("clientEmail"),
                                          form.watch("clientPhone"),
                                          form.watch("projectType"),
                                          form.watch("projectDescription"),
                                          totalPrice,
                                          selectedFeatureLabels
                                        )}
                                      </div>
                                    </ScrollArea>
                                  </DialogContent>
                                </Dialog>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {invoiceSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-center"
                      >
                        <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-foreground mb-2">Счёт отправлен!</h4>
                        <p className="text-sm text-muted-foreground">
                          Проверьте email — мы отправили счёт на оплату.
                          После оплаты свяжитесь с нами для начала работы.
                        </p>
                        <a href="/">
                          <Button type="button" variant="outline" className="mt-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            На главную
                          </Button>
                        </a>
                      </motion.div>
                    ) : (
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                        disabled={isPending}
                        data-testid="button-submit-order"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {paymentMethod === "invoice" ? "Создание счёта..." : "Создание заказа..."}
                          </>
                        ) : paymentMethod === "invoice" ? (
                          <>
                            <Building2 className="w-4 h-4 mr-2" />
                            Получить счёт на {formatPrice(prepayment)} ₽
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Перейти к оплате ({formatPrice(prepayment)} ₽)
                          </>
                        )}
                      </Button>
                    )}
                  </form>
                </Form>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-primary/20 sticky top-24">
                <h3 className="text-lg font-bold mb-4">Ваш заказ</h3>
                
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
                        if (!feature || !feature.availableFor.includes(selectedType)) return null;
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
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Полная стоимость</span>
                    <span className="font-mono font-medium">{formatPrice(totalPrice)} ₽</span>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <span className="font-medium">Предоплата 50%</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {formatPrice(prepayment)} ₽
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-2">
                  <p>* Предоплата 50% для начала работы</p>
                  <p>* Остаток после согласования результата</p>
                  <p>* Безопасная оплата через защищённые платёжные системы</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
