# Configuración de Google Maps - UniDeportes

## Descripción
Este documento explica cómo activar el mapa interactivo de Google Maps en el sitio web de UniDeportes localmente durante el desarrollo.

## ¿Por Qué No Está Activado por Defecto?
Para evitar comprometer claves API en el repositorio de Git, la clave de Google Maps se almacena localmente en tu navegador usando `localStorage`. Esto es **seguro** y **no expone** tu clave a Internet.

---

## Cómo Activar el Mapa

### Paso 1: Abre la Consola del Navegador

1. Abre `index.html` en tu navegador
2. Presiona **F12** (Windows/Linux) o **Cmd + Option + I** (Mac)
3. Verás la consola del navegador en la parte inferior

### Paso 2: Pega el Comando

En la consola (pestaña **Console**), copia y pega este comando, reemplazando `TU_CLAVE_AQUI` con tu clave API real:

```javascript
localStorage.setItem('UNIDEPORTES_MAPS_API_KEY', 'TU_CLAVE_AQUI')
```

**Ejemplo:**
```javascript
localStorage.setItem('UNIDEPORTES_MAPS_API_KEY', 'AIzaSyD5X9mK2pL4nQ7rS8tU9vW0xY1zAb2cDeFg')
```

### Paso 3: Recarga la Página

Presiona **F5** (o **Cmd + R** en Mac) para recargar la página.

---

## ¿Qué Esperar?

### ✅ Si Funcionó
- Verás un **mapa interactivo** en la sección de "Ubicación"
- Puedes **hacer zoom**, **arrastrar** y ver las **canchas**
- Los marcadores mostrarán el nombre de cada cancha al hacer click

### ❌ Si No Funcionó
**Posibles problemas:**

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Sigue mostrando "Mapa no disponible" | No copiaste la clave correctamente | Verifica que pegaste exactamente la clave en localStorage |
| Muestra "Autenticación inválida" | Clave API expirada o incorrecta | Genera una nueva clave en Google Cloud Console |
| Mapa gris sin controles | Clave válida pero sin permiso para Maps API | Ve a Google Cloud → APIs → Habilita "Maps JavaScript API" |
| Error en consola (F12) | Error técnico | Abre F12 → Console → busca mensajes rojos |

---

## Cómo Desactivar el Mapa

Si quieres volver al estado original (mapa no disponible):

```javascript
localStorage.removeItem('UNIDEPORTES_MAPS_API_KEY')
```

Luego recarga la página (F5).

---

## Obtener tu Clave API de Google Maps

Si **aún no tienes una clave**, sigue estos pasos:

### 1. Ir a Google Cloud Console
https://console.cloud.google.com/

### 2. Crear un Proyecto
1. Click en **"Select a Project"** (arriba izquierda)
2. Click en **"NEW PROJECT"**
3. Nombre: `UniDeportes`
4. Click **"CREATE"**
5. Espera 1-2 minutos

### 3. Habilitar Maps JavaScript API
1. Barra de búsqueda superior: busca **"Maps JavaScript API"**
2. Click en el resultado
3. Click en botón azul **"ENABLE"**

### 4. Crear una Clave de API
1. Panel izquierdo → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Se abre una ventana con tu nueva clave
4. **Copia esa clave** y úsala en el Paso 2 anterior

---

## ⚠️ Notas de Seguridad

### Para Desarrollo Local ✅
- La clave en `localStorage` es **segura** porque solo existe en TU computadora
- No se sube a Git porque está en `localStorage`, no en el código

### Para Producción ❌
- **NUNCA** pongas la clave en el código
- **NUNCA** la expongas en el frontend
- Usa un backend que valide y proxy las solicitudes a Google Maps API

---

## Verificación Rápida

Ejecuta esto en la consola (F12) para confirmar que está activada:

```javascript
console.log(localStorage.getItem('UNIDEPORTES_MAPS_API_KEY'))
```

Deberías ver tu clave impresa. Si ve `null`, no está configurada.

---

## Problemas Frecuentes

**P: ¿Debo hacer esto cada vez que abro el navegador?**
R: No. Una vez que ejecutas el comando, queda guardado en localStorage. Persiste hasta que cierres el navegador o ejecutes `localStorage.removeItem()`.

**P: ¿Funciona en Chrome, Firefox, Safari?**
R: Sí, pero cada navegador tiene su propia sesión de localStorage. Si cambias de navegador, debes repetir el paso 2.

**P: ¿Qué pasa si borro "datos del navegador"?**
R: Perderás la clave de localStorage. Tendrás que repetir el paso 2.

**P: ¿Puedo compartir mi clave con mi equipo?**
R: Sí, como está en `localStorage` local, **no se expone**. Cada miembro del equipo ejecuta el mismo comando con SU clave personal.

---

## Contacto
Si tienes problemas, verifica:
1. ✅ Clave API es válida (cópiala exactamente sin espacios)
2. ✅ Maps JavaScript API está habilitada en Google Cloud
3. ✅ Recargaste la página (F5) después de ejecutar el comando
4. ✅ Abriste la consola (F12) para ver si hay errores rojos
