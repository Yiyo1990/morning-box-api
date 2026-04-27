# Usamos una imagen de Node.js estable
FROM node:20-alpine

# Instalamos dependencias necesarias para Prisma y herramientas de red
RUN apk add --no-cache openssl

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Generamos el cliente de Prisma
RUN npx prisma generate

# Exponemos el puerto de Next.js
EXPOSE 3000
