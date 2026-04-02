# UniDeportes Backend

API REST en Node.js + Express + TypeScript con arquitectura MVC.

## Quickstart

1. Copia `.env.example` a `.env`
2. Ajusta variables según tu entorno local
3. Instala dependencias:
   - `npm install`
4. Ejecuta en desarrollo:
   - `npm run dev`

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

## Estructura

```
src/
  controllers/
  services/
  repositories/
  routes/
  models/
  middleware/
  config/
  db/
  utils/
```
