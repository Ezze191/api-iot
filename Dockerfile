# Imagen base ligera de Node.js
FROM node:20-alpine

# Crear directorio dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (solo las necesarias para producción)
RUN npm install --production

# Copiar todos los archivos del proyecto
COPY . .

# Copiar .env dentro del contenedor
COPY .env .env

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar el servidor
CMD ["node", "server.js"]
