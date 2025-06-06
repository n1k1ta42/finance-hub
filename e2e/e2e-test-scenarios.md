# Сценарии для E2E тестирования Finance Hub

## Введение

В этом документе описаны сценарии для создания комплексных End-to-End (E2E) тестов для приложения Finance Hub. Эти тесты должны имитировать реальные действия пользователей и проверять корректность работы всего приложения от начала до конца, включая взаимодействие между компонентами.

## Инструменты для E2E тестирования

Рекомендуемые инструменты для реализации E2E тестов:
- **Cypress** - популярный фреймворк для E2E тестирования
- **Playwright** - современный инструмент от Microsoft для тестирования браузеров
- **Testing Library** - уже используется в проекте для компонентного тестирования

## Сценарии тестирования

### 1. Аутентификация

#### 1.1. Вход в систему

**Описание**: Проверка корректного входа пользователя в систему.

**Шаги**:
1. Открыть страницу входа (/login)
2. Ввести корректный email и пароль
3. Нажать кнопку "Войти"
4. Проверить, что пользователь перенаправлен на главную страницу
5. Проверить, что в профиле отображается информация о текущем пользователе

**Альтернативный сценарий (неверные учетные данные)**:
1. Открыть страницу входа
2. Ввести неверный email или пароль
3. Нажать кнопку "Войти"
4. Проверить, что отображается сообщение об ошибке
5. Проверить, что пользователь остается на странице входа

#### 1.2. Регистрация нового пользователя

**Описание**: Проверка процесса регистрации нового пользователя.

**Шаги**:
1. Открыть страницу регистрации (/register)
2. Заполнить форму валидными данными (email, имя, фамилия, пароль)
3. Нажать кнопку "Зарегистрироваться"
4. Проверить, что пользователь перенаправлен на главную страницу
5. Проверить, что в профиле отображаются данные нового пользователя

**Альтернативные сценарии**:
- Попытка регистрации с уже существующим email
- Попытка регистрации с недопустимым паролем (слишком короткий)
- Проверка валидации форм на стороне клиента

#### 1.3. Восстановление пароля

**Описание**: Проверка процесса восстановления пароля.

**Шаги**:
1. Открыть страницу входа
2. Нажать на ссылку "Забыли пароль?"
3. Ввести email
4. Нажать кнопку "Восстановить"
5. Проверить, что отображается сообщение об отправке инструкций
6. (Имитировать получение токена)
7. Открыть страницу сброса пароля с токеном
8. Ввести новый пароль
9. Проверить, что пользователь может войти с новым паролем

#### 1.4. Выход из системы

**Описание**: Проверка корректного выхода из системы.

**Шаги**:
1. Войти в систему
2. Нажать на профиль пользователя
3. Выбрать опцию "Выйти"
4. Проверить, что пользователь перенаправлен на страницу входа
5. Проверить, что защищенные страницы недоступны без повторного входа

### 2. Управление транзакциями

#### 2.1. Добавление новой транзакции

**Описание**: Проверка добавления новой финансовой транзакции.

**Шаги**:
1. Войти в систему
2. Перейти на страницу транзакций
3. Нажать кнопку "Создать новую транзакцию"
4. Заполнить форму транзакции:
   - Выбрать тип (доход/расход)
   - Ввести сумму
   - Выбрать категорию
   - Ввести описание
   - Выбрать дату
5. Нажать кнопку "Создать"
6. Проверить, что транзакция появилась в списке
7. Проверить, что общий баланс изменился соответственно

#### 2.2. Редактирование существующей транзакции

**Описание**: Проверка возможности изменения данных существующей транзакции.

**Шаги**:
1. Войти в систему
2. Перейти на страницу транзакций
3. Выбрать существующую транзакцию
4. Нажать кнопку "Редактировать"
5. Изменить данные (сумму, категорию, описание и т.д.)
6. Нажать кнопку "Обновить"
7. Проверить, что данные транзакции обновились
8. Проверить, что общий баланс обновился соответственно

#### 2.3. Удаление транзакции

**Описание**: Проверка возможности удаления транзакции.

**Шаги**:
1. Войти в систему
2. Перейти на страницу транзакций
3. Найти существующую транзакцию
4. Нажать кнопку удаления
5. Подтвердить удаление в диалоговом окне
6. Проверить, что транзакция исчезла из списка
7. Проверить, что общий баланс обновился соответственно

#### 2.4. Фильтрация транзакций

**Описание**: Проверка возможности фильтрации транзакций по различным параметрам.

**Шаги**:
1. Войти в систему
2. Перейти на страницу транзакций
3. Применить различные фильтры:
   - По типу (доход/расход)
   - По категории
   - По дате (период)
4. Проверить, что отображаются только транзакции, соответствующие фильтрам
5. Сбросить фильтры
6. Проверить, что отображаются все транзакции

### 3. Управление категориями

#### 3.1. Создание новой категории

**Описание**: Проверка возможности создания новой категории для транзакций.

**Шаги**:
1. Войти в систему
2. Перейти на страницу категорий
3. Нажать кнопку "Добавить категорию"
4. Заполнить форму (название, тип, иконка)
5. Сохранить новую категорию
6. Проверить, что категория появилась в списке
7. Проверить, что новую категорию можно выбрать при создании транзакции

#### 3.2. Редактирование и удаление категорий

**Описание**: Проверка возможности изменения и удаления категорий.

**Шаги для редактирования**:
1. Войти в систему
2. Перейти на страницу категорий
3. Выбрать существующую категорию
4. Нажать кнопку "Редактировать"
5. Изменить название или иконку
6. Сохранить изменения
7. Проверить, что изменения отображаются в списке категорий

**Шаги для удаления**:
1. Войти в систему
2. Перейти на страницу категорий
3. Выбрать существующую категорию
4. Нажать кнопку "Удалить"
5. Подтвердить удаление
6. Проверить, что категория исчезла из списка

### 4. Управление профилем

#### 4.1. Просмотр и редактирование профиля

**Описание**: Проверка возможности просмотра и редактирования профиля пользователя.

**Шаги**:
1. Войти в систему
2. Нажать на аватар пользователя
3. Выбрать пункт "Профиль"
4. Проверить, что отображается корректная информация о пользователе
5. Нажать кнопку "Редактировать профиль"
6. Изменить информацию (имя, фамилия)
7. Сохранить изменения
8. Проверить, что изменения отображаются в профиле

#### 4.2. Изменение пароля

**Описание**: Проверка возможности изменения пароля пользователя.

**Шаги**:
1. Войти в систему
2. Перейти в настройки профиля
3. Выбрать опцию "Изменить пароль"
4. Ввести текущий пароль
5. Ввести новый пароль и подтверждение
6. Сохранить изменения
7. Выйти из системы
8. Попробовать войти с новым паролем
9. Проверить, что вход успешен

### 5. Управление подпиской

#### 5.1. Просмотр доступных планов подписки

**Описание**: Проверка отображения планов подписки.

**Шаги**:
1. Войти в систему
2. Перейти на страницу подписок
3. Проверить, что отображаются все доступные планы подписки
4. Проверить, что для каждого плана отображается корректная информация (цена, функции)

#### 5.2. Оформление подписки

**Описание**: Проверка процесса оформления подписки Pro.

**Шаги**:
1. Войти в систему
2. Перейти на страницу подписок
3. Выбрать план "Pro"
4. Нажать кнопку "Улучшить до Pro"
5. Заполнить платежную информацию
6. Подтвердить подписку
7. Проверить, что статус подписки изменился на "Pro"
8. Проверить, что стали доступны дополнительные функции

### 6. Аналитика и отчеты

#### 6.1. Просмотр аналитических данных

**Описание**: Проверка корректного отображения аналитических данных.

**Шаги**:
1. Войти в систему
2. Перейти на страницу аналитики
3. Проверить, что отображаются графики и диаграммы
4. Изменить период отображения данных
5. Проверить, что данные на графиках изменились соответственно
6. Проверить корректность отображения сумм и процентов

#### 6.2. Формирование отчетов

**Описание**: Проверка возможности формирования и скачивания отчетов.

**Шаги**:
1. Войти в систему
2. Перейти на страницу отчетов
3. Выбрать тип отчета
4. Выбрать период
5. Нажать кнопку "Сформировать отчет"
6. Проверить, что отчет сформирован корректно
7. Скачать отчет
8. Проверить, что файл отчета содержит корректные данные

### 7. Настройки приложения

#### 7.1. Изменение темы оформления

**Описание**: Проверка возможности переключения между светлой и темной темами.

**Шаги**:
1. Войти в систему
2. Найти переключатель темы
3. Переключить на темную тему
4. Проверить, что применилась темная тема
5. Переключить на светлую тему
6. Проверить, что применилась светлая тема
7. Перезагрузить страницу
8. Проверить, что выбранная тема сохранилась

#### 7.2. Настройка уведомлений

**Описание**: Проверка возможности настройки уведомлений.

**Шаги**:
1. Войти в систему
2. Перейти на страницу настроек
3. Перейти в раздел уведомлений
4. Включить/отключить различные типы уведомлений
5. Сохранить настройки
6. Перезагрузить страницу
7. Проверить, что настройки уведомлений сохранились

### 8. Мобильная версия

#### 8.1. Адаптивный дизайн

**Описание**: Проверка корректного отображения на мобильных устройствах.

**Шаги**:
1. Открыть приложение на мобильном устройстве или в симуляторе мобильного устройства
2. Проверить корректное отображение на разных размерах экрана:
   - Маленький мобильный (iPhone SE, Galaxy S8)
   - Стандартный мобильный (iPhone X, Galaxy S10)
   - Планшет (iPad, Galaxy Tab)
3. Проверить, что все элементы правильно масштабируются
4. Проверить, что все функции доступны и работают корректно

#### 8.2. Боковая панель и навигация

**Описание**: Проверка работы боковой панели и навигации на мобильных устройствах.

**Шаги**:
1. Открыть приложение на мобильном устройстве
2. Проверить, что боковая панель скрыта по умолчанию
3. Открыть боковую панель жестом свайпа или кнопкой меню
4. Проверить, что все пункты меню доступны
5. Выбрать пункт меню
6. Проверить, что произошел переход на соответствующую страницу
7. Проверить, что боковая панель закрылась

## Рекомендации по реализации

### Подготовка тестовых данных

Для эффективного E2E тестирования рекомендуется создать набор тестовых данных:

1. **Тестовые пользователи**:
   - Обычный пользователь
   - Пользователь с подпиской Pro
   - Новый пользователь без истории транзакций

2. **Набор предопределенных транзакций** с различными:
   - Типами (доход/расход)
   - Категориями
   - Суммами
   - Датами

3. **Набор категорий**:
   - Стандартные (Продукты, Транспорт, Развлечения и т.д.)
   - Пользовательские

### Подходы к тестированию

1. **Изоляция тестов**:
   - Каждый тест должен быть независимым
   - Использование чистой базы данных для каждого теста
   - Создание необходимых данных в начале теста

2. **Мокирование API**:
   - Для тестирования состояний ошибок
   - Для имитации медленных ответов сервера
   - Для тестирования без зависимости от бэкенда

3. **Тестирование критических путей**:
   - Приоритизация наиболее важных пользовательских сценариев
   - Тестирование бизнес-логики от начала до конца

4. **Визуальное тестирование**:
   - Использование снимков экрана для проверки UI
   - Проверка корректного отображения на разных устройствах

## Заключение

Перечисленные сценарии охватывают основные функциональные возможности приложения Finance Hub. Рекомендуется начать с реализации тестов для наиболее критичных функций, таких как аутентификация и управление транзакциями, и постепенно расширять тестовое покрытие.

После реализации базовых сценариев следует рассмотреть создание более сложных комбинированных тестов, которые будут проверять взаимодействие различных компонентов системы и имитировать реальные пользовательские сценарии.

Регулярное выполнение E2E тестов должно стать частью процесса непрерывной интеграции, чтобы обеспечить стабильность и качество приложения с течением времени.
