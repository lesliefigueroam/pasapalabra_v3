# Configurar Firebase (5 minutos)

Firebase Realtime Database permite que el juego funcione en internet,
con jugadores en distintas ubicaciones. El plan gratuito (Spark) es
suficiente para cualquier partida.

---

## Paso 1 — Crear proyecto Firebase

1. Ve a https://console.firebase.google.com
2. Haz clic en **"Agregar proyecto"**
3. Ponle un nombre (ej: `pasapalabra-juego`) → Continuar
4. Desactiva Google Analytics (no lo necesitas) → **Crear proyecto**

---

## Paso 2 — Crear la Realtime Database

1. En el menú izquierdo ve a **Compilación → Realtime Database**
2. Haz clic en **"Crear base de datos"**
3. Elige la ubicación más cercana (ej: `us-central1` o `europe-west1`)
4. Selecciona **"Comenzar en modo de prueba"** → Habilitar

   > El modo de prueba permite leer/escribir sin autenticación durante 30 días.
   > Para producción permanente, ajusta las reglas (ver Paso 5).

---

## Paso 3 — Obtener la configuración

1. En el menú izquierdo haz clic en el ⚙️ (engranaje) → **Configuración del proyecto**
2. Baja hasta la sección **"Tus apps"**
3. Haz clic en el icono `</>` (Web) para registrar una app web
4. Dale un nombre (ej: `pasapalabra-web`) → **Registrar app**
5. Firebase te mostrará un objeto `firebaseConfig` como este:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pasapalabra-juego.firebaseapp.com",
  databaseURL: "https://pasapalabra-juego-default-rtdb.firebaseio.com",
  projectId: "pasapalabra-juego",
  storageBucket: "pasapalabra-juego.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Paso 4 — Pegar los valores en el proyecto

Abre el archivo `src/firebase.ts` y reemplaza cada `PEGA_AQUI_TU_...`
con el valor correspondiente del paso anterior.

```ts
const firebaseConfig = {
  apiKey:            "AIzaSy...",           // ← pega el tuyo
  authDomain:        "tu-proyecto.firebaseapp.com",
  databaseURL:       "https://tu-proyecto-default-rtdb.firebaseio.com",  // ← OBLIGATORIO
  projectId:         "tu-proyecto",
  storageBucket:     "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...",
};
```

> ⚠️ **`databaseURL` es el campo más importante.** Si lo omites, Firebase
> no sabe a qué base conectarse y el sync no funciona.

Guarda el archivo. La app detecta automáticamente si Firebase está
configurado o no (sin necesidad de reiniciar el servidor).

---

## Paso 5 — Reglas de seguridad (para producción)

El modo de prueba expira a los 30 días. Para uso continuo, ve a
**Realtime Database → Reglas** y pega esto:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

Esto permite que cualquiera con el código de sala lea y escriba,
sin autenticación. Es adecuado para un juego privado por invitación.

---

## Modo local (sin Firebase)

Si `src/firebase.ts` tiene los valores `PEGA_AQUI_...` sin cambiar,
la app cae automáticamente al modo **BroadcastChannel** (solo funciona
entre pestañas del mismo navegador o en red local / misma WiFi).

No necesitas borrar ni tocar nada para usar el modo local.

---

## Despliegue en internet (opcional)

Para que otros accedan por URL pública sin necesidad de red local:

```bash
# Con Vite preview (temporal, para pruebas)
npm run build
npm run preview -- --host

# Con Firebase Hosting (permanente y gratuito)
npm install -g firebase-tools
firebase login
firebase init hosting   # elige el proyecto, carpeta dist, SPA: sí
npm run build
firebase deploy
```

Después de `firebase deploy` tendrás una URL pública como:
`https://pasapalabra-juego.web.app`
