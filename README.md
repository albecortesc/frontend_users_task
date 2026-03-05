# Frontend React - Usuarios y Tareas

Base inicial de interfaz en React (Vite) para conectarse a una API en C# que expone usuarios y tareas.

## Estructura inicial

- Menú lateral izquierdo con navegación de la app.
- Vista de inicio con resumen de datos.
- Vista de usuarios.
- Vista de tareas.
- Cliente API centralizado en `src/api/client.js`.

## Configuración

1. Copia `.env.example` a `.env`.
2. Define la URL de tu API:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> El frontend consumirá:
>
> - `GET {VITE_API_BASE_URL}/users`
> - `GET {VITE_API_BASE_URL}/tasks`

## Ejecutar proyecto

```bash
npm install
npm run dev
```

## Siguientes pasos sugeridos

- Agregar login/autenticación si tu API lo requiere.
- Incorporar formularios CRUD para usuarios y tareas.
- Agregar manejo de tokens (por ejemplo JWT) en `src/api/client.js`.
