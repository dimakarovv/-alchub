# CalcHub — Сервис расчёта норм выдачи СИЗ

## О проекте

CalcHub — веб-сервис для специалистов по охране труда, позволяющий:
- Выбирать профессии из базы (5360+ профессий по Приказу №767н)
- Указывать идентифицированные опасности
- Генерировать документы **«Нормы выдачи СИЗ»** (.docx)
- Генерировать **«Личные карточки учёта выдачи СИЗ»** (.docx)
- Вести историю расчётов (для авторизованных пользователей)

---

## Структура проекта

```
calchub/
├── backend/
│   └── main.py              # FastAPI backend
├── src/
│   └── data/
│       ├── professions.json  # 5360 профессий
│       └── hazards.json      # Идентифицированные опасности (584 записи)
├── templates/
│   ├── normy-vidachi-siz.docx  # Шаблон нормативного документа
│   └── personal_anketa.docx    # Шаблон личной карточки
├── iden_haz.xlsx               # Исходные данные по опасностям
├── CalcHub.jsx                 # React frontend (один файл)
├── requirements.txt            # Python зависимости
└── README.md
```

---

## Запуск Backend

### 1. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 2. Подготовьте данные
Убедитесь что в директории `templates/` есть файлы:
- `normy-vidachi-siz.docx`
- `personal_anketa.docx`

Убедитесь что `iden_haz.xlsx` находится в корне проекта.

### 3. Запуск
```bash
cd backend
uvicorn main:app --reload --port 8000
```

API будет доступен по адресу: `http://localhost:8000`

Документация API: `http://localhost:8000/docs`

---

## Запуск Frontend

Файл `CalcHub.jsx` — это готовый React компонент.

### Вариант A: Claude.ai / Artifacts
Просто вставьте содержимое `CalcHub.jsx` в артефакт React.

### Вариант B: React приложение

```bash
npx create-react-app calchub-app
cd calchub-app
# Замените src/App.js на содержимое CalcHub.jsx
npm start
```

### Вариант C: Vite + React
```bash
npm create vite@latest calchub-app -- --template react
cd calchub-app
npm install
# Замените src/App.jsx на CalcHub.jsx
npm run dev
```

---

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `/api/professions?search=&limit=50` | Список профессий |
| `GET` | `/api/hazards` | Список опасностей |
| `POST` | `/api/documents/generate-normy` | Генерация норм выдачи СИЗ |
| `POST` | `/api/documents/generate-anketa` | Генерация личных карточек |
| `GET` | `/api/health` | Проверка работы API |

### Формат запроса на генерацию:
```json
{
  "professions": [
    {
      "profession_id": 250,
      "profession_name": "Электросварщик ручной сварки",
      "hazards": ["Электрический ток", "Повышенная запылённость воздуха рабочей зоны"]
    }
  ],
  "doc_type": "normy"
}
```

---

## База данных (для продакшена)

Согласно ТЗ, рекомендуется PostgreSQL со следующими таблицами:

### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    full_name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    auth_provider VARCHAR DEFAULT 'email',
    external_id VARCHAR
);
```

### Calculations
```sql
CREATE TABLE calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    professions_list JSONB NOT NULL,
    document_path VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    file_hash VARCHAR,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year')
);
```

### Sessions
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

---

## Технологический стек

- **Frontend**: React 18 + CSS-in-JS (без дополнительных библиотек)
- **Backend**: Python FastAPI + uvicorn
- **Документы**: python-docx
- **Данные**: openpyxl для чтения .xlsx
- **Auth**: JWT + OAuth (Google, Яндекс)
- **БД**: PostgreSQL (рекомендуется)
- **Шрифт**: Jost (Google Fonts)

---

## Правила генерации документов

### normy-vidachi-siz.docx
- Столбец **«Основание выдачи»** из `professions.xlsx` → *«[№] + Приложение № 1 к приказу Минтруда России от 29.10.2021 №767н»*
- Столбец **«Основание выдачи»** из `iden_haz.xlsx` → *«[№] + Приложение № 2 к приказу Минтруда России от 29.10.2021 №767н»*
- **Нормы выдачи**: если только цифра — добавить *«на 1 год»*
- Ячейки с одинаковыми профессиями объединяются

### personal_anketa.docx
- **«Пункт норм»** = *«[№п.п из professions.xlsx]»*
- **«Единица измерения»** = только шт/пары/комплекты/мл
- **«Количество на период»** = если только цифра → *«X на 1 год»*

---

## Дизайн

Согласно ТЗ:
- Основной цвет: `#4CAAFE`
- Шрифт: `Jost`
- Адаптивный дизайн (desktop 1024px+, tablet 768px, mobile 320px)
- Анимации переходов между страницами

---

## Безопасность

- Пароли: bcrypt (Argon2)
- Сессии: JWT + secure cookies
- HTTPS обязателен
- CORS настроен
- Параметризованные SQL-запросы
- XSS protection
- Rate limiting
- Автоудаление файлов старше 1 года
