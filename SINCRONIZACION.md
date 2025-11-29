# 🔄 Documento de Sincronización - Proyecto Valery Corporativo

**Fecha**: 2025-11-29  
**Para**: IA Desarrollador (Otra Ubicación)  
**De**: IA Claude (WSL Ubuntu)  
**Asunto**: CAMBIO CRÍTICO - Retorno al Plan de Arquitectura Original

---

## 🚨 DECISIÓN IMPORTANTE

El usuario ha decidido **VOLVER AL PLAN ORIGINAL** del proyecto. Los cambios que implementaste (Tailwind CSS, estructura simple) fueron un buen inicio, pero debemos migrar a la arquitectura planificada originalmente.

---

## 📋 Resumen del Plan Original

### Stack Tecnológico Definitivo

| Componente | Tecnología | Razón |
|------------|-----------|-------|
| **Frontend Framework** | React + TypeScript | ✅ |
| **UI Library** | **Ant Design** (NO Tailwind) | Componentes empresariales para ERP |
| **State Management** | TanStack Query (React Query) | Manejo de estado servidor |
| **Routing** | React Router v6 | Navegación SPA |
| **Build Tool** | Vite | ✅ Ya implementado |
| **Backend Framework** | NestJS + TypeScript | ✅ Ya implementado |
| **ORM** | Prisma | ✅ Ya implementado |
| **Base de Datos** | **PostgreSQL** (NO SQLite) | ACID, multi-usuario, producción |
| **API Documentation** | Swagger/OpenAPI | Auto-documentación |
| **Validation** | class-validator + class-transformer | Validación DTO |

### Estructura de Proyecto (Monorepo)

```
ValeryPort/
├── apps/
│   ├── frontend/          # React + Ant Design
│   └── backend/           # NestJS + Prisma
├── packages/
│   └── types/             # Tipos compartidos entre frontend/backend
├── docs/                  # Documentación del proyecto
├── docker-compose.yml
├── README.md
├── .gitignore
├── .prettierrc
└── PLAN_MIGRACION_VALERY.md
```

---

## 🔄 Cambios Requeridos

### 1. Reestructuración de Directorios

**ANTES (tu implementación)**:
```
ValeryPort/
├── frontend/
├── backend/
└── docker-compose.yml
```

**DESPUÉS (plan original)**:
```
ValeryPort/
├── apps/
│   ├── frontend/
│   └── backend/
├── packages/
│   └── types/
└── docs/
```

### 2. Frontend - Cambios Críticos

#### ❌ ELIMINAR:
- `tailwindcss`
- `@tailwindcss/postcss`
- `postcss.config.js`
- `tailwind.config.js`
- Todos los estilos con clases de Tailwind

#### ✅ AGREGAR:
```bash
cd apps/frontend
npm install antd @ant-design/icons
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
```

#### Configuración de Ant Design

```tsx
// apps/frontend/src/main.tsx
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';

<ConfigProvider locale={esES}>
  <App />
</ConfigProvider>
```

### 3. Backend - Configuración PostgreSQL

#### ⚠️ CRÍTICO - Actualizar Prisma

**Archivo**: `apps/backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"  // ⚠️ Cambiar de "sqlite" a "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Modelo inicial User
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Variables de Entorno

**Archivo**: `apps/backend/.env`

```env
# Base de Datos
DATABASE_URL="postgresql://valery:valery_dev_password@localhost:5432/valery_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# App
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Docker Compose Actualizado

**Archivo**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: valery-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: valery
      POSTGRES_PASSWORD: valery_dev_password
      POSTGRES_DB: valery_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - valery-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U valery"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: valery-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@valery.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    networks:
      - valery-network
    depends_on:
      - postgres

volumes:
  postgres_data:
    driver: local

networks:
  valery-network:
    driver: bridge
```

#### Actualizar main.ts del Backend

```typescript
// apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Valery Corporativo API')
    .setDescription('API para el sistema ERP Valery Corporativo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Prefijo global
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 API Docs: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
```

---

## 📦 Paquetes a Instalar

### Frontend (`apps/frontend/`)

```bash
# UI Framework
npm install antd @ant-design/icons

# Routing
npm install react-router-dom
npm install --save-dev @types/react-router-dom

# State Management
npm install @tanstack/react-query

# HTTP Client
npm install axios

# DESINSTALAR Tailwind
npm uninstall tailwindcss @tailwindcss/postcss autoprefixer postcss
```

### Backend (`apps/backend/`)

```bash
# Swagger
npm install @nestjs/swagger swagger-ui-express

# Validation
npm install class-validator class-transformer

# Config
npm install @nestjs/config

# JWT (para autenticación futura)
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt

# Prisma Client
npm install @prisma/client
npm install --save-dev prisma
```

---

## 🎯 Arquitectura del Sistema

### Módulos del ERP (Planificados)

El sistema Valery Corporativo se dividirá en estos módulos:

1. **Autenticación** (`auth/`)
   - Login/Logout
   - JWT tokens
   - Roles y permisos

2. **Ventas** (`sales/`)
   - Facturas
   - Cotizaciones
   - Clientes

3. **Compras** (`purchases/`)
   - Órdenes de compra
   - Proveedores
   - Recepciones

4. **Inventario** (`inventory/`)
   - Productos
   - Categorías
   - Stock
   - Movimientos

5. **Contabilidad** (`accounting/`)
   - Asientos contables
   - Cuentas
   - Reportes financieros

6. **Recursos Humanos** (`hr/`)
   - Empleados
   - Nómina
   - Asistencia

### Convenciones de Código

#### TypeScript Strict Mode
- `strict: true` habilitado
- No usar `any` (usar `unknown` si es necesario)
- JSDoc/TSDoc obligatorio en funciones públicas

#### Estructura de Módulos (NestJS)

```
apps/backend/src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   └── guards/
│       └── jwt-auth.guard.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
└── common/
    ├── decorators/
    ├── filters/
    └── pipes/
```

#### Estructura de Frontend (React)

```
apps/frontend/src/
├── components/
│   ├── common/        # Botones, Inputs, etc.
│   └── layout/        # Header, Sidebar, Footer
├── pages/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Sales/
│   └── Inventory/
├── hooks/             # Custom hooks
├── services/          # API calls (axios)
├── stores/            # React Query config
├── routes/            # React Router config
└── types/             # Interfaces TypeScript
```

---

## 🔐 Convención de Commits

**IMPORTANTE**: Usar Conventional Commits

```
feat(frontend): add login page with Ant Design
fix(backend): resolve CORS issue
chore(deps): update Prisma to 7.0.1
refactor(backend): reorganize auth module
docs: update API documentation
```

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización
- `docs`: Documentación
- `test`: Tests
- `chore`: Mantenimiento/configs

**Scopes**:
- `frontend`, `backend`, `db`, `docker`, `deps`, `config`

---

## 🚀 Pasos Inmediatos para Ti

### 1. Antes de hacer cualquier cambio

```bash
# Asegúrate de estar sincronizado
git fetch origin
git pull --rebase origin master

# Crea una rama para los cambios
git checkout -b migration/back-to-original-plan
```

### 2. NO hagas estos cambios aún

❌ **ESPERA** - La otra IA (yo) está trabajando en la migración  
❌ **NO modifiques** archivos de configuración principal  
❌ **NO hagas push** hasta que yo lo indique

### 3. Revisa el archivo STATUS.md

Siempre revisa `/home/inversur/proyectos/ValeryPort/STATUS.md` (si existe) antes de trabajar para ver qué estoy haciendo.

---

## 📞 Comunicación entre IAs

### Protocolo de Sincronización

1. **Antes de empezar**: 
   - `git fetch && git status`
   - Leer `STATUS.md`

2. **Durante el trabajo**:
   - Actualizar `STATUS.md` con tu progreso

3. **Antes de push**:
   - Verificar que no hay conflictos
   - Actualizar `STATUS.md` con lo completado

### Archivo STATUS.md

Úsalo para comunicarnos. Ejemplo:

```markdown
## Trabajo en Progreso

### IA-Claude (WSL)
- [x] Análisis de cambios requeridos
- [ ] Migración a estructura monorepo
- [ ] Configuración de PostgreSQL
- ETA: 2 horas

### IA-Desktop
- [ ] Estado: ESPERANDO
- [ ] Próxima tarea: TBD después de migración
```

---

## 🎯 Roadmap de Migración (10 Fases)

Según `PLAN_MIGRACION_VALERY.md`:

1. **Fase 0**: Preparación del Entorno ✅ (casi completa)
2. **Fase 1**: Hello World con BD (en proceso de migración)
3. **Fase 2**: Autenticación JWT
4. **Fase 3**: Módulo de Usuarios (CRUD)
5. **Fase 4**: Módulo de Inventario
6. **Fase 5**: Módulo de Ventas
7. **Fase 6**: Módulo de Compras
8. **Fase 7**: Módulo de Contabilidad
9. **Fase 8**: Reportes
10. **Fase 9**: Testing
11. **Fase 10**: Despliegue

---

## ⚠️ Errores Comunes a Evitar

1. **NO usar SQLite** - Solo PostgreSQL
2. **NO commitear `node_modules/`** - Siempre en `.gitignore`
3. **NO commitear `.env`** - Solo `.env.example`
4. **NO hacer `git push --force`** sin coordinación
5. **NO trabajar en archivos que la otra IA está modificando**

---

## 📚 Referencias Importantes

- [Ant Design Docs](https://ant.design/docs/react/introduce)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

## 💡 Ejemplo de Integración Completa

### Frontend: Login Page con Ant Design

```tsx
// apps/frontend/src/pages/Auth/Login.tsx
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export const LoginPage = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    // TODO: Llamar API de login
    console.log('Login:', values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Valery Corporativo" style={{ width: 400 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Email inválido' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Contraseña requerida' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
```

### Backend: Auth Endpoint

```typescript
// apps/backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOperation({ summary: 'Login de usuario' })
  async login(@Body() loginDto: LoginDto) {
    // TODO: Implementar lógica de autenticación
    return { access_token: 'jwt-token-here' };
  }
}
```

---

## 🔄 Estado Actual del Proyecto

**Último commit**: `648b78e` - "chore: configuración de entorno, fix TailwindCSS y documentación"

**Tu trabajo completado**:
- ✅ Backend NestJS funcionando
- ✅ Frontend React + Vite funcionando
- ✅ Tailwind CSS configurado
- ✅ Documento DEVELOPMENT.md

**Próximo paso**:
- ⏳ **ESPERANDO** - La otra IA está migrando a plan original
- ⏳ Una vez complete, recibirás instrucciones

---

## 📧 Contacto

Si tienes dudas, actualiza el archivo `STATUS.md` con tus preguntas en la sección:

```markdown
## Solicitudes de Coordinación

### Solicitud #X - [TU-IA] - [FECHA]
**Tipo**: Pregunta/Bloqueo/Cambio
**Descripción**: ...
**Estado**: ⏳ Esperando respuesta
```

---

**Última Actualización**: 2025-11-29 09:24:00  
**Creado por**: IA-Claude (WSL)  
**Para**: IA-Desktop  
**Versión**: 1.0
