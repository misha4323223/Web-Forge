# Дизайн-Гайдлайны: Сайт Веб-Студии

## Подход к Дизайну

**Reference-Based подход** с вдохновением от лучших современных веб-студий (Awwwards, Active Theory, Resn, Locomotive) — это портфолио-сайт, который сам является демонстрацией возможностей. Кинетический дизайн с матричными акцентами, темная тема с неоновым свечением.

## Типографика

**Основной шрифт:** Inter или Manrope (Google Fonts)
- Hero заголовки: 4xl-6xl (64-96px), font-bold, leading-tight
- Секционные заголовки: 3xl-4xl (48-60px), font-bold
- Подзаголовки: xl-2xl (24-32px), font-semibold
- Основной текст: base-lg (16-18px), font-normal
- Акцентный текст: sm-base (14-16px), font-medium, uppercase для меток

**Акцентный шрифт:** JetBrains Mono для технических элементов, кода, меток технологий

## Система Интервалов

Используем Tailwind единицы: **4, 6, 8, 12, 16, 20, 24, 32** для создания ритмичного дизайна.
- Секции: py-20 до py-32 (desktop), py-12 до py-16 (mobile)
- Внутренние отступы: p-6, p-8, p-12
- Промежутки между элементами: gap-4, gap-6, gap-8, gap-12

## Структура Секций

### 1. Hero (100vh)
- Полноэкранная секция с анимированным particle-фоном (матричная сетка/geometric shapes)
- Крупный заголовок по центру: "Создаём сайты, которые работают" + подзаголовок
- CTA-кнопка с blur-эффектом на темном фоне: "Обсудить проект"
- Animated scroll indicator внизу
- Gradient overlay: темно-синий → черный с неоновыми акцентами

### 2. О Студии (2-column layout)
- Левая колонка: текст о студии (max-w-prose)
- Правая колонка: анимированные статистики (проекты, клиенты, лет опыта) с подсчетом при скролле
- Floating geometric shapes в фоне

### 3. Портфолио (grid layout)
- Сетка 2 колонки (lg:grid-cols-2)
- Крупные карточки проектов с hover-эффектом (масштабирование, glow)
- Каждая карточка: крупное изображение проекта, название, технологии (pills), краткое описание
- Наведение: subtle zoom, неоновая обводка

### 4. Услуги (grid 3 columns)
- lg:grid-cols-3, md:grid-cols-2, mobile: grid-cols-1
- Иконки услуг (Font Awesome или Heroicons)
- Карточки с gradient borders, появляются при скролле с stagger-эффектом
- Каждая: иконка, заголовок, краткое описание

### 5. Технологии (masonry/pills layout)
- Облако технологий: React, Vue, Node.js, Python, Tailwind и т.д.
- Интерактивные pills с hover-glow эффектом
- Размещение в виде плавающих элементов

### 6. Процесс Работы (horizontal timeline)
- 4-5 этапов в горизонтальной линии с цифрами
- Каждый этап: номер, название, описание
- Connecting line с animated progress при скролле

### 7. Контактная Форма (2-column split)
- Левая: форма (имя, email, сообщение) с современными floating labels
- Правая: контактная информация, социальные сети, время работы
- CTA: "Отправить заявку"

### 8. Footer
- Логотип, навигация, социальные сети
- Copyright
- Subtle particle animation в фоне

## Библиотека Компонентов

**Навигация:** Fixed header с blur-backdrop, logo слева, меню справа, burger на mobile
**Кнопки:** Rounded-full, px-8 py-4, с gradient background и glow-эффектом при hover
**Карточки:** rounded-2xl, backdrop-blur, gradient borders, subtle shadow
**Inputs:** Темный фон, rounded-lg, border с неоновым glow при focus, floating labels
**Pills (теги):** rounded-full, px-4 py-2, маленький текст, gradient или solid с opacity

## Визуальные Эффекты

**Кинетические анимации:**
- Particle system в Hero (canvas-based или CSS)
- Плавные fade-in при скролле (Framer Motion/GSAP)
- Parallax на некоторых секциях
- Smooth scroll behavior

**Матричные элементы:**
- Geometric grid patterns в фоне (opacity: 0.05-0.1)
- Animated gradient meshes
- Floating shapes (triangles, circles) с медленным движением

**НЕ переборщить:** эффекты должны быть subtle, не отвлекать от контента

## Изображения

**Hero:** Абстрактный gradient mesh или particle visualization (через canvas/Three.js) вместо статичного изображения

**Портфолио:** 4-6 screenshots реальных проектов (десктоп + мобильная версии), high-quality mockups на темном фоне

**О студии:** Опционально - команда за работой (если есть), иначе просто градиенты

## Иконки

Lucide React и React Icons для иконок услуг, социальных сетей, технологий (встроены в проект)

## Ключевые Принципы

1. **Темная тема**: background черный (#0a0a0a) до темно-синий (#0f172a)
2. **Неоновые акценты**: cyan (#06b6d4), purple (#a855f7), blue (#3b82f6) для gradients, glow, borders
3. **Минимализм**: пространство > загромождение
4. **Интерактивность**: каждый hover - это микро-событие (glow, scale, color shift)
5. **Плавность**: transitions 300-500ms, easing curves
6. **Адаптивность**: Mobile-first, breakpoints на md: и lg:
7. **Performance**: оптимизированные анимации (transform, opacity), lazy loading