import { useState } from "react";
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
import { Loader2, CreditCard, FileText } from "lucide-react";

const projectTypes = [
  { value: "landing", label: "Лендинг", price: 25000, description: "Одностраничный продающий сайт" },
  { value: "corporate", label: "Корпоративный сайт", price: 60000, description: "Многостраничный сайт компании" },
  { value: "shop", label: "Интернет-магазин", price: 120000, description: "Каталог, корзина, оплата" },
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

const contractText = `
ДОГОВОР-ОФЕРТА НА ОКАЗАНИЕ УСЛУГ

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящий документ является публичной офертой и содержит условия договора на оказание услуг по разработке веб-сайтов.

1.2. Акцептом оферты является оплата услуг. Оплачивая услуги, Заказчик подтверждает согласие с условиями настоящего договора.

2. ПРЕДМЕТ ДОГОВОРА

2.1. Исполнитель обязуется оказать Заказчику услуги по разработке веб-сайта согласно выбранному тарифу.

2.2. Заказчик обязуется принять и оплатить оказанные услуги.

3. ПОРЯДОК ОКАЗАНИЯ УСЛУГ

3.1. Предоплата составляет 50% от стоимости проекта.

3.2. Срок выполнения работ — от 5 до 20 рабочих дней в зависимости от типа проекта.

3.3. После получения первой версии сайта Заказчик имеет право на 3 итерации правок.

4. ГАРАНТИИ

4.1. Гарантийный срок на выполненные работы — 14 календарных дней.

4.2. В течение гарантийного срока бесплатно устраняются технические ошибки.

5. ПРАВА НА РЕЗУЛЬТАТ

5.1. Все права на созданный сайт переходят к Заказчику после полной оплаты.

5.2. Исполнитель вправе использовать результат в портфолио.

Полная версия договора доступна в файле CONTRACT_TEMPLATE.md
`;

export default function Order() {
  const [selectedType, setSelectedType] = useState<string>("corporate");

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      projectType: "corporate",
      projectDescription: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const selectedProject = projectTypes.find((p) => p.value === data.projectType);
      const amount = selectedProject?.price.toString() || "60000";
      
      const response = await apiRequest("POST", "/api/orders", {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        projectType: data.projectType,
        projectDescription: data.projectDescription,
        amount,
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

  const selectedProject = projectTypes.find((p) => p.value === selectedType);
  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
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
              Заполните форму, примите условия договора и внесите предоплату 50%
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Ваши данные</h3>
                      
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

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Тип проекта</h3>
                      
                      <FormField
                        control={form.control}
                        name="projectType"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedType(value);
                                }}
                                className="grid sm:grid-cols-2 gap-4"
                              >
                                {projectTypes.map((type) => (
                                  <div key={type.value}>
                                    <RadioGroupItem
                                      value={type.value}
                                      id={type.value}
                                      className="peer sr-only"
                                      data-testid={`radio-${type.value}`}
                                    />
                                    <Label
                                      htmlFor={type.value}
                                      className="flex flex-col p-4 rounded-md border border-border bg-card/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover-elevate"
                                    >
                                      <span className="font-medium">{type.label}</span>
                                      <span className="text-sm text-muted-foreground">{type.description}</span>
                                      <span className="text-sm font-mono text-primary mt-2">
                                        от {formatPrice(type.price)} ₽
                                      </span>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                              className="min-h-[120px]"
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
                                      <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                                        {contractText}
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
                          Перейти к оплате
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
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тип сайта</span>
                    <span className="font-medium">{selectedProject?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Стоимость</span>
                    <span className="font-mono">{formatPrice(selectedProject?.price || 0)} ₽</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Предоплата 50%</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {formatPrice((selectedProject?.price || 0) / 2)} ₽
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
