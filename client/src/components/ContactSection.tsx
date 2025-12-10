import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";

const contactSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@webstudio.ru" },
  { icon: Phone, label: "Телефон", value: "+7 (999) 123-45-67" },
  { icon: MapPin, label: "Адрес", value: "Москва, Россия" },
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
      email: "",
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

  return (
    <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
            Контакты
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Готовы{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              начать проект?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Оставьте заявку и мы свяжемся с вами для бесплатной консультации
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                  className="space-y-6 p-8 rounded-md bg-card/50 border border-border backdrop-blur-sm"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ваше имя</FormLabel>
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сообщение</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Расскажите о вашем проекте..."
                            rows={5}
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
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
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
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12"
                  data-testid="button-telegram"
                >
                  <SiTelegram className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12"
                  data-testid="button-whatsapp"
                >
                  <SiWhatsapp className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-md bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-primary/20">
              <h4 className="font-bold mb-2">Бесплатная консультация</h4>
              <p className="text-muted-foreground text-sm">
                Ответим на ваши вопросы, оценим проект и предложим оптимальное решение. Без обязательств.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
