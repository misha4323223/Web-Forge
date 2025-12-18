import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Offer() {
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
              Публичная оферта
            </h1>

            <p className="text-muted-foreground mb-6">
              Дата последнего обновления: 18 декабря 2024 г.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">1. Предмет договора</h2>
              <p className="text-muted-foreground mb-4">
                Настоящая публичная оферта (далее — «Оферта») является предложением от компании 
                MP.WebStudio (далее — «Исполнитель») заключить договор оказания услуг по разработке 
                веб-сайтов, интернет-магазинов, лендингов и услуг веб-разработки (далее — «Услуги»).
              </p>
              <p className="text-muted-foreground">
                Исполнитель готов оказывать Услуги на условиях, изложенных в настоящей Оферте, 
                любому лицу, который выражает желание воспользоваться Услугами путём размещения 
                заказа на сайте mp-webstudio.ru.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">2. Виды услуг</h2>
              <p className="text-muted-foreground mb-4">
                Исполнитель оказывает следующие услуги веб-разработки:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Разработка лендингов (одностраничные продающие сайты)</li>
                <li>Разработка корпоративных сайтов (многостраничные сайты компаний)</li>
                <li>Разработка интернет-магазинов (каталог товаров, корзина, оформление заказа)</li>
                <li>Подключение интеграций (платёжные системы, аналитика, мессенджеры)</li>
                <li>Дополнительные услуги (SEO, аналитика, анимации, чат-боты)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">3. Порядок заключения договора</h2>
              <p className="text-muted-foreground mb-4">
                Договор считается заключённым с момента размещения вами заказа на сайте mp-webstudio.ru 
                посредством заполнения формы заказа и подтверждения согласия с условиями настоящей 
                Оферты. Акцепт Оферты осуществляется путём совершения Потребителем действий, 
                указанных на сайте Исполнителя.
              </p>
              <p className="text-muted-foreground">
                Размещение заказа означает, что Потребитель прочитал и принял условия настоящей 
                Оферты полностью и безоговорочно.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">4. Цены и стоимость услуг</h2>
              <p className="text-muted-foreground mb-4">
                Стоимость Услуг указана на сайте mp-webstudio.ru в разделе «Заказать сайт» и 
                рассчитывается на основе:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Типа проекта (лендинг, корпоративный сайт, магазин)</li>
                <li>Выбранных дополнительных услуг и интеграций</li>
                <li>Количества страниц и функциональности</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Цены указаны в российских рублях (РУБ) и включают стоимость разработки, дизайна 
                и базовой функциональности. Дополнительные услуги оплачиваются отдельно.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">5. Порядок оплаты</h2>
              <p className="text-muted-foreground mb-4">
                Оплата Услуг производится путём внесения денежных средств через платёжную систему 
                Robokassa. После размещения заказа Потребитель будет перенаправлен на платёжный 
                шлюз Robokassa для совершения платежа.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Платёжные методы: карты Visa, MasterCard, МИР, онлайн-банкинг, Яндекс.Касса и другие</li>
                <li>Валюта: Российские рубли (РУБ)</li>
                <li>Комиссия платёжной системы: на счёт Потребителя</li>
                <li>Работы начинаются после подтверждения платежа</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">6. Порядок оказания услуг</h2>
              <p className="text-muted-foreground mb-4">
                После оплаты и подтверждения заказа:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                <li>Исполнитель свяжется с Потребителем для обсуждения деталей проекта</li>
                <li>Начинается разработка сайта в соответствии с техническим заданием</li>
                <li>Потребитель получит ссылку на превью сайта для просмотра</li>
                <li>Вносятся правки и доработки по замечаниям Потребителя (в рамках включённого объёма)</li>
                <li>Сайт запускается на домене Потребителя (или хостинге Исполнителя)</li>
                <li>Передача исходного кода и документации (если предусмотрено условиями)</li>
              </ol>
              <p className="text-muted-foreground mt-4">
                Сроки разработки обсуждаются отдельно и зависят от сложности проекта.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">7. Права и обязанности сторон</h2>
              
              <h3 className="text-lg font-semibold mb-3 text-foreground">Обязанности Исполнителя:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Оказывать услуги в соответствии с условиями Оферты</li>
                <li>Соблюдать сроки разработки, обсуждённые с Потребителем</li>
                <li>Обеспечить качество выполняемых работ</li>
                <li>Обработать персональные данные в соответствии с законодательством РФ</li>
                <li>Защитить конфиденциальную информацию Потребителя</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">Права Исполнителя:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Использовать выполненные работы в портфолио (с согласия Потребителя)</li>
                <li>Прекратить оказание услуг при неуплате</li>
                <li>Требовать точное предоставление информации, необходимой для работы</li>
                <li>Отказать в оказании услуг без объяснения причин</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">Обязанности Потребителя:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Своевременно оплачивать услуги</li>
                <li>Предоставлять точную информацию, необходимую для разработки</li>
                <li>Сообщать о замечаниях и пожеланиях в разумные сроки</li>
                <li>Не использовать сайт в целях, нарушающих законодательство РФ</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">Права Потребителя:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Получить качественный сайт, отвечающий требованиям Оферты</li>
                <li>Вносить замечания и пожелания по результатам работ</li>
                <li>Отказаться от услуг с возвратом денежных средств (в соответствии с п. 10)</li>
                <li>Защита своих персональных данных</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">8. Ограничение ответственности</h2>
              <p className="text-muted-foreground mb-4">
                Исполнитель не несёт ответственность за:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Убытки, вызванные неправильным использованием сайта Потребителем</li>
                <li>Потерю данных, вызванную действиями Потребителя</li>
                <li>Временное нарушение доступа к сайту из-за технического обслуживания</li>
                <li>Нарушение авторских прав, если контент предоставлен Потребителем</li>
                <li>Убытки третьих лиц, вызванные использованием сайта</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">9. Гарантии</h2>
              <p className="text-muted-foreground mb-4">
                Исполнитель гарантирует:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Функциональность сайта в соответствии с условиями Оферты</li>
                <li>Адаптивность сайта под различные устройства (мобильные, планшеты, ПК)</li>
                <li>Безопасность передачи данных (HTTPS)</li>
                <li>Базовую оптимизацию под поисковые системы</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Гарантия не распространяется на сбои, вызванные действиями Потребителя 
                или третьих лиц, а также на хостинг и домен (если они предоставляются отдельно).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">10. Возврат денежных средств</h2>
              <p className="text-muted-foreground mb-4">
                Возврат денежных средств возможен в следующих случаях:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Если работы не начались — полный возврат</li>
                <li>Если работы были начаты, но не завершены в установленные сроки 
                  (более 60 дней задержки) — возврат 50% стоимости</li>
                <li>Если Потребитель отказывается от услуг по объективным причинам — 
                  возврат возможен в рамках действующего законодательства РФ</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Возврат производится на ту же платёжную систему, через которую была 
                произведена оплата, в течение 7-14 рабочих дней.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">11. Интеллектуальная собственность</h2>
              <p className="text-muted-foreground mb-4">
                После полной оплаты Потребитель получает право на использование разработанного 
                сайта. Исполнитель сохраняет право:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Размещать сайт в портфолио и использовать скриншоты в маркетинге 
                  (с согласия Потребителя)</li>
                <li>Использовать общие исходные коды и библиотеки компонентов</li>
                <li>Использовать опыт разработки в будущих проектах</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Контент, предоставленный Потребителем (тексты, изображения, логотипы), 
                остаётся собственностью Потребителя.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">12. Конфиденциальность</h2>
              <p className="text-muted-foreground mb-4">
                Исполнитель обязуется сохранять конфиденциальность всей информации, 
                полученной от Потребителя, и не разглашать её третьим лицам без письменного 
                согласия, за исключением случаев, требуемых законодательством РФ.
              </p>
              <p className="text-muted-foreground">
                Дополнительную информацию о обработке персональных данных см. в 
                <a 
                  href="/privacy" 
                  className="text-primary hover:underline ml-1"
                >
                  Политике конфиденциальности
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">13. Разрешение споров</h2>
              <p className="text-muted-foreground mb-4">
                Все споры и разногласия, возникающие из настоящей Оферты или в связи с ней, 
                будут разрешаться путём переговоров между Потребителем и Исполнителем.
              </p>
              <p className="text-muted-foreground mb-4">
                Если стороны не смогут достичь согласия в течение 30 дней, спор будет 
                разрешен в соответствии с законодательством Российской Федерации и подлежит 
                юрисдикции судов места нахождения Исполнителя.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">14. Соответствие законодательству</h2>
              <p className="text-muted-foreground">
                Настоящая Оферта составлена в соответствии с Гражданским кодексом 
                Российской Федерации, Законом РФ «О защите прав потребителей» 
                и иными нормативными правовыми актами Российской Федерации.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">15. Контакты</h2>
              <p className="text-muted-foreground mb-4">
                По вопросам, связанным с данной Офертой, вы можете связаться с нами:
              </p>
              <ul className="list-none text-muted-foreground space-y-2">
                <li>Email: info@mp-webstudio.ru</li>
                <li>Сайт: mp-webstudio.ru</li>
                <li>Телефон: доступен через форму контактов на сайте</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">16. Изменение условий Оферты</h2>
              <p className="text-muted-foreground">
                Исполнитель оставляет за собой право вносить изменения в условия настоящей 
                Оферты. Новая редакция вступает в силу с момента её размещения на сайте. 
                Размещение новых заказов означает согласие с новой редакцией Оферты.
              </p>
            </section>

            <div className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                Принимая условия настоящей Оферты, Потребитель подтверждает, что 
                прочитал и полностью согласен со всеми её условиями.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
