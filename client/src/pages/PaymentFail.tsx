import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, MessageSquare, Home } from "lucide-react";

export default function PaymentFail() {
  const [, setLocation] = useLocation();

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
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
              >
                <XCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                Оплата{" "}
                <span className="text-red-400">
                  не прошла
                </span>
              </h1>

              <p className="text-muted-foreground mb-6">
                К сожалению, оплата не была завершена. Вы можете попробовать ещё раз или связаться с нами.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-left p-4 rounded-md bg-card/30">
                  <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Попробуйте ещё раз</p>
                    <p className="text-sm text-muted-foreground">
                      Проверьте данные карты и попробуйте оплатить снова
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left p-4 rounded-md bg-card/30">
                  <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Свяжитесь с нами</p>
                    <p className="text-sm text-muted-foreground">
                      Мы поможем решить проблему с оплатой
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/order")}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  data-testid="button-try-again"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  data-testid="button-go-home"
                >
                  <Home className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
