import { useState } from "react";
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
import { Loader2, Copy, Check, Trash2, Edit2, Mail, Phone, Calendar, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdditionalInvoiceFormData = {
  orderId: string;
  description: string;
  amount: string;
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Ожидает", variant: "secondary" },
  paid: { label: "Оплачено", variant: "default" },
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
      const res = await apiRequest("PATCH", `/api/orders/${id}/note`, { note });
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
      const res = await apiRequest("DELETE", `/api/orders/${id}`);
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

  const handleSubmit = (values: AdditionalInvoiceFormData) => {
    createInvoiceMutation.mutate(values);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Панель управления</h1>

          <Tabs defaultValue="orders" className="space-y-6">
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
                              {order.internalNote && (
                                <Badge variant="secondary" className="gap-1">
                                  <StickyNote className="w-3 h-3" />
                                  Заметка
                                </Badge>
                              )}
                            </div>

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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                form.setValue("orderId", order.id);
                              }}
                              data-testid={`button-invoice-${order.id}`}
                            >
                              Выставить счёт
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

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h3 className="font-semibold mb-2">Как это работает:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Выберите заказ из вкладки "Заказы" или введите ID вручную</li>
                    <li>Опишите дополнительную функцию/услугу</li>
                    <li>Укажите стоимость</li>
                    <li>Нажмите "Создать счёт"</li>
                    <li>Ссылка на оплату автоматически скопируется</li>
                    <li>Отправьте ссылку клиенту (например, через Telegram)</li>
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
