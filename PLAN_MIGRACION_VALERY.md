# 🏗️ Plan Maestro de Migración: Valery Corporativo (Legacy to Web)

**Documento de Estrategia y Arquitectura**
**Estado**: Borrador Inicial
**Fecha**: 2025-11-29

---

## 1. 🛠️ Definición del Stack Tecnológico

Basado en el requerimiento de "agilidad de escritorio" y "capacidad de nube", confirmamos el stack actual como la elección óptima:

### Frontend: **React + Ant Design**
-   **Por qué**: Ant Design es el estándar de oro para aplicaciones empresariales (ERP). Sus componentes de tablas (`Table`), formularios (`Form`) y árboles (`Tree`) son superiores para manejar la densidad de datos de Valery.
-   **Agilidad**: React con Vite garantiza tiempos de carga instantáneos.
-   **Estado**: React Query manejará el caché de datos, vital para que la app se sienta "local" aunque los datos vengan de la nube.

### Backend: **NestJS + TypeScript**
-   **Por qué**: Arquitectura modular que escala perfectamente. Su inyección de dependencias facilita el testing y la separación de lógica de negocio.
-   **Nube**: NestJS es "Cloud Native" por defecto. Fácil de dockerizar y desplegar en AWS/Azure/GCP.

### Base de Datos: **PostgreSQL**
-   **Fase Local**: Corre en Docker/WSL sin problemas.
-   **Fase Nube**: Migración directa a Amazon RDS o Google Cloud SQL sin cambiar una línea de código.
-   **Integridad**: ACID compliance para garantizar que no se pierdan datos contables.

---

## 2. 🏛️ Arquitectura del Proyecto

### Estructura Modular (Monorepo)
Para evitar un "monolito inmanejable", usaremos una arquitectura basada en **Features** (Características) dentro del Monorepo.

```
ValeryPort/
├── apps/
│   ├── frontend/
│   │   └── src/
│   │       ├── features/           # Módulos de Negocio Aislados
│   │       │   ├── auth/           # Login, Roles
│   │       │   ├── sales/          # Ventas, Facturación
│   │       │   ├── inventory/      # Productos, Kardex
│   │       │   └── accounting/     # Asientos, Cuentas
│   │       ├── components/         # UI Kit Compartido (Botones, Inputs)
│   │       └── layout/             # App Shell (Sidebar, Header)
│   └── backend/
│       └── src/
│           ├── sales/              # Módulo NestJS Ventas
│           ├── inventory/          # Módulo NestJS Inventario
│           └── ...
└── packages/
    └── types/                      # Interfaces compartidas (DTOs)
```

### Estrategia UX: El "Ribbon" en la Web
El "Ribbon" de Windows es excelente para descubrir funciones, pero ocupa mucho espacio vertical en la web.

**Propuesta de Diseño Moderno:**
1.  **Navegación Principal (Sidebar Colapsable)**:
    -   Reemplaza las pestañas superiores (Inventario, Ventas, etc.).
    -   Iconos claros para cada módulo.
    -   Permite más espacio horizontal para las tablas de datos.
2.  **Barra de Acciones Contextual (Top Bar)**:
    -   Reemplaza los botones del Ribbon.
    -   Cambia dinámicamente según la pantalla. Ejemplo: Si estoy en "Facturas", muestra "Nueva Factura", "Imprimir", "Anular".
3.  **Tabs de Navegación (Multi-tasking)**:
    -   Para replicar la agilidad de escritorio, implementaremos un sistema de pestañas *dentro* de la app (como VS Code) para tener abiertas "Factura #1" y "Cliente #50" al mismo tiempo.

---

## 3. 🗺️ Plan de Desarrollo (Roadmap Inicial)

Dado que ya tenemos el entorno configurado (Paso 0 completado), ajustamos el plan:

### ✅ Paso 1: Configuración y "Hola Mundo" (COMPLETADO)
-   Monorepo configurado.
-   Conexión Frontend-Backend-BD verificada.

### 🚧 Paso 2: El "App Shell" (Layout Principal)
-   **Objetivo**: Crear el esqueleto visual de la aplicación.
-   **Entregable**:
    -   Sidebar de navegación (con los módulos de las capturas).
    -   Header con perfil de usuario.
    -   Área de contenido principal.
    -   Sistema de rutas (`/ventas`, `/inventario`).

### ⏳ Paso 3: Módulo de Autenticación (Seguridad)
-   **Objetivo**: Proteger el acceso.
-   **Entregable**: Login funcional con JWT (lo que intentamos en Fase 2, pero ahora integrado en el App Shell).

### ⏳ Paso 4: Primer Módulo Funcional - "Maestro de Clientes"
-   **Objetivo**: Probar el CRUD completo.
-   **Entregable**:
    -   Tabla de clientes con búsqueda y filtros.
    -   Formulario de creación/edición de clientes.
    -   Conexión real a base de datos.

---

## 4. 📝 Instrucciones de Código (Convenciones)

1.  **Strict Typing**: No `any`. Definir interfaces para todo en `packages/types`.
2.  **Documentación**:
    -   Backend: Swagger (`@ApiProperty`) obligatorio en DTOs.
    -   Frontend: JSDoc en componentes complejos explicando `props`.
3.  **Manejo de Errores**:
    -   Backend: `HttpException` filters globales.
    -   Frontend: `ErrorBoundary` y notificaciones `Ant Design` (`message.error`) para feedback al usuario.
4.  **Patrón de Diseño**:
    -   Backend: Service-Repository pattern.
    -   Frontend: Container-Presentational pattern (Lógica en Hooks, UI en Componentes).

---
