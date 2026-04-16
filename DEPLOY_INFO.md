# Инструкция по деплою платформы Garage (Production)

Эта инструкция поможет вам развернуть проект на новом сервере или перенести его на другой домен.

---

## 1. Подготовка сервера

### Системные требования:
*   **ОС**: Ubuntu 20.04+ (рекомендуется).
*   **Инструменты**: Docker и Docker Compose.
*   **Сеть**: Открытые порты 80, 443 и 8443 (для админки).

### Установка Docker (если нет):
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
```

### Открытие портов (Firewall):
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8443
```

---

## 2. Настройка домена

Перед запуском нужно заменить `guidex.pw` на ваш новый домен.

### А. В конфигурации Nginx
Откройте файл `nginx.conf` и замените во всех местах `guidex.pw` на ваш домен (например, `new-garage.ru`):
*   `server_name guidex.pw www.guidex.pw;`
*   Пути к SSL сертификатам в секции `ssl_certificate`.

### Б. В конфигурации Backend (CORS)
Откройте `backend/src/server.js` и обновите массив `allowedOrigins`:
```javascript
const allowedOrigins = [
    'https://ваш-домен.ru',
    'https://www.ваш-домен.ru',
    'https://ваш-домен.ru:8443',
    ...
];
```

---

## 3. Настройка SSL (HTTPS)

Для работы сайта требуются SSL-сертификаты. Рекомендуется использовать **Certbot**:

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d ваш-домен.ru -d www.ваш-домен.ru
```
Сертификаты сохранятся в папки:
*   `/etc/letsencrypt/live/ваш-домен.ru/fullchain.pem`
*   `/etc/letsencrypt/live/ваш-домен.ru/privkey.pem`

---

## 4. Запуск проекта

Перейдите в корневую папку проекта и выполните скрипт автоматической сборки:

```bash
chmod +x setup_docker.sh
./setup_docker.sh
```

Этот скрипт:
1.  Соберет Docker-образы для фронтенда, админки и бэкенда.
2.  Запустит базу данных PostgreSQL.
3.  Настроит Nginx.

---

## 5. Создание администратора

После первого запуска база данных будет пустой. Чтобы войти в админку, создайте первого пользователя:

```bash
# Замените ВАШ_ПАРОЛЬ на свой
docker exec -it my-garage-backend-1 node -e "const User = require('./src/models/userModel'); User.create({ phone: '999', password: 'ВАШ_ПАРОЛЬ', name: 'Admin', roleName: 'admin' }).then(u => { console.log('✅ Админ создан:', u); process.exit(0); }).catch(e => { console.error('❌ Ошибка:', e); process.exit(1); })"
```

---

## 6. Адреса доступа

*   **Клиентская часть**: `https://ваш-домен.ru`
*   **Панель управления (Admin/Supplier)**: `https://ваш-домен.ru:8443`

---

## Полезные команды для обслуживания

*   **Просмотр логов бэкенда**: `docker compose logs backend -f`
*   **Перезагрузка после изменений кода**:
    ```bash
    # Если изменили бэкенд:
    docker compose build backend && docker compose up -d backend
    # Если изменили админку:
    docker compose build admin && docker compose up -d admin
    ```
*   **Полная остановка**: `docker compose down`
