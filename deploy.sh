#!/bin/bash

# ===========================================
# Скрипт деплоя на Яндекс Cloud Run
# ===========================================

# Замени на свой REGISTRY_ID (из команды: yc container registry list)
REGISTRY_ID="crpxxxxxxxxxx"

# Имя контейнера
CONTAINER_NAME="webstudio"

# Автоматический тег с датой и временем
TAG=$(date +%Y%m%d-%H%M%S)

IMAGE="cr.yandex/$REGISTRY_ID/$CONTAINER_NAME"

echo ""
echo "======================================"
echo "  Деплой $CONTAINER_NAME"
echo "  Версия: $TAG"
echo "======================================"
echo ""

echo "[1/3] Сборка Docker образа..."
docker build -t $IMAGE:$TAG .

if [ $? -ne 0 ]; then
    echo "ОШИБКА: Не удалось собрать образ"
    exit 1
fi

echo ""
echo "[2/3] Отправка образа в Яндекс Cloud..."
docker push $IMAGE:$TAG

if [ $? -ne 0 ]; then
    echo "ОШИБКА: Не удалось отправить образ"
    exit 1
fi

echo ""
echo "[3/3] Деплой контейнера..."
yc serverless container revision deploy \
    --container-name $CONTAINER_NAME \
    --image $IMAGE:$TAG \
    --memory 256m \
    --execution-timeout 30s \
    --min-instances 0 \
    --concurrency 4

if [ $? -ne 0 ]; then
    echo "ОШИБКА: Не удалось задеплоить контейнер"
    exit 1
fi

echo ""
echo "======================================"
echo "  ГОТОВО!"
echo "  Версия $TAG успешно задеплоена"
echo "======================================"
echo ""

yc serverless container get $CONTAINER_NAME | grep url
