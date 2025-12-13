import { SiTelegram, SiVk } from "react-icons/si";
import { Button } from "@/components/ui/button";

const footerLinks = [
  { label: "О студии", href: "#about" },
  { label: "Портфолио", href: "#portfolio" },
  { label: "Услуги", href: "#services" },
  { label: "Контакты", href: "#contact" },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">MP</span>
            </div>
            <span className="text-xl font-bold text-foreground">MP.WebStudio</span>
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

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p data-testid="text-copyright">
            © {new Date().getFullYear()} MP.WebStudio. Все права защищены.
          </p>
          <p>
            Сделано с любовью в России
          </p>
        </div>
      </div>
    </footer>
  );
}
