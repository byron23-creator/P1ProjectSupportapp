# Micro-Soporte L1/L2

Sistema de gestión de tickets de soporte técnico con dos niveles de atención (L1 y L2). Los agentes L1 crean y atienden los tickets iniciales; cuando un caso lo requiere, lo escalan a L2, donde queda visible únicamente para ese equipo hasta su cierre. Cada ticket puede exportarse como reporte en PDF.

## Link Video de muestra

https://drive.google.com/file/d/1IpMlrAPR6cnABYuRNrXTEd_3qgkHJVPj/view?usp=drive_link

## Arquitectura

El proyecto sigue Clean Architecture, separado en 4 proyectos independientes:

| Proyecto | Responsabilidad |
|---|---|
| `Soporte.Domain` | Entidades puras (`Ticket`, `User`, `Customer`, `Product`, `Comment`) e interfaces de repositorios/servicios. Sin dependencias externas. |
| `Soporte.Application` | Casos de uso: crear ticket, escalar, cerrar, comentar, login. Contiene las reglas de negocio. |
| `Soporte.Infrastructure` | Acceso a base de datos (PostgreSQL), autenticación (hash + JWT) y generación de reportes PDF. |
| `Soporte.API` | Controllers/rutas Express que exponen la funcionalidad al frontend. |

```
Frontend (React) → Soporte.API → Soporte.Application → Soporte.Domain
                                          ↑
                                Soporte.Infrastructure
```

## Tecnologías usadas

**Backend**
- Node.js + Express — API REST
- PostgreSQL (`pg`) — persistencia
- JWT (`jsonwebtoken`) — autenticación por token, con autorización basada en rol (L1/L2)
- PBKDF2-SHA512 (`crypto` nativo de Node) — hash de contraseñas con salt por usuario
- `pdfkit` — generación de reportes de tickets en PDF descargable
- `cors`, `dotenv`, `uuid`

**Frontend**
- React 18 + Vite
- React Router DOM — navegación entre Login, Dashboard y Detalle de Ticket
- Axios — cliente HTTP con inyección automática de JWT

**Base de datos**
- PostgreSQL con `pgcrypto` para UUIDs, tipos `ENUM`, soft-delete (`deleted_at`) y triggers de auditoría (`updated_at`)

## Modelo de datos

Tablas: `customers`, `products`, `users`, `tickets`, `comments`.

- `users.role`: `L1` | `L2`
- `tickets.status`: `Abierto` | `En Progreso` | `Cerrado`
- `tickets.current_level`: `1` (L1) o `2` (escalado a L2)

Script completo en [`database.sql`](./database.sql).

## Funcionalidades

- Login con JWT y control de acceso por rol
- CRUD de tickets (crear, listar, detalle, cerrar)
- **Escalar** ticket de L1 a L2 (valida que no esté cerrado ni ya escalado)
- **Cerrar** ticket (valida que no esté cerrado previamente)
- Filtrado por rol: L1 ve todos los tickets, L2 solo ve los escalados
- Comentarios por ticket (bloqueados si el ticket está cerrado)
- Descarga de reporte de ticket en PDF (incluye historial de comentarios)
- Selección de producto mediante catálogo (`GET /api/products`), sin exponer UUIDs al usuario

## Cómo levantar el proyecto

### 1. Base de datos

```bash
createdb micro_soporte
psql -d micro_soporte -f database.sql
```

### 2. Backend

```bash
cp .env.example .env
# completar DB_PASSWORD y JWT_SECRET en .env
npm install
npm run dev        # http://localhost:3001
```

### 3. Frontend

```bash
cd soporte-frontend
npm install
npm run dev         # http://localhost:5173
```

### Usuarios de prueba

| Email | Password | Rol |
|---|---|---|
| ana.garcia@soporte.com | password123 | L1 |
| carlos.mendoza@soporte.com | password123 | L2 |

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/users/auth/login` | Autenticación |
| GET | `/api/tickets` | Listado (filtrado por rol) |
| POST | `/api/tickets` | Crear ticket (L1) |
| PATCH | `/api/tickets/:id/escalar` | Escalar a L2 (L1) |
| PATCH | `/api/tickets/:id/cerrar` | Cerrar ticket |
| GET | `/api/tickets/:id/pdf` | Descargar reporte en PDF |
| GET | `/api/comments/ticket/:ticketId` | Comentarios de un ticket |
| POST | `/api/comments` | Agregar comentario |
| GET | `/api/products` | Catálogo de productos |
