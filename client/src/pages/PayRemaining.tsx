import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://functions.yandexcloud.net/d4ed08qj9rekklj8b100";

export default function PayRemaining() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const orderIdFromUrl = searchParams.get("orderId") || "";
  
  const [orderId, setOrderId] = useState(orderIdFromUrl);
  const [submitted, setSubmitted] = useState(!!orderIdFromUrl);

  const { data: orderData, isLoading: isLoadingOrder, error: orderError } = useQuery({
    queryKey: ['/api/orders', orderId],
    queryFn: async () => {
      // Используем Yandex Cloud Function API для получения заказа из YDB
      const apiUrl = `${API_BASE_URL}?action=orders/${orderId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Заказ не найден");
      }
      return response.json();
    },
    enabled: submitted && orderId.length > 0,
  });

  const payRemainingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders/pay-remaining", {
        orderId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSubmitted(true);
    }
  };

  const handlePayRemaining = () => {
    payRemainingMutation.mutate();
  };

  const order = orderData;
  const remainingAmount = order ? Math.round(parseFloat(order.totalAmount || order.amount) - parseFloat(order.amount)) : 0;
  const isPrepaid = order?.status === "paid";
  const isFullyPaid = order?.status === "completed";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="mb-6"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
            
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
                Оплата остатка
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Оплата{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  второго транша
                </span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Введите номер заказа для оплаты оставшейся суммы после сдачи проекта
              </p>
            </div>
          </motion.div>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="orderId">Номер заказа</Label>
                    <Input
                      id="orderId"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Введите номер заказа"
                      className="mt-2"
                      data-testid="input-order-id"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Номер заказа указан в договоре и письме с подтверждением оплаты
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                    disabled={!orderId.trim()}
                    data-testid="button-find-order"
                  >
                    Найти заказ
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : isLoadingOrder ? (
            <Card className="p-8 text-center bg-background/50 border-border backdrop-blur-sm">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Загрузка информации о заказе...</p>
            </Card>
          ) : orderError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-8 text-center bg-background/50 border-border backdrop-blur-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold mb-2">Заказ не найден</h2>
                <p className="text-muted-foreground mb-6">
                  Проверьте правильность номера заказа и попробуйте снова
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  data-testid="button-try-again"
                >
                  Попробовать снова
                </Button>
              </Card>
            </motion.div>
          ) : isFullyPaid ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 text-center bg-background/50 border-border backdrop-blur-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Заказ полностью оплачен</h2>
                <p className="text-muted-foreground mb-4">
                  Этот заказ уже оплачен полностью. Спасибо!
                </p>
                <div className="bg-card/50 rounded-md p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Номер заказа</p>
                  <p className="font-mono text-lg">{orderId.substring(0, 8).toUpperCase()}</p>
                </div>
                <Button
                  onClick={() => setLocation("/")}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  data-testid="button-go-home-success"
                >
                  На главную
                </Button>
              </Card>
            </motion.div>
          ) : order ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold">Заказ найден</h2>
                    <p className="text-sm text-muted-foreground font-mono">
                      {orderId.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Клиент</span>
                    <span>{order.clientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Тип проекта</span>
                    <span>
                      {order.projectType === "landing" ? "Лендинг" : 
                       order.projectType === "corporate" ? "Корпоративный сайт" : "Интернет-магазин"}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Полная стоимость</span>
                    <span className="font-mono">{formatPrice(parseFloat(order.totalAmount || order.amount) * 2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Оплачено (предоплата)</span>
                    <span className="font-mono text-emerald-500">-{formatPrice(parseFloat(order.amount))} ₽</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-end pt-2">
                    <span className="font-medium">К оплате</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {formatPrice(parseFloat(order.amount))} ₽
                    </span>
                  </div>
                </div>

                {!isPrepaid ? (
                  <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/20 mb-6">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Предоплата по этому заказу ещё не подтверждена. Пожалуйста, дождитесь подтверждения или свяжитесь с нами.
                    </p>
                  </div>
                ) : null}

                <Button
                  onClick={handlePayRemaining}
                  disabled={payRemainingMutation.isPending || !isPrepaid}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  data-testid="button-pay-remaining"
                >
                  {payRemainingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Переход к оплате...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Оплатить {formatPrice(parseFloat(order.amount))} ₽
                    </>
                  )}
                </Button>

                {payRemainingMutation.isError && (
                  <p className="text-sm text-destructive mt-4 text-center">
                    Произошла ошибка. Попробуйте позже или свяжитесь с нами.
                  </p>
                )}
              </Card>
            </motion.div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
