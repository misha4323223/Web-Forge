import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
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
import { Loader2, CreditCard, FileText, Check } from "lucide-react";

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
      "Адаптивный дизайн",
      "До 7 секций",
      "Форма обратной связи",
      "Базовые анимации",
      "SEO-основа",
      "Хостинг",
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
      "Навигация",
      "Единый шаблон",
      "Страница контактов",
    ],
  },
  {
    value: "shop",
    label: "Интернет-магазин",
    basePrice: 80000,
    description: "Каталог, корзина, оформление заказа",
    includes: [
      "Всё из корп. сайта",
      "Каталог товаров",
      "Карточки товаров",
      "Корзина",
      "Оформление заказа",
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

const orderSchema = z.object({
  clientName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  clientEmail: z.string().email("Введите корректный email"),
  clientPhone: z.string().min(10, "Введите корректный телефон"),
  projectType: z.enum(["landing", "corporate", "shop"]),
  projectDescription: z.string().min(10, "Опишите проект подробнее"),
  contractAccepted: z.literal(true, {
    errorMap: () => ({ message: "Необходимо принять условия договора" }),
  }),
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
  const [selectedType, setSelectedType] = useState<ProjectType>("landing");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      projectType: "landing",
      projectDescription: "",
    },
  });

  const currentProjectType = projectTypes.find((p) => p.value === selectedType);
  const basePrice = currentProjectType?.basePrice || 0;

  const availableFeatures = useMemo(() => {
    return features.filter((f) => f.availableFor.includes(selectedType));
  }, [selectedType]);

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
    form.setValue("projectType", value);
    setSelectedFeatures((prev) =>
      prev.filter((featureId) => {
        const feature = features.find((f) => f.id === featureId);
        return feature?.availableFor.includes(value);
      })
    );
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

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
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
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4">1. Выберите основу сайта</h3>
                <RadioGroup
                  value={selectedType}
                  onValueChange={(value) => handleProjectTypeChange(value as ProjectType)}
                  className="space-y-3"
                >
                  {projectTypes.map((type) => (
                    <div key={type.value}>
                      <RadioGroupItem
                        value={type.value}
                        id={`order-${type.value}`}
                        className="peer sr-only"
                        data-testid={`radio-${type.value}`}
                      />
                      <Label
                        htmlFor={`order-${type.value}`}
                        className="flex flex-col p-4 rounded-md border border-border bg-card/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover-elevate"
                      >
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span className="font-bold text-foreground">{type.label}</span>
                          <span className="text-sm font-mono text-primary">
                            {formatPrice(type.basePrice)} ₽
                          </span>
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
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </Card>

              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">2. Дополнительные функции</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Выберите опции для расширения возможностей сайта
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {availableFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                        selectedFeatures.includes(feature.id)
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card/50"
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                      data-testid={`feature-${feature.id}`}
                    >
                      <Checkbox
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="mt-0.5"
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

              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">3. Ваши данные</h3>
                      
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                              <Input placeholder="Иван Иванов" {...field} data-testid="input-client-name" />
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
                                <Input type="email" placeholder="email@example.com" {...field} data-testid="input-client-email" />
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
                                <Input type="tel" placeholder="+7 (999) 123-45-67" {...field} data-testid="input-client-phone" />
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
                              placeholder="Расскажите о вашем бизнесе, целях сайта, желаемом функционале..."
                              className="min-h-[100px]"
                              {...field}
                              data-testid="input-project-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t border-border pt-6">
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

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                      disabled={createOrderMutation.isPending}
                      data-testid="button-submit-order"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Создание заказа...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Перейти к оплате ({formatPrice(prepayment)} ₽)
                        </>
                      )}
                    </Button>
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
                  <p>* Безопасная оплата через Robokassa</p>
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
