import React from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';
import { motion } from 'motion/react';

export const Terms: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-4xl font-black mb-4">Условия использования</h1>
          <p className="text-secondary">Последнее обновление: 20 февраля 2026 года</p>
        </div>

        <div className="p-6 bg-secondary/50 rounded-2xl border border-base">
          <p className="text-secondary leading-relaxed">
            Добро пожаловать в Абзац! Используя нашу платформу, вы соглашаетесь соблюдать
            следующие условия использования. Пожалуйста, внимательно прочитайте их.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Общие положения</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-4">
            <p className="text-secondary">
              Абзац — это онлайн-платформа для чтения книг, обсуждения и обмена мнениями
              о литературе. Мы предоставляем доступ к лучшим историям и создаем сообщество
              внимательных читателей.
            </p>
            <p className="text-secondary">
              Регистрируясь на платформе, вы подтверждаете, что вам исполнилось 14 лет,
              или вы имеете согласие родителей/опекунов на использование сервиса.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold">Разрешенное использование</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base">
            <ul className="space-y-3 text-secondary">
              <li className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Чтение книг, доступных на платформе</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Оставление честных отзывов и комментариев</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Участие в обсуждениях на форуме</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Создание личной коллекции избранного</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Рекомендации книг другим пользователям</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-bold">Запрещенное использование</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base">
            <ul className="space-y-3 text-secondary">
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Копирование и распространение контента без разрешения</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Публикация оскорбительных или незаконных материалов</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Использование ботов или автоматизированных систем</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Попытки взлома или нарушения безопасности</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Создание нескольких аккаунтов для манипуляций</span>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Спам и нежелательная реклама</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Авторские права</h2>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-4">
            <p className="text-secondary">
              Все книги, представленные на платформе, защищены авторским правом.
              Пользователи могут читать книги в рамках платформы, но не имеют права:
            </p>
            <ul className="space-y-2 text-secondary ml-4">
              <li>• Скачивать книги без явного разрешения</li>
              <li>• Распространять контент на сторонних ресурсах</li>
              <li>• Использовать материалы в коммерческих целях</li>
              <li>• Модифицировать или изменять произведения</li>
            </ul>
            <p className="text-secondary mt-4">
              Нарушение авторских прав может повлечь за собой удаление аккаунта и
              юридические последствия.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Правила сообщества</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 bg-secondary/30 rounded-xl border border-base">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                Уважение
              </h3>
              <p className="text-sm text-secondary">
                Относитесь к другим пользователям с уважением. Запрещены оскорбления,
                травля и дискриминация.
              </p>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl border border-base">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                Честность
              </h3>
              <p className="text-sm text-secondary">
                Оставляйте честные отзывы. Запрещена накрутка рейтингов и
                ложные рецензии.
              </p>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl border border-base">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                Релевантность
              </h3>
              <p className="text-sm text-secondary">
                Комментируйте по теме. Избегайте спама и нерелевантных
                сообщений в обсуждениях.
              </p>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl border border-base">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                Легальность
              </h3>
              <p className="text-sm text-secondary">
                Не размещайте незаконный контент, включая пиратские ссылки
                и материалы.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Ответственность</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-4">
            <p className="text-secondary">
              Абзац предоставляется "как есть". Мы не несем ответственности за:
            </p>
            <ul className="space-y-2 text-secondary ml-4">
              <li>• Временные перерывы в работе сервиса</li>
              <li>• Потерю данных в результате технических сбоев</li>
              <li>• Контент, опубликованный другими пользователями</li>
              <li>• Внешние ссылки, размещенные на форуме</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Модерация и санкции</h2>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-4">
            <p className="text-secondary">
              Администрация платформы оставляет за собой право:
            </p>
            <ul className="space-y-2 text-secondary ml-4">
              <li>• Удалять контент, нарушающий правила</li>
              <li>• Временно блокировать аккаунты нарушителей</li>
              <li>• Перманентно удалять аккаунты за серьезные нарушения</li>
              <li>• Передавать информацию правоохранительным органам при необходимости</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Изменения условий</h2>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base">
            <p className="text-secondary">
              Мы можем обновлять эти условия время от времени. Существенные изменения
              будут доведены до вашего сведения через уведомления на платформе или по
              электронной почте. Продолжая использовать Абзац после внесения изменений,
              вы соглашаетесь с новыми условиями.
            </p>
          </div>
        </section>

        <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl">
          <p className="text-sm text-secondary text-center">
            Если у вас есть вопросы об условиях использования, свяжитесь с нами:
            <a href="mailto:support@abzatz.ru" className="text-accent font-bold ml-1">
              support@abzatz.ru
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

