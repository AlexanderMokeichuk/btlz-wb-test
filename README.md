# WB Tariffs Sync Service

Сервис для автоматической синхронизации тарифов Wildberries в PostgreSQL и Google Sheets.

## Технологии

- **Node.js 20** + TypeScript
- **PostgreSQL 16** для хранения данных
- **Knex.js** для миграций и работы с БД
- **Google Sheets API** для синхронизации данных
- **node-cron** для планирования задач
- **Docker Compose** для развертывания

## Функциональность

1. **Ежечасное обновление тарифов** - получение данных от Wildberries API каждый час (XX:00)
2. **Хранение в PostgreSQL** - накопление данных с обновлением за каждый день
3. **Синхронизация с Google Sheets** - автоматическая выгрузка данных в таблицы каждый час (XX:05)
4. **Сортировка по коэффициенту** - данные отсортированы по возрастанию коэффициента доставки и хранения

## Быстрый старт

### Требования

- Docker и Docker Compose
- WB API токен
- Google Service Account credentials

### Настройка

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd btlz-wb-test
```

2. **Создайте `.env` файл из примера:**
```bash
cp example.env .env
```

3. **Заполните `.env` своими данными:**
```env
NODE_ENV=production
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# WB API
WB_API_TOKEN=your_wildberries_api_token
WB_API_URL=https://common-api.wildberries.ru/api/v1/tariffs/box

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials.json
GOOGLE_SHEET_IDS=your_spreadsheet_id1,your_spreadsheet_id2
```

4. **Поместите `credentials.json` (Google Service Account) в корень проекта**

5. **Дайте доступ Service Account к вашим Google таблицам:**
    - Откройте Google таблицу
    - Нажмите "Share"
    - Добавьте email из `credentials.json` с правами "Editor"
    - Убедитесь что лист называется `stocks_coefs`

### Запуск

Запустите все сервисы одной командой:
```bash
docker compose up --build
```

Приложение автоматически:
- Запустит PostgreSQL
- Выполнит миграции БД
- Получит тарифы WB
- Синхронизирует с Google Sheets
- Настроит cron для ежечасного обновления

### Остановка
```bash
docker compose down
```

Для полной очистки (включая данные БД):
```bash
docker compose down --volumes
```

## Структура проекта
```
.
├── src/
│   ├── app.ts                          # Точка входа приложения
│   ├── config/
│   │   ├── env/env.ts                  # Конфигурация переменных окружения
│   │   └── knex/knexfile.ts            # Конфигурация Knex
│   ├── services/
│   │   ├── wb-api.service.ts           # Сервис для работы с WB API
│   │   ├── tariffs.service.ts          # Сервис для работы с тарифами
│   │   └── google-sheets.service.ts    # Сервис для Google Sheets
│   ├── jobs/
│   │   ├── update-tariffs.job.ts       # Job для обновления тарифов
│   │   └── sync-sheets.job.ts          # Job для синхронизации таблиц
│   ├── types/
│   │   └── wb-tariffs.types.ts         # TypeScript типы
│   ├── postgres/
│   │   └── migrations/                 # Миграции БД
│   └── utils/
│       └── knex.ts                     # Утилиты для работы с Knex
├── compose.yaml                         # Docker Compose конфигурация
├── Dockerfile                           # Dockerfile для приложения
├── package.json                         # Зависимости проекта
├── example.env                          # Пример конфигурации
└── README.md                            # Документация
```

## Расписание задач

- **XX:00** каждого часа - обновление тарифов WB
- **XX:05** каждого часа - синхронизация с Google Sheets

## База данных

### Таблица `wb_tariffs`

Хранит тарифы Wildberries с автоматическим обновлением данных за каждый день:

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | Первичный ключ |
| date | date | Дата тарифа (YYYY-MM-DD) |
| warehouse_name | varchar | Название склада |
| box_delivery_and_storage_expr | varchar | Срок хранения |
| box_delivery_base | numeric(10,2) | Базовая стоимость доставки |
| box_delivery_liter | numeric(10,2) | Стоимость доставки за литр |
| box_storage_base | numeric(10,2) | Базовая стоимость хранения |
| box_storage_liter | numeric(10,2) | Стоимость хранения за литр |
| created_at | timestamp | Дата создания записи |
| updated_at | timestamp | Дата последнего обновления |

**Уникальный индекс:** `(date, warehouse_name)` - обеспечивает обновление данных за день без дублирования.

## Проверка работы

### 1. Проверка логов приложения:
```bash
docker compose logs app -f
```

Вы должны увидеть:
```
Application started
Scheduler initialized
Running initial update...
[2025-11-13T03:41:55.807Z] Starting tariffs update for 2025-11-13
Tariffs updated successfully: 70 warehouses
Google Sheets sync completed
```

### 2. Проверка базы данных:
```bash
docker exec -it btlz-wb-test-postgres-1 psql -U postgres -d postgres
```

В PostgreSQL выполните:
```sql
-- Список таблиц
\dt

-- Количество записей
SELECT COUNT(*) FROM wb_tariffs;

-- Последние тарифы
SELECT date, warehouse_name, box_delivery_base, box_storage_base 
FROM wb_tariffs 
ORDER BY date DESC, box_delivery_base ASC 
LIMIT 10;

-- Выход
\q
```

### 3. Проверка Google Sheets:
Откройте вашу таблицу - лист `stocks_coefs` должен содержать актуальные данные, отсортированные по коэффициенту.

## Разработка

### Локальный запуск (без Docker)

1. **Запустите только PostgreSQL:**
```bash
docker compose up -d postgres
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Создайте `.env` файл и заполните его**

4. **Выполните миграции:**
```bash
npm run knex:dev migrate latest
```

5. **Запустите приложение в dev режиме:**
```bash
npm run dev
```

### Полезные команды

**Миграции:**
```bash
# Создать новую миграцию
npm run knex:dev migrate make migration_name

# Применить миграции
npm run knex:dev migrate latest

# Откатить последнюю миграцию
npm run knex:dev migrate rollback

# Статус миграций
npm run knex:dev migrate list
```

**Docker:**
```bash
# Пересобрать без кеша
docker compose build --no-cache

# Просмотр логов
docker compose logs -f

# Остановка с удалением volumes
docker compose down --volumes

# Запуск отдельного сервиса
docker compose up postgres
```

## Особенности реализации

- **Upsert логика**: Данные обновляются для каждой комбинации дата + склад без создания дубликатов
- **Парсинг чисел**: Автоматическая конвертация строк с запятой ("0,07") в числа (0.07)
- **Graceful shutdown**: Корректная остановка приложения по SIGINT/SIGTERM
- **Error handling**: Все ошибки логируются с timestamps
- **Environment validation**: Проверка всех переменных окружения через Zod при старте

## Troubleshooting

### Приложение не запускается

1. Проверьте что `.env` файл существует и заполнен
2. Убедитесь что `credentials.json` находится в корне проекта
3. Проверьте что PostgreSQL запустился: `docker compose logs postgres`

### Нет данных в Google Sheets

1. Убедитесь что Service Account имеет доступ к таблице (права Editor)
2. Проверьте что лист называется `stocks_coefs`
3. Посмотрите логи: `docker compose logs app | grep "Google Sheets"`

### Ошибка подключения к БД

1. Убедитесь что PostgreSQL healthy: `docker compose ps`
2. Проверьте переменные POSTGRES_* в `.env`
3. Пересоздайте volumes: `docker compose down --volumes && docker compose up`

## Автор

Alexander Mokeichuk

## Лицензия

ISC