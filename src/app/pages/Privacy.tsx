import React from 'react';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-4xl font-black mb-4">Политика конфиденциальности</h1>
          <p className="text-secondary">Последнее обновление: 20 февраля 2026 года</p>
        </div>

        <div className="p-6 bg-secondary/50 rounded-2xl border border-base">
          <p className="text-secondary leading-relaxed">
            Мы в Абзац серьезно относимся к защите вашей конфиденциальности. Эта политика описывает,
            как мы собираем, используем и защищаем вашу личную информацию.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Какую информацию мы собираем</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-3">
            <h3 className="font-bold">Личная информация:</h3>
            <ul className="space-y-2 text-secondary ml-4">
              <li>• Имя и адрес электронной почты при регистрации</li>
              <li>• Фотография профиля (по желанию)</li>
              <li>• История чтения и предпочтения</li>
              <li>• Комментарии и отзывы на книги</li>
            </ul>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-3">
            <h3 className="font-bold">Техническая информация:</h3>
            <ul className="space-y-2 text-secondary ml-4">
              <li>• IP-адрес и данные о браузере</li>
              <li>• Файлы cookie для улучшения работы сайта</li>
              <li>• Статистика использования платформы</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Как мы используем информацию</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base">
            <ul className="space-y-3 text-secondary">
              <li className="flex gap-3">
                <span className="text-accent font-bold">→</span>
                <span>Предоставление персонализированных рекомендаций книг</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">→</span>
                <span>Улучшение функциональности платформы</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">→</span>
                <span>Отправка уведомлений о новых книгах и обновлениях</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">→</span>
                <span>Анализ статистики для улучшения сервиса</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">→</span>
                <span>Обеспечение безопасности вашего аккаунта</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Защита данных</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-4">
            <p className="text-secondary">
              Мы применяем современные методы шифрования и защиты данных:
            </p>
            <ul className="space-y-2 text-secondary ml-4">
              <li>• SSL/TLS шифрование для всех передаваемых данных</li>
              <li>• Регулярные проверки безопасности системы</li>
              <li>• Ограниченный доступ к персональным данным</li>
              <li>• Резервное копирование данных</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Ваши права</h2>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base space-y-3">
            <p className="text-secondary">Вы имеете право:</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-primary rounded-lg">
                <h3 className="font-bold mb-2">Доступ к данным</h3>
                <p className="text-sm text-secondary">Запросить копию ваших данных</p>
              </div>
              <div className="p-4 bg-primary rounded-lg">
                <h3 className="font-bold mb-2">Исправление</h3>
                <p className="text-sm text-secondary">Изменить неточные данные</p>
              </div>
              <div className="p-4 bg-primary rounded-lg">
                <h3 className="font-bold mb-2">Удаление</h3>
                <p className="text-sm text-secondary">Удалить ваш аккаунт</p>
              </div>
              <div className="p-4 bg-primary rounded-lg">
                <h3 className="font-bold mb-2">Экспорт</h3>
                <p className="text-sm text-secondary">Получить данные в формате JSON</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Файлы Cookie</h2>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base">
            <p className="text-secondary mb-4">
              Мы используем файлы cookie для улучшения вашего опыта на платформе.
              Cookie помогают нам запоминать ваши предпочтения и обеспечивать безопасность.
            </p>
            <p className="text-secondary">
              Вы можете отключить cookie в настройках браузера, но это может ограничить
              функциональность сайта.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Контакты</h2>
          </div>
          <div className="p-6 bg-secondary/30 rounded-xl border border-base">
            <p className="text-secondary mb-4">
              Если у вас есть вопросы о нашей политике конфиденциальности, свяжитесь с нами:
            </p>
            <div className="space-y-2">
              <p className="text-secondary">
                <span className="font-bold">Email:</span> privacy@abzatz.ru
              </p>
              <p className="text-secondary">
                <span className="font-bold">Адрес:</span> г. Москва, ул. Книжная, д. 1
              </p>
            </div>
          </div>
        </section>

        <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl">
          <p className="text-sm text-secondary text-center">
            Используя Абзац, вы соглашаетесь с нашей политикой конфиденциальности.
            Мы можем обновлять эту политику время от времени, и уведомим вас о существенных изменениях.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

