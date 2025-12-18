import { SiTelegram, SiVk } from "react-icons/si";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/generated_images/mp_hexagonal_tech_logo.png";

const footerLinks = [
  { label: "О студии", href: "#about" },
  { label: "Портфолио", href: "#portfolio" },
  { label: "Услуги", href: "#services" },
  { label: "Контакты", href: "#contact" },
  { label: "Оферта", href: "/offer" },
  { label: "Политика", href: "/privacy" },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (href.startsWith("/")) {
      window.location.href = href;
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative py-12 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="MP.WebStudio" className="w-14 h-14 rounded-md object-cover" />
            <span className="text-2xl font-bold text-foreground">MP.WebStudio</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-1">
            {footerLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                onClick={() => scrollToSection(link.href)}
                className="text-muted-foreground"
                data-testid={`link-footer-${link.href.slice(1)}`}
              >
                {link.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-footer-telegram"
            >
              <SiTelegram className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-footer-vk"
            >
              <SiVk className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-semibold text-foreground">Контакты:</p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:info@mp-webstudio.ru" className="text-primary hover:underline">info@mp-webstudio.ru</a>
              </p>
              <p className="text-muted-foreground">
                Сайт: <a href="https://mp-webstudio.ru" className="text-primary hover:underline">mp-webstudio.ru</a>
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} MP.WebStudio. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
