import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, ArrowRight } from "lucide-react";

type ProjectType = "landing" | "corporate" | "shop";

interface Feature {
  id: string;
  label: string;
  price: number;
}

const projectTypes: { value: ProjectType; label: string; basePrice: number; description: string }[] = [
  { value: "landing", label: "Лендинг", basePrice: 25000, description: "Одностраничный продающий сайт" },
  { value: "corporate", label: "Корпоративный сайт", basePrice: 60000, description: "Многостраничный сайт компании" },
  { value: "shop", label: "Интернет-магазин", basePrice: 120000, description: "Каталог, корзина, оплата" },
];

const features: Feature[] = [
  { id: "design", label: "Уникальный дизайн", price: 20000 },
  { id: "adaptive", label: "Адаптивная вёрстка", price: 15000 },
  { id: "cms", label: "Админ-панель", price: 30000 },
  { id: "seo", label: "SEO-оптимизация", price: 15000 },
  { id: "analytics", label: "Аналитика (Яндекс.Метрика)", price: 5000 },
  { id: "payment", label: "Интеграция оплаты (ЮКасса)", price: 20000 },
  { id: "hosting", label: "Настройка хостинга (Яндекс Cloud)", price: 15000 },
  { id: "1c", label: "Интеграция с 1С", price: 35000 },
];

export function CalculatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [projectType, setProjectType] = useState<ProjectType>("corporate");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["adaptive"]);

  const basePrice = projectTypes.find((p) => p.value === projectType)?.basePrice || 0;
  const featuresPrice = selectedFeatures.reduce((sum, featureId) => {
    const feature = features.find((f) => f.id === featureId);
    return sum + (feature?.price || 0);
  }, 0);
  const totalPrice = basePrice + featuresPrice;

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  return (
    <section id="calculator" className="py-24 md:py-32 relative overflow-hidden bg-card/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
            Калькулятор
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Рассчитайте{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              стоимость проекта
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Выберите тип сайта и дополнительные опции для предварительного расчёта
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 bg-background/50 border-border backdrop-blur-sm">
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Тип проекта</h3>
                <RadioGroup
                  value={projectType}
                  onValueChange={(value) => setProjectType(value as ProjectType)}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {projectTypes.map((type) => (
                    <div key={type.value}>
                      <RadioGroupItem
                        value={type.value}
                        id={type.value}
                        className="peer sr-only"
                        data-testid={`radio-input-${type.value}`}
                      />
                      <Label
                        htmlFor={type.value}
                        className="flex flex-col p-4 rounded-md border border-border bg-card/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover-elevate"
                        data-testid={`radio-label-${type.value}`}
                      >
                        <span className="font-medium text-foreground">{type.label}</span>
                        <span className="text-sm text-muted-foreground">{type.description}</span>
                        <span className="text-sm font-mono text-primary mt-2">
                          от {formatPrice(type.basePrice)} ₽
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Дополнительные опции</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all ${
                        selectedFeatures.includes(feature.id)
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card/50"
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                      data-testid={`checkbox-container-${feature.id}`}
                    >
                      <Checkbox
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        data-testid={`checkbox-${feature.id}`}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground">{feature.label}</span>
                        <span className="block text-xs font-mono text-muted-foreground">
                          +{formatPrice(feature.price)} ₽
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-primary/20 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Итого</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Базовая стоимость</span>
                  <span className="font-mono">{formatPrice(basePrice)} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Опции ({selectedFeatures.length})</span>
                  <span className="font-mono">+{formatPrice(featuresPrice)} ₽</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-end">
                  <span className="font-medium">Примерная стоимость</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {formatPrice(totalPrice)} ₽
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-6">
                * Окончательная стоимость определяется после обсуждения деталей проекта
              </p>

              <a href="/order">
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                  data-testid="button-calculator-cta"
                >
                  Заказать сайт
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
