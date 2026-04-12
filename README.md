# Проектная работа: Mesto

Интерактивная страница с фотографиями, лайками и профилем пользователя. Сборка — Vite.

## Ссылка на опубликованный проект

**GitHub Pages:** https://alinkared.github.io/mesto-p/

Если ссылка не открывается, проверь точный URL в **Settings → Pages** репозитория [mesto-p](https://github.com/AlinkaRed/mesto-p).

---

## Локальный запуск

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
```

Результат в папке `dist/`.

---

## Публикация на GitHub Pages (приватный репозиторий + публичный для сайта)

Кратко по инструкции курса: код в **приватном** репозитории, сайт публикуется из **отдельного публичного** репозитория через GitHub Actions.

### 1. Публичный репозиторий на GitHub

1. Войдите на [GitHub](https://github.com).
2. **New repository** → имя, например `mesto-p` → **Public** → **Create repository** (можно без README).

### 2. Токен для деплоя (PAT)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token**: включите область **`repo`** (полный доступ к репозиториям).
3. Скопируйте токен (показывается один раз).

### 3. Секреты в приватном репозитории (где лежит этот код)

1. Откройте **приватный** репозиторий с проектом.
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. Добавьте:
   - **`PUBLIC_REPO_TOKEN`** — вставьте PAT из шага 2.
   - **`PUBLIC_REPO_NAME`** — строка вида **`AlinkaRed/mesto-p`** (без `https://`, без пробелов).

### 4. Включить GitHub Pages на публичном репозитории

1. Откройте **публичный** репозиторий → **Settings** → **Pages**.
2. **Build and deployment** → Source: **Deploy from a branch**.
3. Branch: **`gh-pages`** → папка **`/ (root)`** → Save.  
   (Ветка `gh-pages` появится после первого успешного запуска workflow.)

### 5. Запушить код и дождаться деплоя

В приватном репозитории (локально):

```bash
git add .
git commit -m "feat: настройка деплоя на GitHub Pages"
git push origin main
```

(Если основная ветка называется `master`, workflow уже учитывает её в `.github/workflows/deploy.yml`.)

Откройте **Actions** в приватном репозитории: должен выполниться workflow **Deploy to GitHub Pages**. После зелёной галочки сайт будет доступен по адресу вида:

`https://alinkared.github.io/mesto-p/`

### Если workflow падает с ошибкой доступа

- Проверьте, что PAT не истёк и в нём есть право **`repo`**.
- Проверьте **`PUBLIC_REPO_NAME`**: точно `логин/репозиторий`, как на GitHub.
- Убедитесь, что публичный репозиторий существует и имя совпадает.
