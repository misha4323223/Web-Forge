import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import { ParticleBackground } from "./ParticleBackground";

interface FlyingLetterProps {
  letter: string;
  index: number;
  totalLetters: number;
  isGradient?: boolean;
  isInView: boolean;
}

function FlyingLetter({ letter, index, totalLetters, isGradient, isInView }: FlyingLetterProps) {
  const startPosition = useMemo(() => {
    const angle = (index / totalLetters) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 200 + Math.random() * 300;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 100,
      rotate: (Math.random() - 0.5) * 180,
      scale: 0.5 + Math.random() * 0.3,
    };
  }, [index, totalLetters]);

  const delay = index * 0.02;

  if (letter === " ") {
    return <span className="inline-block w-[0.3em]">&nbsp;</span>;
  }

  return (
    <motion.span
      className={`inline-block ${isGradient ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" : ""}`}
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        rotate: startPosition.rotate,
        scale: startPosition.scale,
        opacity: 0,
        filter: "blur(6px)",
      }}
      animate={isInView ? {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      } : {}}
      transition={{
        duration: 0.6,
        delay: delay,
        type: "spring",
        stiffness: 120,
        damping: 14,
      }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {letter}
    </motion.span>
  );
}

interface AnimatedTextProps {
  text: string;
  startIndex: number;
  isGradient?: boolean;
  isInView: boolean;
}

function AnimatedText({ text, startIndex, isGradient, isInView }: AnimatedTextProps) {
  const words = text.split(" ");
  let letterIndex = startIndex;

  return (
    <>
      {words.map((word, wordIdx) => {
        const wordStartIndex = letterIndex;
        letterIndex += word.length + 1;
        
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {word.split("").map((letter, i) => (
              <FlyingLetter
                key={i}
                letter={letter}
                index={wordStartIndex + i}
                totalLetters={startIndex + text.length + 10}
                isGradient={isGradient}
                isInView={isInView}
              />
            ))}
            {wordIdx < words.length - 1 && <span className="inline-block w-[0.3em]">&nbsp;</span>}
          </span>
        );
      })}
    </>
  );
}

const contactSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email"),
  projectType: z.string().min(1, "Выберите тип проекта"),
  budget: z.string().optional(),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  { icon: Mail, label: "Email", value: "mpwebstudio1@gmail.com" },
  { icon: Phone, label: "Телефон", value: "+7 (953) 181-41-36" },
  { icon: MapPin, label: "Город", value: "Тула, Россия" },
];

const projectTypes = [
  { value: "landing", label: "Лендинг" },
  { value: "corporate", label: "Корпоративный сайт" },
  { value: "shop", label: "Интернет-магазин" },
  { value: "other", label: "Другое" },
];

const budgetRanges = [
  { value: "15-30", label: "15 000 - 30 000 ₽" },
  { value: "30-60", label: "30 000 - 60 000 ₽" },
  { value: "60-100", label: "60 000 - 100 000 ₽" },
  { value: "100+", label: "Более 100 000 ₽" },
  { value: "unknown", label: "Пока не определился" },
];

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      projectType: "",
      budget: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в ближайшее время.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте позже.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  const line1 = "Готовы ";
  const line2 = "начать проект?";

  return (
    <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.08),transparent_50%)]" />
      </div>

      <ParticleBackground />

      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="absolute top-1/4 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="neon-badge">
              <span className="neon-badge-text">Контакты</span>
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <AnimatedText text={line1} startIndex={0} isInView={isInView} />
            <AnimatedText text={line2} startIndex={line1.length} isGradient isInView={isInView} />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Оставьте заявку и мы свяжемся с вами для бесплатной консультации
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            {isSubmitted ? (
              <div
                role="status"
                aria-live="polite"
                className="h-full flex flex-col items-center justify-center text-center p-8 rounded-md bg-card/50 border border-border"
                data-testid="status-success"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Спасибо за заявку!</h3>
                <p className="text-muted-foreground mb-6">
                  Мы получили ваше сообщение и свяжемся с вами в течение 24 часов.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  data-testid="button-new-request"
                >
                  Отправить ещё
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5 p-8 rounded-md bg-card/50 border border-border backdrop-blur-sm"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ваше имя *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Иван Иванов"
                              {...field}
                              className="bg-background/50"
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Телефон *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+7 (999) 123-45-67"
                              {...field}
                              className="bg-background/50"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ivan@example.com"
                            {...field}
                            className="bg-background/50"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип проекта *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50" data-testid="select-project-type">
                                <SelectValue placeholder="Выберите тип" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value} data-testid={`select-item-project-${type.value}`}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Бюджет</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50" data-testid="select-budget">
                                <SelectValue placeholder="Примерный бюджет" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {budgetRanges.map((range) => (
                                <SelectItem key={range.value} value={range.value} data-testid={`select-item-budget-${range.value}`}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание проекта *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Расскажите о вашем проекте, целях и задачах..."
                            rows={4}
                            {...field}
                            className="bg-background/50 resize-none"
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    disabled={mutation.isPending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                    data-testid="button-submit-contact"
                  >
                    {mutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Отправляем...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Отправить заявку
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4"
                  data-testid={`contact-${item.label.toLowerCase()}`}
                >
                  <div className="w-12 h-12 rounded-md bg-card border border-border flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    <div className="text-foreground font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto p-6 rounded-md bg-card/50 border border-border">
              <h4 className="font-bold mb-4">Мессенджеры</h4>
              <div className="flex gap-3">
                <a href="https://t.me/MPWebStudio_ru" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12"
                    data-testid="button-telegram"
                  >
                    <SiTelegram className="w-5 h-5" />
                  </Button>
                </a>
                <a href="https://wa.me/79531814136" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12"
                    data-testid="button-whatsapp"
                  >
                    <SiWhatsapp className="w-5 h-5" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
