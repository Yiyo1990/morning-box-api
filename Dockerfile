# 1. Usamos una imagen de Node.js estable
FROM node:20-alpine

# 2. Instalamos dependencias necesarias para Prisma y herramientas de red
RUN apk add --no-cache openssl

WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# 4. Instalamos dependencias
RUN npm install

# 5.  Copiamos el resto del código
COPY . .

# 6. Generamos el cliente de Prisma
RUN npx prisma generate

# 7. COMPILAMOS el proyecto (Esto genera la carpeta /dist)
RUN npm run build

# 8. Exponemos el puerto de Next.js
EXPOSE 3000

# 9. Comando de inicio: Migraciones + Ejecutar el JS compilado
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]