import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, BookOpen, Code, Palette, TrendingUp, ArrowLeft, Play, CheckCircle2, X } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useBreadcrumbSchema } from "@/lib/useBreadcrumbSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import heroImg from "@assets/generated_images/online_course_platform_hero_image.png";
import instructorImg from "@assets/generated_images/online_course_instructor_portrait.png";
import studentImg from "@assets/generated_images/student_taking_online_course.png";
import dashboardImg from "@assets/generated_images/online_course_dashboard_interface.png";
import programmingImg from "@assets/generated_images/programming_course_code_editor.png";
import certificateImg from "@assets/generated_images/course_completion_certificate.png";

const courses = [
  {
    id: 1,
    title: "Веб-разработка с React",
    instructor: "Иван Петров",
    level: "Средний",
    students: 1247,
    rating: 4.8,
    reviews: 456,
    price: 2990,
    duration: "40 часов",
    image: programmingImg,
    tags: ["React", "JavaScript", "Web"],
    popular: true,
  },
  {
    id: 2,
    title: "Дизайн UI/UX",
    instructor: "Мария Соколова",
    level: "Начинающий",
    students: 892,
    rating: 4.9,
    reviews: 324,
    price: 1990,
    duration: "32 часа",
    image: dashboardImg,
    tags: ["Figma", "Design", "UI"],
  },
  {
    id: 3,
    title: "Python для аналитики",
    instructor: "Сергей Смирнов",
    level: "Продвинутый",
    students: 1543,
    rating: 4.7,
    reviews: 578,
    price: 3490,
    duration: "48 часов",
    image: programmingImg,
    tags: ["Python", "Data", "Analytics"],
  },
  {
    id: 4,
    title: "Маркетинг в социальных сетях",
    instructor: "Анна Козлова",
    level: "Начинающий",
    students: 734,
    rating: 4.6,
    reviews: 267,
    price: 1490,
    duration: "24 часа",
    image: dashboardImg,
    tags: ["Marketing", "Social Media", "SMM"],
  },
];

const instructors = [
  {
    id: 1,
    name: "Иван Петров",
    role: "Senior Frontend Developer",
    experience: "10 лет опыта",
    students: "3,500+ учеников",
    rating: 4.8,
    image: instructorImg,
  },
  {
    id: 2,
    name: "Мария Соколова",
    role: "UX/UI Designer",
    experience: "8 лет опыта",
    students: "2,100+ учеников",
    rating: 4.9,
    image: studentImg,
  },
  {
    id: 3,
    name: "Сергей Смирнов",
    role: "Data Science Expert",
    experience: "12 лет опыта",
    students: "4,200+ учеников",
    rating: 4.7,
    image: instructorImg,
  },
];

const features = [
  { icon: BookOpen, title: "Качественный контент", desc: "Курсы разработаны экспертами" },
  { icon: Users, title: "Сообщество", desc: "Пообщайтесь с другими учениками" },
  { icon: CheckCircle2, title: "Сертификаты", desc: "Получайте признанные сертификаты" },
];

const benefits = [
  { title: "Учитесь в своём темпе", desc: "Смотрите лекции когда удобно" },
  { title: "Практические проекты", desc: "Создавайте реальные проекты" },
  { title: "Поддержка сообщества", desc: "Помощь от опытных преподавателей" },
];

export default function OnlineAcademy() {
  const { toast } = useToast();
  const [previewCourse, setPreviewCourse] = useState<number | null>(null);
  const [enrollingCourse, setEnrollingCourse] = useState<number | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [enrollForm, setEnrollForm] = useState({ name: "", email: "", phone: "" });
  const coursesRef = useRef<HTMLElement>(null);

  useDocumentMeta({
    title: "ОнлайнОкадемия — Онлайн-курсы по программированию и дизайну",
    description: "Научитесь веб-разработке, дизайну UI/UX, Python и маркетингу. Курсы от опытных преподавателей. Сертификаты после завершения.",
    keywords: "онлайн-курсы, программирование, веб-разработка, дизайн, Python, React, обучение",
    ogTitle: "ОнлайнОкадемия — Онлайн образование | Дизайн от MP.WebStudio",
    ogDescription: "Лучшие онлайн-курсы по программированию и дизайну для начинающих и профессионалов",
    ogImage: "https://mp-webstudio.ru/og-image.png",
    ogUrl: "https://mp-webstudio.ru/demo/online-academy",
    canonical: "https://mp-webstudio.ru/demo/online-academy"
  });

  useBreadcrumbSchema([
    { name: "MP.WebStudio", url: "https://mp-webstudio.ru/" },
    { name: "Портфолио", url: "https://mp-webstudio.ru/#portfolio" },
    { name: "ОнлайнОкадемия", url: "https://mp-webstudio.ru/demo/online-academy" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ["all", "Web", "Design", "Data", "Marketing"];
  
  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(c => c.tags.some(tag => tag.includes(selectedCategory)));

  const handleEnrollClick = (courseId: number) => {
    setEnrollingCourse(courseId);
    setEnrollForm({ name: "", email: "", phone: "" });
  };

  const handleEnrollSubmit = () => {
    const isAlreadyEnrolled = enrollingCourse && enrolledCourses.includes(enrollingCourse);
    
    // Отписка - без валидации
    if (isAlreadyEnrolled) {
      setEnrolledCourses(prev => prev.filter(id => id !== enrollingCourse));
      toast({
        title: "Готово",
        description: "Вы отписались от курса",
      });
      setEnrollingCourse(null);
      return;
    }
    
    // Новая запись - требуется валидация
    if (!enrollForm.name || !enrollForm.email || !enrollForm.phone) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive"
      });
      return;
    }
    
    if (enrollingCourse) {
      setEnrolledCourses(prev => [...prev, enrollingCourse]);
      const course = courses.find(c => c.id === enrollingCourse);
      toast({
        title: "Успешно!",
        description: `Вы записались на курс "${course?.title}"! На указанный email отправлено подтверждение.`,
      });
      setEnrollingCourse(null);
    }
  };

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-950">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <img 
          src={heroImg} 
          alt="Онлайн обучение" 
          className="absolute top-0 right-0 w-1/2 h-full object-cover opacity-20 pointer-events-none"
        />
        
        <nav className="relative z-50 max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/#portfolio">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-blue-100/60 dark:bg-white/10 border border-blue-200 dark:border-white/20 hover:bg-blue-100/80 dark:hover:bg-white/20"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">ОнлайнОкадемия</span>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-0">
              Более 10,000 студентов уже обучаются
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Онлайн-курсы от экспертов индустрии
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Учитесь в своём темпе. Получайте сертификаты. Развивайте навыки для карьеры вашей мечты.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="default" onClick={scrollToCourses} data-testid="button-browse-courses">
                Смотреть курсы
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToCourses} data-testid="button-learn-more">
                Узнать больше
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Features banner */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 pb-12">
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20"
              >
                <feature.icon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section ref={coursesRef} className="py-16 bg-muted/50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Популярные курсы</h2>
            <p className="text-lg text-muted-foreground mb-6">Выберите курс и начните обучение прямо сейчас</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`filter-${cat}`}
                >
                  {cat === "all" ? "Все курсы" : cat}
                </Button>
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                data-testid={`course-card-${course.id}`}
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden h-40">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    {course.popular && (
                      <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
                        Популярный
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="absolute inset-0 flex items-center justify-center"
                      onClick={() => setPreviewCourse(course.id)}
                      data-testid={`button-play-${course.id}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-blue-500 ml-1" />
                      </div>
                    </motion.button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {course.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      <span className="block">
                        <strong>{course.instructor}</strong>
                      </span>
                      <span className="text-xs">{course.level}</span>
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {course.rating} ({course.reviews})
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.students}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {course.price}₽
                      </span>
                      <Button 
                        size="sm"
                        variant={enrolledCourses.includes(course.id) ? "secondary" : "default"}
                        onClick={() => handleEnrollClick(course.id)}
                        data-testid={`button-enroll-${course.id}`}
                      >
                        {enrolledCourses.includes(course.id) ? "Отписаться" : "Записаться"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Наши преподаватели</h2>
          <p className="text-lg text-muted-foreground">Учитесь у лучших специалистов индустрии</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <motion.div
              key={instructor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center"
              data-testid={`instructor-card-${instructor.id}`}
            >
              <img 
                src={instructor.image} 
                alt={instructor.name}
                className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100 dark:border-blue-900/30"
              />
              <h3 className="text-xl font-semibold mb-1">{instructor.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-3">
                {instructor.role}
              </p>
              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                <p>{instructor.experience}</p>
                <p>{instructor.students}</p>
              </div>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(instructor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
                <span className="text-sm ml-2 text-muted-foreground">{instructor.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-4">Начните обучение прямо сейчас</h2>
            <p className="text-lg text-white/90 mb-8">
              Присоединитесь к тысячам студентов, которые уже развивают свои навыки
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={scrollToCourses}
              data-testid="button-start-learning"
            >
              Выбрать курс
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="font-bold">ОнлайнОкадемия</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Платформа для обучения в интернете
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Курсы</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Программирование</a></li>
              <li><a href="#" className="hover:text-foreground">Дизайн</a></li>
              <li><a href="#" className="hover:text-foreground">Маркетинг</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">О нас</a></li>
              <li><a href="#" className="hover:text-foreground">Контакты</a></li>
              <li><a href="#" className="hover:text-foreground">Блог</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground">Помощь</a></li>
              <li><a href="#" className="hover:text-foreground">Условия</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 ОнлайнОкадемия. Все права защищены.</p>
        </div>
      </footer>

      {/* Preview Course Modal */}
      <Dialog open={previewCourse !== null} onOpenChange={(open) => !open && setPreviewCourse(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-preview-course">
          <DialogHeader>
            <DialogTitle>Предпросмотр курса</DialogTitle>
          </DialogHeader>
          {previewCourse && (() => {
            const course = courses.find(c => c.id === previewCourse);
            return course ? (
              <div className="space-y-4">
                <img src={course.image} alt={course.title} className="w-full h-64 object-cover rounded-lg" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                  <p className="text-muted-foreground mb-4">{course.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Преподаватель</p>
                      <p className="font-semibold">{course.instructor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Длительность</p>
                      <p className="font-semibold">{course.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Уровень</p>
                      <p className="font-semibold">{course.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Цена</p>
                      <p className="font-semibold text-blue-600">{course.price}₽</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      onClick={() => {
                        setPreviewCourse(null);
                        handleEnrollClick(course.id);
                      }}
                      data-testid="button-enroll-from-preview"
                    >
                      Записаться на курс
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setPreviewCourse(null)}
                    >
                      Закрыть
                    </Button>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>

      {/* Enroll Form Modal */}
      <Dialog open={enrollingCourse !== null} onOpenChange={(open) => !open && setEnrollingCourse(null)}>
        <DialogContent data-testid="dialog-enroll-form">
          <DialogHeader>
            <DialogTitle>
              {enrolledCourses.includes(enrollingCourse!) ? "Отписаться от курса?" : "Записаться на курс"}
            </DialogTitle>
          </DialogHeader>
          {enrollingCourse && (() => {
            const course = courses.find(c => c.id === enrollingCourse);
            const isEnrolled = enrolledCourses.includes(enrollingCourse);
            return course ? (
              <div className="space-y-4">
                {!isEnrolled && (
                  <>
                    <p className="text-muted-foreground">
                      Заполните форму, чтобы начать обучение на курсе <strong>{course.title}</strong>
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">Ваше имя</Label>
                        <Input
                          id="name"
                          placeholder="Иван Петров"
                          value={enrollForm.name}
                          onChange={(e) => setEnrollForm({...enrollForm, name: e.target.value})}
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ivan@example.com"
                          value={enrollForm.email}
                          onChange={(e) => setEnrollForm({...enrollForm, email: e.target.value})}
                          data-testid="input-email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          id="phone"
                          placeholder="+7 (999) 999-99-99"
                          value={enrollForm.phone}
                          onChange={(e) => setEnrollForm({...enrollForm, phone: e.target.value})}
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                  </>
                )}
                {isEnrolled && (
                  <p className="text-muted-foreground">
                    Вы уже записаны на этот курс. Нажмите "Отписаться", если хотите удалить регистрацию.
                  </p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setEnrollingCourse(null)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    variant={isEnrolled ? "destructive" : "default"}
                    onClick={handleEnrollSubmit}
                    data-testid="button-submit-enroll"
                  >
                    {isEnrolled ? "Отписаться" : "Записаться"}
                  </Button>
                </div>
              </div>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
