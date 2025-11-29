# 🚀 Guía de Desarrollo - ValeryPort

Este documento contiene las instrucciones necesarias para ejecutar y mantener el entorno de desarrollo local.

## 📋 Prerrequisitos

- **WSL (Windows Subsystem for Linux)**
- **Node.js** (v24.11.1 LTS recomendado, instalado vía `nvm`)
- **npm** (v11.x)

## 🛠️ Iniciar el Proyecto

Necesitas dos terminales abiertas (una para el backend y otra para el frontend).

### 1️⃣ Backend (NestJS)

```bash
# Cargar nvm (si es una terminal nueva)
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd backend
npm run start:dev
```
Runs on: http://localhost:3000

### 2️⃣ Frontend (React + Vite)

```bash
# Cargar nvm (si es una terminal nueva)
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd frontend
npm run dev
```
Runs on: http://localhost:5173

## 🗄️ Base de Datos (Prisma + SQLite)

El proyecto está configurado para usar SQLite localmente (`backend/dev.db`).

### Comandos Útiles de Prisma:

```bash
cd backend

# Ver/Editar base de datos visualmente
npx prisma studio

# Crear una nueva migración (después de cambiar schema.prisma)
npx prisma migrate dev

# Generar el cliente (si cambia el schema)
npx prisma generate
```

## 🔧 Solución de Problemas Comunes

### Error: "Command not found: node/npm"
Asegúrate de cargar nvm en tu sesión:
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Error de TailwindCSS
Si ves errores de PostCSS/Tailwind, asegúrate de que estás usando `@tailwindcss/postcss` (ya configurado en este entorno).

## 📦 Estructura del Proyecto

- **/backend**: API NestJS
- **/frontend**: UI React + Vite
- **/backend/prisma**: Schema de base de datos y migraciones
