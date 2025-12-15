import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "mp-webstudio-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          data-testid="cookie-consent-banner"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-4 md:p-6">
              <button
                onClick={handleDecline}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Закрыть"
                data-testid="button-cookie-close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 pr-8 md:pr-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Мы используем cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Продолжая использовать сайт, вы соглашаетесь на обработку 
                    персональных данных в соответствии с{" "}
                    <a 
                      href="/privacy" 
                      className="text-primary hover:underline"
                      data-testid="link-privacy-policy"
                    >
                      политикой конфиденциальности
                    </a>
                    . Cookies помогают нам улучшать сайт и показывать релевантный контент.
                  </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    className="flex-1 md:flex-none"
                    data-testid="button-cookie-decline"
                  >
                    Отклонить
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 md:flex-none bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                    data-testid="button-cookie-accept"
                  >
                    Принять
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
