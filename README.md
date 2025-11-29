# Valery Corporativo - Web Edition

Sistema ERP completo migrado desde aplicación de escritorio Windows a plataforma web moderna.

## 🚀 Stack Tecnológico

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Ant Design 5
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios

### Backend
- **Framework**: NestJS 11 + TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 16
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database Admin**: pgAdmin 4

## 📁 Estructura del Proyecto (Monorepo)

```
ValeryPort/
├── apps/
│   ├── frontend/          # Aplicación React + Vite
│   └── backend/           # API NestJS
├── packages/
│   └── types/             # Tipos TypeScript compartidos
├── docs/                  # Documentación del proyecto
├── docker-compose.yml     # Servicios Docker
└── README.md
```

## 🛠️ Instalación

### Prerrequisitos

- Node.js v20+ (recomendado v24 LTS via nvm)
- npm v11+
- Docker Desktop (para PostgreSQL)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd ValeryPort
```

### 2. Instalar dependencias

#### Frontend
```bash
cd apps/frontend
npm install
```

#### Backend
```bash
cd apps/backend
npm install
```

### 3. Configurar variables de entorno

```bash
cd apps/backend
cp .env.example .env
# Editar .env con tus credenciales si es necesario
```

### 4. Iniciar PostgreSQL

```bash
# En la raíz del proyecto
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en `localhost:5432`
- pgAdmin en `http://localhost:5050`

### 5. Ejecutar migraciones de Prisma

```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Iniciar servidores de desarrollo

#### Terminal 1 - Backend
```bash
cd apps/backend
npm run start:dev
```

El backend estará disponible en:
- API: `http://localhost:3000/api`
- Swagger Docs: `http://localhost:3000/api/docs`

#### Terminal 2 - Frontend
```bash
cd apps/frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🗄️ Base de Datos

### Prisma Studio (GUI de BD)

```bash
cd apps/backend
npx prisma studio
```

Abre en: `http://localhost:5555`

### pgAdmin

1. Acceder a: `http://localhost:5050`
2. Login: `admin@valery.local` / `admin`
3. Agregar servidor:
   - **Host**: `postgres` (nombre del container)
   - **Port**: `5432`
   - **Database**: `valery_db`
   - **Username**: `valery`
   - **Password**: `valery_dev_password`

## 📚 Comandos Útiles

### Frontend

```bash
cd apps/frontend

npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Linting
npm run preview  # Preview de build
```

### Backend

```bash
cd apps/backend

npm run start:dev    # Desarrollo con hot-reload
npm run start:prod   # Producción
npm run build        # Compilar TypeScript
npm run test         # Tests unitarios
npm run test:e2e     # Tests E2E
```

### Prisma

```bash
cd apps/backend

npx prisma generate        # Generar cliente
npx prisma migrate dev     # Crear migración
npx prisma migrate deploy  # Aplicar migraciones (producción)
npx prisma studio          # GUI de base de datos
npx prisma format          # Formatear schema.prisma
```

### Docker

```bash
docker-compose up -d        # Iniciar servicios
docker-compose down         # Detener servicios
docker-compose logs -f      # Ver logs
docker-compose ps           # Ver estado de containers
```

## 🔐 Autenticación

La autenticación JWT se implementará en las siguientes fases del proyecto.

## 📖 Documentación API

Una vez el backend esté corriendo, accede a:

**Swagger UI**: `http://localhost:3000/api/docs`

Aquí encontrarás toda la documentación interactiva de la API.

## 🧪 Testing

```bash
# Frontend (TBD)
cd apps/frontend
npm run test

# Backend
cd apps/backend
npm run test
npm run test:e2e
npm run test:cov
```

## 🏗️ Módulos del Sistema

El ERP se divide en los siguientes módulos principales:

1. **Autenticación** - Login, JWT, Roles
2. **Usuarios** - Gestión de usuarios y permisos
3. **Ventas** - Facturas, cotizaciones, clientes
4. **Compras** - Órdenes de compra, proveedores
5. **Inventario** - Productos, categorías, stock
6. **Contabilidad** - Asientos contables, reportes
7. **Recursos Humanos** - Empleados, nómina

## 🚦 Estado del Proyecto

**Fase Actual**: Fase 1 - Hello World con BD ✅

- [x] Fase 0: Configuración del entorno
- [x] Fase 1: Hello World con BD
- [ ] Fase 2: Autenticación JWT
- [ ] Fase 3: Módulo de Usuarios
- [ ] Fase 4: Módulo de Inventario
- [ ] Fase 5: Módulo de Ventas
- [ ] Fase 6: Módulo de Compras
- [ ] Fase 7: Módulo de Contabilidad
- [ ] Fase 8: Reportes
- [ ] Fase 9: Testing
- [ ] Fase 10: Despliegue

## 🤝 Contribución

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(frontend): add login page
fix(backend): resolve CORS issue
docs: update README
chore(deps): upgrade Prisma to 7.1.0
```

### Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización
- `docs`: Documentación
- `test`: Tests
- `chore`: Mantenimiento

### Scopes:
- `frontend`, `backend`, `db`, `docker`, `deps`, `config`

## 📝 Licencia

Ver archivo [LICENSE](LICENSE)

## 🔗 Enlaces Útiles

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Ant Design](https://ant.design/)
- [Documentación de React Query](https://tanstack.com/query/latest)

---

**Desarrollado con** ❤️ **para Valery Corporativo**
