# Admin Web

Panel de administración (Next.js + TypeScript + TailwindCSS). Diseño solo blanco y negro.

## Requisitos

- Node.js 18+
- Backend NestJS en ejecución (por defecto `http://localhost:3000`)

## Instalación y ejecución

```bash
cd admin-web
npm install
npm run dev
```

La app se sirve en **http://localhost:3001** (puerto 3001 para no chocar con el backend en 3000).

## Variables de entorno

Crea **admin-web/.env.local** y define:

- **`NEXT_PUBLIC_API_URL`**: URL base del backend (ej: `http://localhost:3000`)

Si no la defines, se usa `http://localhost:3000` por defecto.

## Create first admin (bootstrap)

Para crear el primer administrador cuando aún no existe ninguno:

1. En el backend, define **`ADMIN_BOOTSTRAP_SECRET`** en **backend/.env** (un valor secreto que solo tú conozcas).
2. En la pantalla de login del admin-web, abre la sección **"Create first admin"**.
3. Rellena nombre, email, contraseña (mín. 8 caracteres) y en **"Bootstrap secret"** introduce **exactamente el mismo valor** que tienes en `ADMIN_BOOTSTRAP_SECRET` del backend.
4. Envía el formulario. Si el secret coincide y no hay ningún admin, se crea el primer admin y se inicia sesión. **El secret no se guarda** en el frontend; solo se usa en esa petición.

Si el secret es incorrecto recibirás 403; si ya existe un admin, 409.

## Funcionalidad

- **Ruta /** (Dashboard): Si no hay token → redirige a `/login`. Si hay token → layout con sidebar (Dashboard, Categories, Attributes) y topbar con Logout.
- **Login** (`/login`): Si ya hay token → redirige a `/`. Si no → formulario de login (POST `/auth/login`) y sección colapsable "Create first admin" (POST `/admin/bootstrap` con header `x-admin-bootstrap-secret`).
- **Categorías** (`/categories`): CRUD contra `/admin/categories` (GET, POST, PATCH, DELETE) con confirmación antes de borrar.
- **Atributos** (`/attributes`): Selector de categoría y lista de atributos con opciones (GET `/admin/categories/:categoryId/attributes`).

Auth: token en `localStorage` con clave `mrzn_admin_token`. Axios en `lib/api.ts` añade `Authorization: Bearer <token>` y en 401 borra el token y redirige a `/login`.

## Estructura

```
admin-web/
  app/
    page.tsx              # Dashboard (protegido)
    login/page.tsx
    categories/page.tsx
    attributes/page.tsx
    layout.tsx
    globals.css
  lib/
    api.ts                # Axios + interceptors, bootstrapAdmin()
    auth.ts               # getToken/setToken/clearToken (mrzn_admin_token)
  components/
    AdminLayout.tsx       # Sidebar + topbar
    Protected.tsx         # Redirect a /login si no hay token
    CategoryForm.tsx
  .env.local
  package.json
```
