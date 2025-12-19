import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <a href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </a>

          <article className="prose prose-invert max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              Политика конфиденциальности
            </h1>

            <p className="text-muted-foreground mb-6">
              Дата последнего обновления: 15 декабря 2024 г.
            </p>

            <section className="mb-8 p-4 rounded-md bg-card/50 border border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Оператор персональных данных</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
                <p><span className="text-foreground">ФИО:</span> Пимашин Михаил Игоревич</p>
                <p><span className="text-foreground">Статус:</span> Самозанятый (НПД)</p>
                <p><span className="text-foreground">ИНН:</span> 711612442203</p>
                <p><span className="text-foreground">Адрес:</span> 301766, Тульская обл., г. Донской, ул. Новая, 49</p>
                <p><span className="text-foreground">Email:</span> mpwebstudio1@gmail.com</p>
                <p><span className="text-foreground">Телефон:</span> +7 (953) 181-41-36</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">1. Общие положения</h2>
              <p className="text-muted-foreground mb-4">
                Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок 
                обработки и защиты персональных данных пользователей сайта mp-webstudio.ru 
                (далее — «Сайт»), принадлежащего Пимашину Михаилу Игоревичу, самозанятому (НПД), 
                ИНН 711612442203 (далее — «Оператор»).
              </p>
              <p className="text-muted-foreground">
                Используя Сайт, вы соглашаетесь с условиями данной Политики. Если вы не согласны 
                с условиями Политики, пожалуйста, не используйте Сайт.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">2. Какие данные мы собираем</h2>
              <p className="text-muted-foreground mb-4">
                Мы можем собирать следующие персональные данные:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Имя и фамилия</li>
                <li>Адрес электронной почты</li>
                <li>Номер телефона</li>
                <li>Информация о проекте (при оформлении заказа)</li>
                <li>Данные об использовании сайта (cookies, IP-адрес, тип браузера)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">3. Цели обработки данных</h2>
              <p className="text-muted-foreground mb-4">
                Мы обрабатываем ваши персональные данные для следующих целей:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Обработка заявок и заказов</li>
                <li>Связь с вами по вопросам оказания услуг</li>
                <li>Выполнение договорных обязательств</li>
                <li>Улучшение качества работы Сайта</li>
                <li>Аналитика и статистика посещений</li>
                <li>Отправка информационных сообщений (при вашем согласии)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">4. Использование cookies</h2>
              <p className="text-muted-foreground mb-4">
                Сайт использует cookies — небольшие текстовые файлы, сохраняемые на вашем устройстве. 
                Cookies помогают нам:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Запоминать ваши предпочтения</li>
                <li>Анализировать использование Сайта</li>
                <li>Улучшать функциональность Сайта</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Вы можете отключить cookies в настройках браузера, однако это может повлиять 
                на работу некоторых функций Сайта.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">5. Защита данных</h2>
              <p className="text-muted-foreground">
                Мы принимаем необходимые технические и организационные меры для защиты ваших 
                персональных данных от несанкционированного доступа, изменения, раскрытия или 
                уничтожения. Данные передаются по защищённому протоколу HTTPS.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">6. Передача данных третьим лицам</h2>
              <p className="text-muted-foreground mb-4">
                Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением 
                следующих случаев:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>При вашем явном согласии</li>
                <li>Для выполнения договорных обязательств (платёжные системы, хостинг)</li>
                <li>По требованию законодательства РФ</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">7. Сервисы аналитики</h2>
              <p className="text-muted-foreground">
                Мы используем Яндекс.Метрику для анализа посещаемости Сайта. Яндекс.Метрика 
                собирает обезличенные данные о поведении пользователей. Подробнее о политике 
                конфиденциальности Яндекса:{" "}
                <a 
                  href="https://yandex.ru/legal/confidential/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  yandex.ru/legal/confidential
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">8. Ваши права</h2>
              <p className="text-muted-foreground mb-4">
                В соответствии с Федеральным законом № 152-ФЗ «О персональных данных» вы имеете право:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Получить информацию об обработке ваших данных</li>
                <li>Требовать уточнения или удаления ваших данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Обжаловать действия Оператора в Роскомнадзор</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">9. Срок хранения данных</h2>
              <p className="text-muted-foreground">
                Персональные данные хранятся в течение срока, необходимого для достижения целей 
                их обработки, но не более 3 лет с момента последнего взаимодействия с вами, 
                если иное не предусмотрено законодательством.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">10. Контакты</h2>
              <p className="text-muted-foreground mb-4">
                По вопросам, связанным с обработкой персональных данных, вы можете связаться с нами:
              </p>
              <ul className="list-none text-muted-foreground space-y-2">
                <li>Email: info@mp-webstudio.ru</li>
                <li>Сайт: mp-webstudio.ru</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">11. Изменения Политики</h2>
              <p className="text-muted-foreground">
                Оператор оставляет за собой право вносить изменения в настоящую Политику. 
                Новая редакция вступает в силу с момента её размещения на Сайте. 
                Продолжение использования Сайта после внесения изменений означает ваше согласие 
                с новой редакцией Политики.
              </p>
            </section>

            <div className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                Настоящая Политика разработана в соответствии с Федеральным законом от 27.07.2006 
                № 152-ФЗ «О персональных данных» и иными нормативными правовыми актами 
                Российской Федерации в области защиты персональных данных.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
