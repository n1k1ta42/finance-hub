import { Layout } from '@/components/layout'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Bell,
  CreditCard,
  HelpCircle,
  ListTodo,
  PieChart,
  Receipt,
  User,
  Wallet,
} from 'lucide-react'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

function SupportPage() {
  return (
    <Layout links={[{ href: '/support', label: 'Поддержка' }]}>
      <div className='container py-6'>
        <h1 className='mb-4 text-3xl font-bold tracking-tight'>
          Поддержка и руководство пользователя
        </h1>
        <p className='text-muted-foreground mb-6'>
          Добро пожаловать в руководство по использованию Finance Hub. Здесь вы
          найдете подробные инструкции по всем функциям приложения.
        </p>

        <Tabs defaultValue='getting-started' className='mb-8'>
          <TabsList className='mb-4'>
            <TabsTrigger value='getting-started'>Начало работы</TabsTrigger>
            <TabsTrigger value='features'>Основные функции</TabsTrigger>
            <TabsTrigger value='subscriptions'>Подписки</TabsTrigger>
            <TabsTrigger value='faq'>FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value='getting-started'>
            <Card>
              <CardHeader>
                <CardTitle>Начало работы с Finance Hub</CardTitle>
                <CardDescription>
                  Основные шаги для начала работы с приложением
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>1. Регистрация и вход</h3>
                  <p>
                    Для начала работы необходимо зарегистрироваться или войти в
                    существующий аккаунт через страницу входа. После регистрации
                    вы получите доступ к базовым функциям приложения.
                  </p>
                  <p className='text-sm font-medium text-green-600'>
                    При регистрации вам автоматически предоставляется
                    пожизненная базовая подписка, которая дает доступ к основным
                    функциям приложения без временных ограничений.
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>2. Настройка профиля</h3>
                  <p>
                    Перейдите в раздел "Профиль", чтобы обновить личную
                    информацию и настроить предпочтения.
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>
                    3. Добавление категорий
                  </h3>
                  <p>
                    Для удобного ведения учета создайте категории доходов и
                    расходов, которые соответствуют вашим финансовым потокам.
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>
                    4. Добавление первой транзакции
                  </h3>
                  <p>
                    Добавьте свою первую транзакцию через раздел "Транзакции"
                    или прямо с дашборда, нажав на кнопку "Добавить".
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='features'>
            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='dashboard'>
                <AccordionTrigger className='flex gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  <span>Дашборд</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>
                    Дашборд предоставляет общий обзор вашего финансового
                    состояния:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Баланс доходов и расходов за выбранный период</li>
                    <li>Возможность быстрого добавления новых транзакций</li>
                    <li>
                      Графики распределения расходов по категориям (для премиум
                      подписки)
                    </li>
                    <li>
                      Выбор различных периодов для анализа: неделя, месяц, год
                    </li>
                    <li>Быстрый доступ к последним транзакциям</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='transactions'>
                <AccordionTrigger className='flex gap-2'>
                  <Receipt className='h-5 w-5' />
                  <span>Транзакции</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>В разделе "Транзакции" вы можете:</p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Добавлять новые транзакции (доходы и расходы)</li>
                    <li>Просматривать историю всех транзакций</li>
                    <li>Фильтровать транзакции по типу, категории и дате</li>
                    <li>Редактировать и удалять существующие записи</li>
                    <li>Экспортировать данные (для премиум подписки)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='categories'>
                <AccordionTrigger className='flex gap-2'>
                  <ListTodo className='h-5 w-5' />
                  <span>Категории</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>
                    Раздел "Категории" позволяет организовать ваши финансы:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>
                      Создавать и редактировать категории доходов и расходов
                    </li>
                    <li>Назначать иконки и цвета для визуального различия</li>
                    <li>Группировать подкатегории (для премиум подписки)</li>
                    <li>Анализировать расходы по категориям</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='statistics'>
                <AccordionTrigger className='flex gap-2'>
                  <PieChart className='h-5 w-5' />
                  <span>Статистика</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>
                    Раздел "Статистика" предоставляет детальный анализ ваших
                    финансов:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Визуализация доходов и расходов в виде графиков</li>
                    <li>Сравнение расходов по категориям и периодам</li>
                    <li>Анализ трендов за длительные периоды</li>
                    <li>
                      Прогнозирование будущих расходов (для профессиональной
                      подписки)
                    </li>
                    <li>Выгрузка отчетов в различных форматах</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='budgets'>
                <AccordionTrigger className='flex gap-2'>
                  <Wallet className='h-5 w-5' />
                  <span>Бюджеты</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>
                    Функционал "Бюджеты" доступен для премиум и профессиональной
                    подписки:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Создание месячных и годовых бюджетов</li>
                    <li>Планирование расходов по категориям</li>
                    <li>
                      Отслеживание прогресса расходов относительно бюджета
                    </li>
                    <li>Уведомления о превышении бюджета</li>
                    <li>Копирование бюджетов на следующие периоды</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='payments'>
                <AccordionTrigger className='flex gap-2'>
                  <CreditCard className='h-5 w-5' />
                  <span>Платежи</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>
                    Раздел "Платежи" позволяет управлять регулярными платежами:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Настройка регулярных платежей и подписок</li>
                    <li>Отслеживание предстоящих платежей</li>
                    <li>Аналитика расходов на подписки и регулярные платежи</li>
                    <li>Планирование будущих платежей</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='notifications'>
                <AccordionTrigger className='flex gap-2'>
                  <Bell className='h-5 w-5' />
                  <span>Уведомления</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>
                    Раздел "Уведомления" помогает не пропустить важные
                    финансовые события:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Получение уведомлений о превышении бюджета</li>
                    <li>Напоминания о предстоящих платежах</li>
                    <li>Уведомления о необычных расходах</li>
                    <li>Настройка предпочтений уведомлений</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='profile'>
                <AccordionTrigger className='flex gap-2'>
                  <User className='h-5 w-5' />
                  <span>Профиль</span>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p className='mb-2'>
                    В разделе "Профиль" вы можете управлять своим аккаунтом:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Обновление личной информации</li>
                    <li>Изменение пароля и настроек безопасности</li>
                    <li>Управление предпочтениями приложения</li>
                    <li>Просмотр истории подписок</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value='subscriptions'>
            <Card>
              <CardHeader>
                <CardTitle>Планы подписок</CardTitle>
                <CardDescription>
                  Выберите план, который подходит вашим потребностям
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>
                    Базовая подписка (бесплатно)
                  </h3>
                  <p>Включает основные функции для учёта финансов:</p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Добавление и учет транзакций</li>
                    <li>Создание категорий</li>
                    <li>Базовая статистика</li>
                    <li>Ручное добавление платежей</li>
                  </ul>
                  <p className='mt-2 text-sm font-medium text-green-600'>
                    При регистрации вам автоматически выдается пожизненная
                    базовая подписка. Вы можете пользоваться ее возможностями
                    без ограничений по времени.
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>Премиум подписка</h3>
                  <p>
                    Добавляет расширенные функции для анализа и планирования:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Расширенная статистика и аналитика</li>
                    <li>Создание бюджетов</li>
                    <li>Регулярные платежи и автоматизация</li>
                    <li>Прогнозирование расходов</li>
                    <li>Автоматические уведомления</li>
                  </ul>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>
                    Профессиональная подписка
                  </h3>
                  <p>Полный доступ ко всем функциям без ограничений:</p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Все функции премиум подписки</li>
                    <li>Неограниченное количество категорий и транзакций</li>
                    <li>Расширенные регулярные платежи</li>
                    <li>Экспорт данных</li>
                    <li>Расширенное прогнозирование и аналитика</li>
                    <li>Приоритетная поддержка</li>
                    <li>Дополнительные интеграции</li>
                  </ul>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>Типы оплаты</h3>
                  <p>Доступны следующие варианты оплаты:</p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Ежемесячная подписка</li>
                    <li>Годовая подписка (скидка 20%)</li>
                    <li>
                      Подписка "Навсегда" - единоразовый платеж без
                      необходимости продления
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='faq'>
            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='faq-1'>
                <AccordionTrigger>
                  Как добавить новую транзакцию?
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  Добавить новую транзакцию можно несколькими способами:
                  <ol className='mt-2 list-inside list-decimal space-y-1'>
                    <li>На дашборде нажмите кнопку "Добавить транзакцию"</li>
                    <li>В разделе "Транзакции" нажмите "Добавить"</li>
                    <li>
                      Заполните необходимые поля: сумму, категорию, дату и
                      описание
                    </li>
                    <li>Выберите тип транзакции (доход или расход)</li>
                    <li>Нажмите "Сохранить"</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='faq-2'>
                <AccordionTrigger>
                  Как создать новую категорию?
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  Для создания новой категории:
                  <ol className='mt-2 list-inside list-decimal space-y-1'>
                    <li>Перейдите в раздел "Категории"</li>
                    <li>Нажмите кнопку "Добавить категорию"</li>
                    <li>Введите название категории</li>
                    <li>Выберите тип (доход или расход)</li>
                    <li>Выберите иконку и цвет (опционально)</li>
                    <li>Нажмите "Сохранить"</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='faq-3'>
                <AccordionTrigger>
                  Как изменить период для анализа на дашборде?
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  Для изменения периода анализа на дашборде:
                  <ol className='mt-2 list-inside list-decimal space-y-1'>
                    <li>
                      В верхней части дашборда найдите поле с текущим периодом
                    </li>
                    <li>
                      Нажмите на него для открытия календаря или выпадающего
                      меню
                    </li>
                    <li>
                      Выберите предустановленные периоды (неделя, месяц, год)
                      или выберите произвольный период в календаре
                    </li>
                    <li>
                      Дашборд автоматически обновится для выбранного периода
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='faq-4'>
                <AccordionTrigger>Как создать бюджет?</AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  Создание бюджета доступно для премиум и профессиональной
                  подписки:
                  <ol className='mt-2 list-inside list-decimal space-y-1'>
                    <li>Перейдите в раздел "Бюджеты"</li>
                    <li>Нажмите "Создать бюджет"</li>
                    <li>Выберите период (месяц, год)</li>
                    <li>Добавьте лимиты расходов по категориям</li>
                    <li>Установите общую сумму бюджета</li>
                    <li>Нажмите "Сохранить"</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='faq-5'>
                <AccordionTrigger>
                  Как обновить мой тарифный план?
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  Для обновления тарифного плана:
                  <ol className='mt-2 list-inside list-decimal space-y-1'>
                    <li>Перейдите в раздел "Подписки"</li>
                    <li>Выберите интересующий вас план</li>
                    <li>Выберите период оплаты (месяц, год или навсегда)</li>
                    <li>Нажмите "Выбрать план"</li>
                    <li>Заполните платежную информацию</li>
                    <li>Подтвердите оплату</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='faq-6'>
                <AccordionTrigger>
                  Как экспортировать данные о транзакциях?
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  Экспорт данных доступен для премиум и профессиональной
                  подписки:
                  <ol className='mt-2 list-inside list-decimal space-y-1'>
                    <li>Перейдите в раздел "Транзакции"</li>
                    <li>Используйте фильтры для выбора нужных транзакций</li>
                    <li>Нажмите кнопку "Экспорт"</li>
                    <li>Выберите формат (CSV, Excel) и период</li>
                    <li>Нажмите "Скачать"</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='faq-7'>
                <AccordionTrigger>
                  Что делать, если я забыл пароль?
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  Если вы забыли пароль:
                  <ol className='mt-2 list-inside list-decimal space-y-1'>
                    <li>На странице входа нажмите "Забыли пароль?"</li>
                    <li>Введите email, связанный с вашим аккаунтом</li>
                    <li>Проверьте почту и следуйте инструкциям в письме</li>
                    <li>Создайте новый надежный пароль</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='faq-8'>
                <AccordionTrigger>
                  Нужно ли мне оформлять подписку после регистрации?
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <p>
                    Нет, при регистрации вам автоматически выдается бесплатная
                    пожизненная базовая подписка. Вы сразу получаете доступ ко
                    всем базовым функциям приложения без ограничений по времени.
                  </p>
                  <p className='mt-2'>
                    Если вам потребуются расширенные функции (например,
                    бюджетирование, регулярные платежи, расширенная статистика
                    или экспорт данных), вы всегда можете перейти на Премиум или
                    Профессиональную подписку в разделе "Подписки".
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <HelpCircle className='h-5 w-5' />
              Нужна дополнительная помощь?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>
              Если у вас остались вопросы или вам нужна дополнительная помощь,
              пожалуйста, свяжитесь с нашей командой поддержки:
            </p>
            <div className='space-y-2'>
              {/*<p>*/}
              {/*  <strong>Электронная почта:</strong>{' '}*/}
              {/*  support@finance-hub.example.com*/}
              {/*</p>*/}
              {/*<p>*/}
              {/*  <strong>Время работы:</strong> Пн-Пт с 9:00 до 18:00*/}
              {/*</p>*/}
              <p>
                <strong>Telegram:</strong>{' '}
                <a
                  href='https://t.me/financehub_app'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  @financehub_app
                </a>
              </p>
              {/*<p>*/}
              {/*  <strong>Обратная связь:</strong> Используйте форму обратной*/}
              {/*  связи в разделе "Профиль" для отправки предложений и сообщений*/}
              {/*  об ошибках*/}
              {/*</p>*/}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
