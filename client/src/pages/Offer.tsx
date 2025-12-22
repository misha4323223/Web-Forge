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
              Публичная оферта о заключении договора об оказании услуг
            </h1>

            <p className="text-muted-foreground mb-6">
              Дата последнего обновления: 22 декабря 2024 г.
            </p>

            <section className="mb-8 p-4 rounded-md bg-card/50 border border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Реквизиты Исполнителя</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
                <p><span className="text-foreground">ФИО:</span> Пимашин Михаил Игоревич</p>
                <p><span className="text-foreground">ИНН:</span> 711612442203</p>
                <p><span className="text-foreground">Адрес:</span> 301766, Тульская обл., г. Донской, ул. Новая, 49</p>
                <p><span className="text-foreground">Email:</span> mpwebstudio1@gmail.com</p>
                <p><span className="text-foreground">Телефон:</span> +7 (953) 181-41-36</p>
                <p><span className="text-foreground">Сайт:</span> https://www.mp-webstudio.ru</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Общие положения</h2>
              <p className="text-muted-foreground mb-4">
                В настоящей Публичной оферте содержатся условия заключения Договора об оказании услуг. 
                Нижеизложенный текст является официальным публичным предложением Исполнителя, адресованный 
                заинтересованному кругу лиц заключить Договор об оказании услуг в соответствии с положениями 
                Гражданского кодекса РФ.
              </p>
              <p className="text-muted-foreground mb-4">
                Договор об оказании услуг считается заключенным с момента совершения Заказчиком конклюдентных 
                действий, выраженных в регистрации учетной записи, оформлении заявки, осуществлении оплаты 
                или иных действиях, ясно выражающих принятие условий настоящей Оферты.
              </p>
              <p className="text-muted-foreground">
                Совершение указанных действий является подтверждением согласия обеих Сторон заключить 
                Договор на условиях, изложенных в настоящей Оферте.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Термины и определения</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <span className="text-foreground font-semibold">Договор</span> – текст настоящей Оферты, 
                  акцептованный Заказчиком путем совершения конклюдентных действий.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Конклюдентные действия</span> – поведение, 
                  которое выражает согласие с предложением контрагента заключить, изменить или расторгнуть договор, 
                  состоящее в полном или частичном выполнении условий, предложенных контрагентом.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Сайт Исполнителя</span> – совокупность программ 
                  и информации, доступ к которой обеспечивается посредством сети «Интернет» по адресу 
                  https://www.mp-webstudio.ru/
                </li>
                <li>
                  <span className="text-foreground font-semibold">Стороны Договора</span> – Исполнитель и Заказчик.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Услуга</span> – услуга, оказываемая Исполнителем 
                  Заказчику на условиях, установленных настоящей Офертой.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Предмет Договора</h2>
              <p className="text-muted-foreground mb-4">
                Исполнитель обязуется оказать Заказчику Услуги, а Заказчик обязуется оплатить их в размере, 
                порядке и сроки, установленные настоящим Договором.
              </p>
              <p className="text-muted-foreground mb-4">
                Наименование, количество, порядок и иные условия оказания Услуг определяются на основании 
                сведений Исполнителя при оформлении заявки Заказчиком либо устанавливаются на сайте Исполнителя.
              </p>
              <p className="text-muted-foreground mb-4">
                Исполнитель оказывает Услуги лично либо с привлечением третьих лиц, при этом за действия 
                третьих лиц Исполнитель отвечает перед Заказчиком как за свои собственные.
              </p>
              <p className="text-muted-foreground">
                Договор заключается путем акцепта настоящей Оферты через совершение конклюдентных действий, 
                включая: регистрацию учетной записи, оформление заявки, осуществление оплаты и получение услуг.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Права и обязанности Сторон</h2>
              
              <h3 className="text-lg font-semibold mb-3 text-foreground">Обязанности Исполнителя:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Оказывать Услуги в соответствии с положениями Договора в указанные сроки и объеме</li>
                <li>Предоставлять Заказчику доступ к необходимым разделам Сайта для получения информации</li>
                <li>Нести ответственность за хранение и обработку персональных данных Заказчика</li>
                <li>Обеспечивать сохранение конфиденциальности персональных данных</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">Права Исполнителя:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Изменять сроки оказания Услуг и условия Оферты в одностороннем порядке путем публикации на Сайте</li>
                <li>Новые условия действуют только в отношении вновь заключаемых Договоров</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">Обязанности Заказчика:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Предоставлять достоверную информацию о себе при получении Услуг</li>
                <li>Не воспроизводить, не копировать и не использовать информацию, ставшую доступной в связи с Услугами</li>
                <li>Принять Услуги, оказанные Исполнителем</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">Права Заказчика:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Требовать возврата денежных средств за неоказанные или некачественно оказанные услуги</li>
                <li>Требовать возврата средств, если услуги оказаны с нарушением сроков</li>
                <li>Отказаться от услуг по причинам в соответствии с законодательством РФ</li>
                <li>Гарантирует полное понимание и принятие всех условий Договора без оговорок</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Цена и порядок расчетов</h2>
              <p className="text-muted-foreground mb-4">
                Стоимость услуг Исполнителя определяется на основании сведений Исполнителя при оформлении 
                заявки Заказчиком либо устанавливается на сайте Исполнителя https://www.mp-webstudio.ru/
              </p>
              <p className="text-muted-foreground">
                Все расчеты по Договору производятся в безналичном порядке через платежную систему Robokassa 
                или иные платежные методы, предоставляемые Исполнителем.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Конфиденциальность и безопасность</h2>
              <p className="text-muted-foreground mb-4">
                При реализации настоящего Договора Стороны обеспечивают конфиденциальность и безопасность 
                персональных данных в соответствии с ФЗ от 27.07.2006 г. № 152-ФЗ «О персональных данных» 
                и ФЗ от 27.07.2006 г. № 149-ФЗ «Об информации, информационных технологиях и защите информации».
              </p>
              <p className="text-muted-foreground mb-4">
                Стороны обязуются сохранять конфиденциальность информации, полученной в ходе исполнения 
                Договора, и принять все возможные меры, чтобы защитить полученную информацию от разглашения.
              </p>
              <p className="text-muted-foreground">
                Под конфиденциальной информацией понимается любая информация, передаваемая Исполнителем и 
                Заказчиком в процессе реализации Договора и подлежащая защите в соответствии с законодательством.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Форс-мажор</h2>
              <p className="text-muted-foreground mb-4">
                Стороны освобождаются от ответственности за неисполнение или ненадлежащее исполнение 
                обязательств по Договору, если исполнение оказалось невозможным вследствие непреодолимой 
                силы, то есть чрезвычайных и непредотвратимых обстоятельств.
              </p>
              <p className="text-muted-foreground mb-4">
                В случае наступления таких обстоятельств Сторона обязана в течение 30 рабочих дней 
                уведомить об этом другую Сторону.
              </p>
              <p className="text-muted-foreground">
                Документ, выданный уполномоченным государственным органом, является достаточным 
                подтверждением наличия и продолжительности действия непреодолимой силы.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Применимое законодательство</h2>
              <p className="text-muted-foreground">
                Настоящая Оферта составлена в соответствии с Гражданским кодексом Российской Федерации, 
                Законом РФ «О защите прав потребителей» и иными нормативными правовыми актами Российской Федерации.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Контакты и изменения</h2>
              <p className="text-muted-foreground mb-4">
                По вопросам, связанным с данной Офертой, вы можете связаться с нами через форму контактов 
                на сайте https://www.mp-webstudio.ru/ или по телефону +7 (953) 181-41-36.
              </p>
              <p className="text-muted-foreground">
                Исполнитель оставляет за собой право вносить изменения в условия настоящей Оферты. 
                Новая редакция вступает в силу с момента её размещения на сайте. Размещение новых заказов 
                означает согласие с новой редакцией Оферты.
              </p>
            </section>

            <div className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                Принимая условия настоящей Оферты, Заказчик подтверждает, что прочитал и полностью согласен 
                со всеми её условиями. Дополнительную информацию об обработке персональных данных см. в 
                <a href="/privacy" className="text-primary hover:underline ml-1">Политике конфиденциальности</a>.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
