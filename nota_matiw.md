# Nota para Matiw — Estado del Examen RecipeHub

> Leé esto antes de tocar cualquier archivo del repo.

---

## ¿Qué ya está hecho? (Isaac lo hizo)

### Infraestructura — 100% lista

- **VPS** corriendo en Linode (Ubuntu 24.04) — IP: `172.233.173.223`
- **Docker** y **Docker Compose** instalados en el servidor
- **Nginx** configurado como reverse proxy con **SSL válido** (Let's Encrypt)
- **Firewall** configurado (puertos 22, 80 y 443 abiertos)
- **Dominio**: `recipehubgrupo1.xyz`
- **Subdominios funcionando con HTTPS**:
  - `https://api.recipehubgrupo1.xyz` → apunta al backend (puerto 4000)
  - `https://app.recipehubgrupo1.xyz` → apunta al frontend (dist/)
- **Pipeline de GitHub Actions** funcionando — cada push a `main` hace deploy automático al VPS

### Repositorio

- **URL**: `https://github.com/IsaacAlvaradoMata/recipehub-grupo1`

### Estructura del proyecto

```
recipehub-grupo1/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       ← conexión a MongoDB
│   │   ├── controllers/          ← vacío, te toca llenarlo
│   │   ├── middleware/           ← vacío, te toca llenarlo
│   │   ├── models/               ← vacío, te toca llenarlo
│   │   ├── routes/               ← vacío, te toca llenarlo
│   │   └── index.js              ← servidor Express base, ya funciona
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   └── package.json
├── frontend/                     ← vacío, le toca a Melany
├── .github/
│   └── workflows/
│       └── deploy.yml            ← pipeline CI/CD
├── docker-compose.yml
└── .env.example
```

### El `index.js` ya tiene

- Express configurado con `cors` y `express.json()`
- Conexión a MongoDB con Mongoose
- Endpoint `GET /api/health` que retorna `{ status: 'ok', timestamp: '...' }`
- Escucha en el puerto 4000

---

## ¿Qué te toca hacer a vos?

Tu responsabilidad es **toda la API REST**. En orden:

### 1. Configurar MongoDB para desarrollo local

El MongoDB en producción corre dentro de Docker y **no tiene el puerto expuesto al exterior** (así lo pide la rúbrica). Para desarrollar localmente necesitás una base de datos. La opción más simple es **MongoDB Atlas** (gratis):

1. Andá a [mongodb.com/atlas](https://mongodb.com/atlas) y creá una cuenta gratuita
2. Creá un cluster gratis (M0)
3. En "Database Access" creá un usuario con password
4. En "Network Access" agregá tu IP (o `0.0.0.0/0` para desarrollo)
5. Copiá el connection string que te da Atlas

Luego creá el archivo `.env` dentro de la carpeta `backend` (no lo subas a GitHub, ya está en el `.gitignore`):

```
MONGO_URI=mongodb+srv://tuusuario:tupassword@cluster.mongodb.net/recipehub
JWT_SECRET=recipehub_secret_dev_2026
PORT=4000
```

### 2. Instalar dependencias

```bash
cd backend
npm install
```

### 3. Verificar que el servidor arranca

```bash
npm run dev
```

Deberías ver:
```
Server running on port 4000
MongoDB connected successfully
```

Probá en el navegador: `http://localhost:4000/api/health` → debe retornar `{ "status": "ok" }`

---

## Lo que tenés que construir

### Modelos Mongoose (carpeta `src/models/`)

Tres archivos: `User.js`, `Recipe.js`, `Comment.js`

**Regla clave del examen:** los ingredientes y pasos van **embebidos** dentro de la receta (no son colecciones separadas). Los comentarios sí son colección separada con referencias.

### Endpoints requeridos

**Autenticación** (`src/routes/auth.js`):
- `POST /api/auth/register` — registrar usuario, hashear password con bcrypt
- `POST /api/auth/login` — login, retornar JWT
- `GET /api/auth/me` — perfil del usuario autenticado (requiere JWT)

**Recetas** (`src/routes/recipes.js`):
- `GET /api/recetas` — listar todas, soportar query params: `?categoria=`, `?dificultad=`, `?tags=`
- `POST /api/recetas` — crear receta (requiere JWT)
- `GET /api/recetas/:id` — obtener una receta con datos del autor
- `PUT /api/recetas/:id` — actualizar (requiere JWT y ser el autor)
- `DELETE /api/recetas/:id` — eliminar (requiere JWT y ser el autor)

**Comentarios** (`src/routes/comments.js`):
- `GET /api/recetas/:id/comentarios` — listar comentarios de una receta
- `POST /api/recetas/:id/comentarios` — agregar comentario (requiere JWT)
- `DELETE /api/comentarios/:id` — eliminar comentario (requiere JWT y ser el autor)

### Middleware de autenticación (`src/middleware/auth.js`)

Extrae el JWT del header `Authorization: Bearer <token>`, lo verifica y agrega `req.user` con los datos del usuario.

### Tests unitarios (`src/tests/`)

> ⚠️ **Importante:** el script de test en `package.json` tiene temporalmente el flag `--passWithNoTests` para que el pipeline no falle mientras no hay tests. Cuando ya tengas los 3 tests escritos y funcionando, quitá ese flag y dejá el script así:
> ```json
> "test": "jest --forceExit"
> ```

El pipeline falla si `npm test` falla. Necesitás **mínimo 3 tests** con Jest + Supertest:

- Test 1: `POST /api/auth/register` retorna 201
- Test 2: `POST /api/auth/login` con credenciales correctas retorna token
- Test 3: `GET /api/health` retorna `{ status: 'ok' }` con código 200

---

## Status codes que la rúbrica evalúa

| Situación | Código |
|-----------|--------|
| Registro exitoso | 201 |
| Login exitoso | 200 |
| Credenciales incorrectas | 401 |
| Sin token o token inválido | 401 |
| No sos el autor del recurso | 403 |
| Recurso no encontrado | 404 |
| Error de validación | 400 |

---

## Cómo hacer deploy cuando terminés

Simplemente hacé push a `main`:

```bash
git add .
git commit -m "feat: implement API endpoints"
git push origin main
```

El pipeline de GitHub Actions automáticamente:
1. Instala dependencias
2. Corre los tests
3. Se conecta al VPS por SSH
4. Hace `git pull` y levanta los contenedores con `docker compose up -d --build`
5. Verifica que `https://api.recipehubgrupo1.xyz/api/health` responde

Si el pipeline está en verde ✅ en la pestaña Actions de GitHub, el deploy fue exitoso.

---

## Reglas importantes

- Todo el código en **inglés** (variables, funciones, comentarios)
- **NUNCA** guardar passwords en texto plano — siempre bcrypt
- **NUNCA** retornar el campo `password` en las respuestas — usar `.select('-password')`
- **NUNCA** hardcodear credenciales en el código — todo va en variables de entorno
- El archivo `.env` **no se sube a GitHub**

---

## Contacto

Cualquier duda coordiná con Isaac antes de hacer push a `main`.