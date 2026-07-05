
FROM node:20-alpine
 
WORKDIR /app
 
# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
 
# Instalar dependencias
RUN npm ci --only=production
 
# Copiar el resto del código del módulo de IA
COPY . .
 
EXPOSE 5001
 
CMD ["node", "src/app.js"]