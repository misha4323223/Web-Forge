import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertAdditionalInvoiceSchema, type Order } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Copy, Check, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdditionalInvoiceFormData = {
  orderId: string;
  description: string;
  amount: string;
};

export default function Admin() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOrders, setShowOrders] = useState(false);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const form = useForm<AdditionalInvoiceFormData>({
    resolver: zodResolver(insertAdditionalInvoiceSchema),
    defaultValues: {
      orderId: "",
      description: "",
      amount: "",
    },
  });

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    toast({
      title: "ID скопирован!",
      description: orderId,
    });
  };

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: AdditionalInvoiceFormData) => {
      const res = await apiRequest("POST", "/api/additional-invoices", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Счёт создан!",
          description: "Ссылка на оплату скопирована",
        });
        form.reset();
        
        if (data.paymentUrl) {
          navigator.clipboard.writeText(data.paymentUrl);
          setCopiedId(data.invoiceId);
          setTimeout(() => setCopiedId(null), 2000);
        }
      }
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать счёт",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: AdditionalInvoiceFormData) => {
    createInvoiceMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Выставить дополнительный счёт</h1>

          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID заказа</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите ID заказа (например: a1b2c3d4...)"
                          {...field}
                          data-testid="input-order-id"
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
                      <FormLabel>Описание услуги</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Например: Разработка чат-бота, Дополнительные анимации..."
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сумма (руб)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000"
                          {...field}
                          data-testid="input-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={createInvoiceMutation.isPending}
                  className="w-full"
                  data-testid="button-create-invoice"
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Создание счёта...
                    </>
                  ) : (
                    "Создать счёт"
                  )}
                </Button>
              </form>
            </Form>

            {copiedId && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  Ссылка скопирована в буфер обмена
                </span>
              </div>
            )}
          </Card>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <h3 className="font-semibold mb-2">Как это работает:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Выберите заказ из списка ниже (или введите ID вручную)</li>
              <li>Опишите дополнительную функцию/услугу</li>
              <li>Укажите стоимость</li>
              <li>Нажмите "Создать счёт"</li>
              <li>Ссылка на оплату автоматически скопируется</li>
              <li>Отправьте ссылку клиенту (например, через Telegram)</li>
            </ol>
          </div>

          {orders.length > 0 && (
            <Card className="mt-8 p-6">
              <Button 
                variant="outline" 
                className="w-full flex justify-between"
                onClick={() => setShowOrders(!showOrders)}
                data-testid="button-toggle-orders"
              >
                <span>Список заказов ({orders.length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showOrders ? "rotate-180" : ""}`} />
              </Button>
              
              {showOrders && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="p-3 bg-card/50 rounded-md border flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-muted-foreground truncate">{order.id}</p>
                        <p className="text-sm text-foreground">{order.clientName}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          copyOrderId(order.id);
                          form.setValue("orderId", order.id);
                        }}
                        data-testid={`button-select-order-${order.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
