import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  FileText, 
  CreditCard,
  Building2,
  Loader2,
  Search,
  ExternalLink
} from "lucide-react";

const API_BASE_URL = "https://functions.yandexcloud.net/d4ed08qj9rekklj8b100";

interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectType: string;
  projectDescription: string;
  amount: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  paidAt: string;
  paymentMethod: string;
  companyName?: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Ожидает оплаты", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  pending_bank_payment: { label: "Ожидает оплаты по счёту", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Building2 },
  paid: { label: "Предоплата получена", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: CreditCard },
  in_progress: { label: "В работе", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Package },
  completed: { label: "Завершён", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
};

const projectTypeLabels: Record<string, string> = {
  landing: "Лендинг",
  corporate: "Корпоративный сайт",
  shop: "Интернет-магазин",
};

export default function TelegramApp() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      const themeParams = window.Telegram.WebApp.themeParams;
      if (themeParams) {
        document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color || '#0a0a0a');
        document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color || '#ffffff');
      }
    }
  }, []);

  const formatPrice = (price: string | number) => {
    const num = parseFloat(String(price)) || 0;
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  const searchOrders = async () => {
    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await fetch(`${API_BASE_URL}?action=client-orders&email=${encodeURIComponent(email.trim())}`);
      const data = await response.json();
      
      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError("Ошибка загрузки заказов");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusLabels[status] || statusLabels.pending;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4" data-testid="telegram-app">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            MP.WebStudio
          </h1>
          <p className="text-sm text-gray-400 mt-1">Личный кабинет клиента</p>
        </div>

        <Card className="p-4 bg-gray-900/50 border-gray-800 mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Введите email заказа</label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchOrders()}
              className="bg-gray-800 border-gray-700"
              data-testid="input-email"
            />
            <Button 
              onClick={searchOrders} 
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
              data-testid="button-search"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </Card>

        {searched && !loading && orders.length === 0 && (
          <Card className="p-6 bg-gray-900/50 border-gray-800 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Заказы не найдены</p>
            <p className="text-sm text-gray-500 mt-1">Проверьте правильность email</p>
          </Card>
        )}

        <div className="space-y-4">
          {orders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-gray-900/50 border-gray-800" data-testid={`card-order-${order.id}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {projectTypeLabels[order.projectType] || order.projectType}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">{order.id}</p>
                    </div>
                    <Badge variant="outline" className={statusInfo.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Полная стоимость:</span>
                      <span className="font-mono text-white">
                        {formatPrice(order.totalAmount || parseFloat(order.amount) * 2)} ₽
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Предоплата (50%):</span>
                      <span className="font-mono text-cyan-400">{formatPrice(order.amount)} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Дата заказа:</span>
                      <span className="text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    {order.paymentMethod === "invoice" && order.companyName && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Компания:</span>
                        <span className="text-blue-400">{order.companyName}</span>
                      </div>
                    )}
                  </div>

                  {order.status === "in_progress" && (
                    <div className="mt-4 p-3 bg-purple-500/10 rounded-md border border-purple-500/20">
                      <p className="text-sm text-purple-300">
                        Ваш сайт в разработке! Мы свяжемся с вами для согласования.
                      </p>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="mt-4 p-3 bg-green-500/10 rounded-md border border-green-500/20">
                      <p className="text-sm text-green-300">
                        Проект завершён! Акт выполненных работ отправлен на email.
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              const url = "https://mp-webstudio.ru";
              try {
                if (window.Telegram?.WebApp?.openLink) {
                  window.Telegram.WebApp.openLink(url, { try_instant_view: true });
                } else {
                  window.location.href = url;
                }
              } catch (e) {
                window.location.href = url;
              }
            }}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer"
          >
            mp-webstudio.ru
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        themeParams: {
          bg_color?: string;
          text_color?: string;
        };
      };
    };
  }
}
