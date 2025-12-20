import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertAdditionalInvoiceSchema, type Order } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Copy, Check, Trash2, Edit2, Mail, Phone, Calendar, StickyNote, Building2, CreditCard, FileText, CheckCircle, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdditionalInvoiceFormData = {
  orderId: string;
  description: string;
  amount: string;
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Ожидает оплаты", variant: "secondary" },
  pending_bank_payment: { label: "Ожидает оплаты счёта", variant: "secondary" },
  paid: { label: "Предоплата получена", variant: "default" },
  in_progress: { label: "В работе", variant: "default" },
  completed: { label: "Завершён", variant: "default" },
  cancelled: { label: "Отменён", variant: "destructive" },
};

const projectTypeLabels: Record<string, string> = {
  landing: "Лендинг",
  corporate: "Корпоративный",
  shop: "Интернет-магазин",
};

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatPrice(amount: string | number): string {
  const num = parseFloat(String(amount)) || 0;
  return new Intl.NumberFormat("ru-RU").format(num) + " ₽";
}

export default function Admin() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://functions.yandexcloud.net/d4ed08qj9rekklj8b100";
  
  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (token) {
      verifyToken(token);
    } else {
      setAuthChecking(false);
    }
  }, []);
  
  const isProduction = !!import.meta.env.VITE_API_URL;
  
  const verifyToken = async (token: string) => {
    try {
      const url = isProduction 
        ? `${API_BASE_URL}?action=verify-admin`
        : "/api/verify-admin";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem("adminToken");
      }
    } catch {
      sessionStorage.removeItem("adminToken");
    }
    setAuthChecking(false);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      const url = isProduction 
        ? `${API_BASE_URL}?action=admin-login`
        : "/api/admin-login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        sessionStorage.setItem("adminToken", data.token);
        setIsAuthenticated(true);
        toast({ title: "Добро пожаловать!" });
      } else {
        toast({ title: "Ошибка входа", description: "Неверный email или пароль", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось подключиться к серверу", variant: "destructive" });
    }
    
    setLoginLoading(false);
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setLoginEmail("");
    setLoginPassword("");
    toast({ title: "Вы вышли из системы" });
  };
  
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}?action=orders`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const form = useForm<AdditionalInvoiceFormData>({
    resolver: zodResolver(insertAdditionalInvoiceSchema),
    defaultValues: {
      orderId: "",
      description: "",
      amount: "",
    },
  });

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

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const res = await fetch(`${API_BASE_URL}?action=orders/${id}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, note }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Заметка сохранена" });
      setNoteDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить заметку", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}?action=delete-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      if (!res.ok) throw new Error("Failed to delete order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Заказ удалён" });
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить заказ", variant: "destructive" });
    },
  });

  const confirmBankPaymentMutation = useMutation({
    mutationFn: async ({ orderId, paymentType }: { orderId: string; paymentType: 'prepayment' | 'remaining' }) => {
      const res = await fetch(`${API_BASE_URL}?action=confirm-bank-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentType }),
      });
      if (!res.ok) throw new Error("Failed to confirm payment");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Оплата подтверждена", description: data.message });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось подтвердить оплату", variant: "destructive" });
    },
  });

  const issueRemainingInvoiceMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`${API_BASE_URL}?action=bank-invoice-remaining`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error("Failed to issue remaining invoice");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Счёт на остаток отправлен", description: `Счёт №${data.invoiceNumber}` });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось выставить счёт", variant: "destructive" });
    },
  });

  const issueBankAddonInvoiceMutation = useMutation({
    mutationFn: async ({ orderId, description, amount }: { orderId: string; description: string; amount: string }) => {
      const res = await fetch(`${API_BASE_URL}?action=bank-invoice-addon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, description, amount }),
      });
      if (!res.ok) throw new Error("Failed to issue addon invoice");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Доп. счёт отправлен", description: `Счёт №${data.invoiceNumber}` });
      form.reset();
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось выставить счёт", variant: "destructive" });
    },
  });

  const handleSubmit = (values: AdditionalInvoiceFormData) => {
    const order = orders.find(o => o.id === values.orderId);
    if (order?.paymentMethod === 'invoice') {
      issueBankAddonInvoiceMutation.mutate(values);
    } else {
      createInvoiceMutation.mutate(values);
    }
  };

  const openNoteDialog = (order: Order) => {
    setSelectedOrder(order);
    setNoteText(order.internalNote || "");
    setNoteDialogOpen(true);
  };

  const openDeleteDialog = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    toast({ title: "ID скопирован!", description: orderId });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="max-w-md mx-auto px-6">
            <Card className="p-8">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Вход в админку</h1>
                <p className="text-muted-foreground text-center">
                  Введите учётные данные для доступа к панели управления
                </p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    data-testid="input-admin-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Пароль</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      data-testid="input-admin-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  disabled={loginLoading}
                  data-testid="button-admin-login"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    "Войти"
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold">Панель управления</h1>
            <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="orders" data-testid="tab-orders">Заказы ({orders.length})</TabsTrigger>
              <TabsTrigger value="invoice" data-testid="tab-invoice">Выставить счёт</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Все заказы</h2>
                
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Заказов пока нет</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="p-4" data-testid={`card-order-${order.id}`}>
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-lg">{order.clientName}</span>
                              <Badge variant={statusLabels[order.status]?.variant || "secondary"}>
                                {statusLabels[order.status]?.label || order.status}
                              </Badge>
                              <Badge variant="outline">
                                {projectTypeLabels[order.projectType] || order.projectType}
                              </Badge>
                              {order.paymentMethod === 'invoice' ? (
                                <Badge variant="outline" className="gap-1 border-blue-500 text-blue-600 dark:text-blue-400">
                                  <Building2 className="w-3 h-3" />
                                  Счёт
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  Карта
                                </Badge>
                              )}
                              {order.internalNote && (
                                <Badge variant="secondary" className="gap-1">
                                  <StickyNote className="w-3 h-3" />
                                  Заметка
                                </Badge>
                              )}
                            </div>
                            
                            {order.paymentMethod === 'invoice' && order.companyName && (
                              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {order.companyName} (ИНН: {order.companyInn})
                              </div>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {order.clientEmail}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {order.clientPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{formatPrice(order.amount)}</span>
                              <span className="text-sm text-muted-foreground">(предоплата 50%)</span>
                            </div>

                            <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                              ID: {order.id}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => copyOrderId(order.id)}
                                data-testid={`button-copy-${order.id}`}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>

                            {order.internalNote && (
                              <div className="p-3 bg-muted rounded-md text-sm">
                                <strong>Заметка:</strong> {order.internalNote}
                              </div>
                            )}
                          </div>

                          <div className="flex lg:flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openNoteDialog(order)}
                              data-testid={`button-note-${order.id}`}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Заметка
                            </Button>
                            
                            {order.paymentMethod === 'invoice' && order.status === 'pending_bank_payment' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => confirmBankPaymentMutation.mutate({ orderId: order.id, paymentType: 'prepayment' })}
                                disabled={confirmBankPaymentMutation.isPending}
                                data-testid={`button-confirm-prepayment-${order.id}`}
                              >
                                {confirmBankPaymentMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Предоплата получена
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {order.paymentMethod === 'invoice' && order.status === 'in_progress' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => issueRemainingInvoiceMutation.mutate(order.id)}
                                  disabled={issueRemainingInvoiceMutation.isPending}
                                  data-testid={`button-remaining-invoice-${order.id}`}
                                >
                                  {issueRemainingInvoiceMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <FileText className="w-4 h-4 mr-1" />
                                      Счёт на остаток
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => confirmBankPaymentMutation.mutate({ orderId: order.id, paymentType: 'remaining' })}
                                  disabled={confirmBankPaymentMutation.isPending}
                                  data-testid={`button-confirm-remaining-${order.id}`}
                                >
                                  {confirmBankPaymentMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Остаток получен
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                form.setValue("orderId", order.id);
                                setActiveTab("invoice");
                              }}
                              data-testid={`button-invoice-${order.id}`}
                            >
                              Доп. счёт
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteDialog(order)}
                              data-testid={`button-delete-${order.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="invoice">
              <div className="max-w-2xl">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Выставить дополнительный счёт</h2>
                  
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
                                placeholder="Введите ID заказа"
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
                        disabled={createInvoiceMutation.isPending || issueBankAddonInvoiceMutation.isPending}
                        className="w-full"
                        data-testid="button-create-invoice"
                      >
                        {(createInvoiceMutation.isPending || issueBankAddonInvoiceMutation.isPending) ? (
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

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h3 className="font-semibold mb-2">Как это работает:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Выберите заказ из вкладки "Заказы" или введите ID вручную</li>
                    <li>Опишите дополнительную функцию/услугу</li>
                    <li>Укажите стоимость</li>
                    <li>Нажмите "Создать счёт"</li>
                    <li><strong>Физлицо (карта):</strong> ссылка на Robokassa скопируется</li>
                    <li><strong>Юрлицо (счёт):</strong> PDF-счёт отправится на email клиента</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заметка к заказу</DialogTitle>
            <DialogDescription>
              {selectedOrder?.clientName} - {projectTypeLabels[selectedOrder?.projectType || ""] || selectedOrder?.projectType}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Введите заметку для себя..."
            className="min-h-[100px]"
            data-testid="input-note"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => selectedOrder && updateNoteMutation.mutate({ id: selectedOrder.id, note: noteText })}
              disabled={updateNoteMutation.isPending}
              data-testid="button-save-note"
            >
              {updateNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заказ?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить заказ от {orderToDelete?.clientName}?
              Заказ будет перемещён в архив и не будет отображаться в списке.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToDelete && deleteOrderMutation.mutate(orderToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
