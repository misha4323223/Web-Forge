# Деплой на Яндекс.Облако

## Вариант 1: Яндекс Cloud Run (Serverless Containers) - Рекомендуется

Самый простой способ с автоматическим масштабированием и оплатой за использование.

### Первоначальная настройка (один раз):

1. **Создайте аккаунт** на [console.cloud.yandex.ru](https://console.cloud.yandex.ru)

2. **Установите Yandex Cloud CLI:**
   ```bash
   curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
   yc init
   ```

3. **Создайте реестр контейнеров:**
   ```bash
   yc container registry create --name webstudio-registry
   ```

4. **Авторизуйтесь в реестре:**
   ```bash
   yc container registry configure-docker
   ```

### Деплой (каждое обновление):

```bash
# 1. Соберите Docker образ
docker build -t cr.yandex/<REGISTRY_ID>/webstudio:latest .

# 2. Отправьте образ в реестр
docker push cr.yandex/<REGISTRY_ID>/webstudio:latest

# 3. Запустите контейнер (первый раз - создаст сервис)
yc serverless container create --name webstudio --memory 256m --cores 1
yc serverless container revision deploy \
  --container-name webstudio \
  --image cr.yandex/<REGISTRY_ID>/webstudio:latest \
  --service-account-id <SA_ID> \
  --execution-timeout 30s
```

---

## Вариант 2: Яндекс Compute Cloud (VPS)

Для полного контроля над сервером.

### Первоначальная настройка:

1. Создайте виртуальную машину Ubuntu 22.04 в [консоли](https://console.cloud.yandex.ru/compute)
2. Подключитесь по SSH и установите Docker:
   ```bash
   ssh yc-user@<IP_АДРЕС>
   sudo apt update && sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

### Деплой:

```bash
# На вашем компьютере - соберите и отправьте образ
docker build -t webstudio .
docker save webstudio | ssh yc-user@<IP> docker load

# На сервере - запустите контейнер
ssh yc-user@<IP>
docker run -d --restart unless-stopped -p 80:5000 --name webstudio webstudio
```

---

## Автоматизация обновлений (CI/CD)

### GitHub Actions (рекомендуется):

Создайте файл `.github/workflows/deploy.yml` в вашем репозитории:

```yaml
name: Deploy to Yandex Cloud

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Yandex Container Registry
        run: echo "${{ secrets.YC_SA_KEY }}" | docker login cr.yandex -u json_key --password-stdin
      
      - name: Build and push
        run: |
          docker build -t cr.yandex/${{ secrets.YC_REGISTRY_ID }}/webstudio:${{ github.sha }} .
          docker push cr.yandex/${{ secrets.YC_REGISTRY_ID }}/webstudio:${{ github.sha }}
      
      - name: Deploy
        run: |
          curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
          echo "${{ secrets.YC_SA_KEY }}" > key.json
          yc config set service-account-key key.json
          yc serverless container revision deploy \
            --container-name webstudio \
            --image cr.yandex/${{ secrets.YC_REGISTRY_ID }}/webstudio:${{ github.sha }}
```

### Необходимые секреты в GitHub:
- `YC_SA_KEY` - JSON ключ сервисного аккаунта
- `YC_REGISTRY_ID` - ID реестра контейнеров

---

## Быстрый скрипт для обновлений

Создайте файл `deploy.sh`:

```bash
#!/bin/bash
set -e

REGISTRY_ID="ваш_registry_id"
IMAGE="cr.yandex/$REGISTRY_ID/webstudio"
TAG=$(date +%Y%m%d-%H%M%S)

echo "Building..."
docker build -t $IMAGE:$TAG .

echo "Pushing..."
docker push $IMAGE:$TAG

echo "Deploying..."
yc serverless container revision deploy \
  --container-name webstudio \
  --image $IMAGE:$TAG

echo "Done! Deployed version: $TAG"
```

Использование:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Привязка домена

1. В DNS вашего домена добавьте A-запись на IP сервера
2. Для HTTPS используйте бесплатный сертификат Let's Encrypt:
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.ru
   ```

---

## Полезные команды

```bash
# Проверить статус контейнера
yc serverless container list

# Посмотреть логи
yc serverless container logs webstudio

# Откатить на предыдущую версию
yc serverless container revision list --container-name webstudio
yc serverless container revision deploy --container-name webstudio --revision-id <ID>
```
