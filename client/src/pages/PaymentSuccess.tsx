import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, MessageSquare, Home } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 text-center bg-background/50 border-border backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                Оплата прошла{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  успешно!
                </span>
              </h1>

              <p className="text-muted-foreground mb-6">
                Спасибо за заказ! Мы уже начинаем работу над вашим проектом.
              </p>

              {orderId && (
                <div className="bg-card/50 rounded-md p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Номер заказа</p>
                  <p className="font-mono text-lg">{orderId.substring(0, 8).toUpperCase()}</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-left p-4 rounded-md bg-card/30">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Проверьте почту</p>
                    <p className="text-sm text-muted-foreground">
                      Мы отправили подтверждение и копию договора на ваш email
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left p-4 rounded-md bg-card/30">
                  <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Свяжемся с вами</p>
                    <p className="text-sm text-muted-foreground">
                      В течение 24 часов мы свяжемся для уточнения деталей проекта
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setLocation("/")}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                data-testid="button-go-home"
              >
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
