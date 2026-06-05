# RecipeHub

Aplicación web full-stack para publicar, descubrir y gestionar recetas de cocina. Permite a los usuarios registrarse, crear recetas con ingredientes y pasos detallados, dejar comentarios y calificaciones.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 + React Router v7 |
| Backend | Node.js + Express |
| Base de datos | MongoDB con Mongoose |
| Autenticación | JWT (jsonwebtoken + bcryptjs) |
| Infraestructura | VPS Ubuntu 24.04 + Docker Compose + Nginx + Let's Encrypt |
| CI/CD | GitHub Actions |

## URLs de producción

- Frontend: https://app.recipehubgrupo1.xyz
- API: https://api.recipehubgrupo1.xyz
- Health check: https://api.recipehubgrupo1.xyz/api/health

---

## Requisitos previos

- Docker Engine y Docker Compose v2
- Nginx
- Node.js 20+
- Un VPS con Ubuntu 24.04 y acceso SSH
- Dominio con dos subdominios apuntando al VPS (`app.*` y `api.*`)

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/recipehub` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `mi_clave_secreta` |
| `PORT` | Puerto donde escucha el servidor Express | `4000` |

### Docker Compose (`.env` en la raíz)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_USER` | Usuario root de MongoDB | `admin` |
| `MONGO_PASS` | Contraseña root de MongoDB | `password_seguro` |
| `MONGO_URI` | URI completa usada por el contenedor API | `mongodb://admin:pass@mongo:27017/recipehub` |
| `JWT_SECRET` | Misma clave JWT usada por el backend | `mi_clave_secreta` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API consumida por React | `https://api.recipehubgrupo1.xyz` |

> **Importante:** Ningún archivo `.env` se sube al repositorio. Están en `.gitignore`.

---

## Flujo de trabajo para cambios en el frontend

El frontend se sirve como archivos estáticos compilados desde `frontend/dist/`. Nginx apunta directamente a esa carpeta. Por eso, **cada vez que se hagan cambios en el frontend, es obligatorio regenerar el build antes de hacer commit**, de lo contrario los cambios no se verán en producción.

El flujo correcto para cualquier cambio en el frontend es:

```bash
cd frontend
npm ci
npm run build
cd ..
git add frontend/dist
git add frontend/src  # o los archivos fuente que cambiaste
git commit -m "descripción del cambio"
git push origin tu-rama
```

> **Si hacés commit sin correr `npm run build` primero, el `dist/` en el repo quedará desactualizado y los cambios no se verán en producción aunque el pipeline pase en verde.**

---

## Despliegue en VPS paso a paso

### 1. Conectarse al VPS

```bash
ssh usuario@IP_DEL_VPS
```

### 2. Instalar dependencias del sistema

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt install nginx certbot python3-certbot-nginx git -y
```

### 3. Clonar el repositorio

```bash
git clone https://github.com/IsaacAlvaradoMata/recipehub-grupo1.git
cd recipehub-grupo1
```

### 4. Crear el archivo `.env` en la raíz

```bash
nano .env
```

Contenido:

```
MONGO_USER=admin
MONGO_PASS=contraseña_segura
MONGO_URI=mongodb://admin:contraseña_segura@mongo:27017/recipehub?authSource=admin
JWT_SECRET=clave_jwt_secreta
```

### 5. Levantar los contenedores

```bash
docker compose up -d --build
```

Verificar que la API responde:

```bash
curl http://localhost:4000/api/health
```

### 6. Configurar Nginx

Crear el archivo de configuración:

```bash
sudo nano /etc/nginx/sites-available/recipehub
```

Contenido:

```nginx
server {
    listen 80;
    server_name api.recipehubgrupo1.xyz app.recipehubgrupo1.xyz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.recipehubgrupo1.xyz;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 443 ssl;
    server_name app.recipehubgrupo1.xyz;

    root /var/www/recipehub-grupo1/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/recipehub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7. Obtener certificado SSL con Certbot

```bash
sudo certbot --nginx -d api.recipehubgrupo1.xyz -d app.recipehubgrupo1.xyz
```

Verificar renovación automática:

```bash
sudo certbot renew --dry-run
```

### 8. Verificar el build del frontend

El `dist/` del frontend se incluye directamente en el repositorio y Nginx lo sirve desde `frontend/dist/`. Al clonar el repo y hacer `git pull`, los archivos compilados ya están disponibles sin pasos adicionales.

Para verificar que el frontend está correctamente desplegado:

```bash
curl -I https://app.recipehubgrupo1.xyz
```

Debe retornar `200 OK`.

---

## Pipeline CI/CD

El archivo `.github/workflows/deploy.yml` define dos jobs que se ejecutan automáticamente en cada push o pull request a `main`:

**Job 1 — `build-and-test`**
- Hace checkout del código
- Instala dependencias del backend con `npm ci`
- Ejecuta `npm test` — los 3 tests con Jest deben pasar
- Si algún test falla, el pipeline se detiene y no hace deploy
- Se ejecuta tanto en pull requests como en push a `main`

**Job 2 — `deploy`** *(solo en push a `main`, no en pull requests)*
- Se ejecuta solo si `build-and-test` pasó (`needs: build-and-test`)
- Se conecta al VPS por SSH usando el secret `VPS_SSH_KEY`
- Ejecuta `git pull origin main` en el servidor — esto descarga el `dist/` actualizado
- Corre `docker compose up -d --build` para reconstruir y levantar los contenedores
- Verifica que `https://api.recipehubgrupo1.xyz/api/health` responde con 200

Los secrets configurados en GitHub Actions son: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `MONGO_URI`, `JWT_SECRET`.

---

## Pruebas

Para ejecutar los tests del backend localmente:

```bash
cd backend
npm install
npm test
```

Los 3 tests cubren:
1. `POST /api/auth/register` — debe retornar 201 y crear el usuario
2. `POST /api/auth/login` — con credenciales correctas debe retornar token JWT
3. `GET /api/health` — debe retornar `{ status: 'ok' }` con código 200