# Task Management System

Система управления задачами с JWT аутентификацией, WebSocket уведомлениями и Swagger документацией.

## Возможности

- ✅ CRUD операции для задач
- ✅ Фильтрация задач по статусу (New, InProgress, Completed)
- ✅ Назначение задач пользователям
- ✅ WebSocket уведомления о статусе задач
- ✅ JWT аутентификация с refresh токенами
- ✅ Swagger документация API

## Запуск через Docker

### Требования

- Docker
- Docker Compose

### Быстрый старт

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd TaskManagementSystem
```

2. Запустите приложение:
```bash
docker-compose up -d
```

3. Приложение будет доступно по адресу:
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger

### Остановка

```bash
docker-compose down
```

### Пересборка образа

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Запуск локально

### Требования

- .NET 9.0 SDK
- SQLite (встроен в .NET)

### Шаги

1. Восстановите зависимости:
```bash
cd TaskManagementSystem
dotnet restore
```

2. Примените миграции:
```bash
dotnet ef database update
```

3. Запустите приложение:
```bash
dotnet run
```

4. Приложение будет доступно по адресу:
   - API: http://localhost:5079
   - Swagger UI: http://localhost:5079/swagger

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/refresh` - Обновление access токена

### Задачи

- `GET /api/tasks?status={New|InProgress|Completed}` - Получить список задач (с фильтрацией)
- `GET /api/tasks/{id}` - Получить задачу по ID
- `POST /api/tasks` - Создать новую задачу
- `PATCH /api/tasks/{id}` - Обновить задачу
- `DELETE /api/tasks/{id}` - Удалить задачу

### Уведомления

- `GET /api/notifications` - Получить уведомления пользователя
- `PATCH /api/notifications/{id}/read` - Отметить уведомление как прочитанное

### WebSocket

- `ws://localhost:8080/notificationHub` - Подключение для получения уведомлений в реальном времени

## Использование Swagger

1. Откройте Swagger UI: http://localhost:8080/swagger
2. Зарегистрируйте пользователя через `/api/auth/register`
3. Войдите через `/api/auth/login` и скопируйте `accessToken`
4. Нажмите кнопку "Authorize" в Swagger UI
5. Введите токен (без префикса "Bearer" - он добавится автоматически)
6. Теперь вы можете использовать все защищенные эндпоинты

## Переменные окружения

В `docker-compose.yml` можно настроить:

- `Jwt__Secret` - Секретный ключ для JWT (обязательно измените в продакшене!)
- `Jwt__AccessTokenExpirationMinutes` - Время жизни access токена
- `ConnectionStrings__DefaultConnection` - Строка подключения к БД

## Структура проекта

```
TaskManagementSystem/
├── Controllers/      # API контроллеры
├── Services/         # Бизнес-логика
├── Models/           # Модели данных
├── DTO/              # Data Transfer Objects
├── Data/             # DbContext и миграции
├── Hubs/             # SignalR hubs для WebSocket
└── Filters/          # Swagger фильтры
```

## Технологии

- .NET 9.0
- Entity Framework Core
- SQLite
- JWT Bearer Authentication
- SignalR (WebSocket)
- Swagger/OpenAPI

