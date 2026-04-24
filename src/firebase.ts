// ─────────────────────────────────────────────────────────────────────────────
//  CONFIGURACIÓN FIREBASE
//  Sigue las instrucciones de FIREBASE_SETUP.md para obtener estos valores.
//  Pégalos aquí y vuelve a correr `npm run dev`.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey:            "PEGA_AQUI_TU_apiKey",
  authDomain:        "PEGA_AQUI_TU_authDomain",
  databaseURL:       "PEGA_AQUI_TU_databaseURL",   // ← CRÍTICO: incluye https://...
  projectId:         "PEGA_AQUI_TU_projectId",
  storageBucket:     "PEGA_AQUI_TU_storageBucket",
  messagingSenderId: "PEGA_AQUI_TU_messagingSenderId",
  appId:             "PEGA_AQUI_TU_appId",
};

// ¿Está configurado Firebase? (evita errores si el usuario aún no pegó los valores)
export const FIREBASE_CONFIGURED =
  !firebaseConfig.apiKey.startsWith('PEGA_AQUI') &&
  !firebaseConfig.databaseURL.startsWith('PEGA_AQUI');

// Solo inicializar si hay credenciales reales
const app = FIREBASE_CONFIGURED
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

export const db = app ? getDatabase(app) : null;
