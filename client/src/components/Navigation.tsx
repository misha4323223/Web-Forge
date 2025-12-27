import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import logoImg from "@assets/generated_images/mp_hexagonal_tech_logo.webp";

const navItems = [
  { label: "О студии", href: "#about" },
  { label: "Портфолио", href: "#portfolio" },
  { label: "Услуги", href: "#services" },
  { label: "Калькулятор", href: "#calculator" },
  { label: "Процесс", href: "#process" },
  { label: "Контакты", href: "#contact" },
];

const legalLinks = [
  { label: "Оферта", href: "/offer" },
  { label: "Политика", href: "/privacy" },
];

const orderPagePath = "/order";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isHomePage = location === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (!isHomePage) {
      window.location.href = "/" + href;
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="px-6 py-4 flex items-center justify-between gap-4">
        <a
          href="/"
          onClick={(e) => {
            if (isHomePage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-2 flex-shrink-0"
          data-testid="link-logo"
        >
          <img src={logoImg} alt="MP.WebStudio" className="w-10 h-10 rounded-md object-cover" />
          <span className="inline text-xl font-bold text-foreground">MP.WebStudio</span>
        </a>

        <div className="hidden md:flex items-center gap-1 flex-wrap">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection(item.href)}
              className="text-muted-foreground whitespace-nowrap"
              data-testid={`link-nav-${item.href.slice(1)}`}
            >
              {item.label}
            </Button>
          ))}
          <div className="hidden lg:flex items-center gap-0 ml-4 pl-4 border-l border-border">
            {legalLinks.map((link) => (
              <a key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs"
                  data-testid={`link-nav-legal-${link.href.slice(1)}`}
                >
                  {link.label}
                </Button>
              </a>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => scrollToSection("#calculator")}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
            data-testid="button-nav-send-request"
          >
            Отправить заявку
          </Button>
          <a href={orderPagePath}>
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
              data-testid="button-nav-cta"
            >
              Заказать сайт
            </Button>
          </a>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => scrollToSection(item.href)}
                  className="justify-start text-muted-foreground"
                  data-testid={`link-mobile-nav-${item.href.slice(1)}`}
                >
                  {item.label}
                </Button>
              ))}
              <div className="flex gap-1 pt-2 mt-2 border-t border-border">
                {legalLinks.map((link) => (
                  <a key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      className="justify-start text-muted-foreground text-xs"
                      data-testid={`link-mobile-nav-legal-${link.href.slice(1)}`}
                    >
                      {link.label}
                    </Button>
                  </a>
                ))}
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <Button
                  onClick={() => scrollToSection("#calculator")}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  data-testid="button-mobile-send-request"
                >
                  Отправить заявку
                </Button>
                <a href={orderPagePath} className="w-full">
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                    data-testid="button-mobile-cta"
                  >
                    Заказать сайт
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
