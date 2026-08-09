# TeenTrain 🏋️

Aplicación web **mobile-first** de seguimiento de entrenamiento para adolescentes, construida con **React + TypeScript + Vite + Tailwind CSS**, desplegable como **PWA** y preparada para empaquetarse como **app Android con Capacitor**.

🔗 **Demo en GitHub Pages:** https://cuentan2codex.github.io/teen-train/

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS 3** (mobile-first, dark mode)
- **React Router v7** (con rutas protegidas)
- **Zustand** (estado global de auth)
- **Recharts** (gráficos de progreso)
- **vite-plugin-pwa** (PWA con manifest + service worker)
- **Lucide React** (iconografía)
- Persistencia local con **localStorage** (estructurada para migrar a Supabase)

## Decisiones técnicas honestas

### ¿Por qué localStorage y no Supabase?

GitHub Pages sólo sirve archivos estáticos (no hay backend Node). Para tener autenticación + base de datos reales en producción se necesita un servicio externo (Supabase o Firebase). Como en este escenario no se proporcionaron credenciales, esta versión implementa **persistencia real en el navegador** con una API limpia que imita un cliente de base de datos.

**Ventajas:**
- Las contraseñas se hashean con PBKDF2 (Web Crypto API, 100k iteraciones).
- Los datos no salen del dispositivo del usuario (mejor privacidad para adolescentes).
- Cada usuario sólo accede a sus propios datos (filtrado por `user_id`).

**Para migrar a Supabase:** basta con reemplazar `src/services/database.ts` por una implementación equivalente usando `@supabase/supabase-js`. Las interfaces en `src/types/index.ts` ya están listas para mapear a tablas SQL.

## Funcionalidades

- ✅ Registro, login, recuperación de contraseña y cierre de sesión
- ✅ Dashboard con saludo, XP, racha, objetivo semanal y rutina recomendada
- ✅ Catálogo de 5 rutinas predeterminadas y 10 ejercicios
- ✅ Sesión de entrenamiento interactiva con series, repeticiones, peso y descanso
- ✅ Cronómetro de entrenamiento + temporizador de descanso
- ✅ Historial con filtros por semana/mes y detalle completo
- ✅ Progreso con gráficos (peso, entrenamientos/semana, repeticiones)
- ✅ Gamificación: XP, niveles, rachas, 6 logros desbloqueables
- ✅ Perfil con datos personales y logros
- ✅ Configuración: tema claro/oscuro/sistema, unidades kg/lb, notificaciones, cambio de contraseña, eliminación de cuenta
- ✅ PWA instalable con manifest y service worker
- ✅ Diseño mobile-first con navegación inferior

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/    # AppShell, BottomNav
│   └── ui/        # Badge, Modal, Progress, PageHeader
├── data/          # Rutinas, ejercicios y logros predeterminados
├── hooks/         # useTimers (cronómetro y countdown)
├── pages/
│   ├── auth/      # Login, Registro, Recuperar
│   └── app/       # Dashboard, Rutinas, Sesión, Historial, Progreso, Perfil, Config
├── services/      # storage (localStorage), database (auth+repos), gamification
├── store/         # auth (Zustand)
├── types/         # Interfaces TypeScript del dominio
└── utils/         # format (fechas, duraciones, unidades)
```

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # preview del build
```

## Despliegue a GitHub Pages

El workflow `.github/workflows/deploy.yml` se ejecuta automáticamente en cada push a `main`. Construye la app con `VITE_BASE_PATH=/teen-train/` y publica el `dist/` en GitHub Pages.

Para activar Pages manualmente la primera vez: **Settings → Pages → Source: GitHub Actions**.

## Preparación para Android (Capacitor)

La app ya está estructurada para empaquetarse con Capacitor:

1. `npm install @capacitor/core @capacitor/cli`
2. `npx cap init TeenTrain com.teentrain.app --web-dir=dist`
3. `npm run build`
4. `npx cap add android`
5. `npx cap sync`
6. `npx cap open android` → genera APK/AAB en Android Studio

La navegación usa `BrowserRouter` con `basename` dinámico, lo que evita conflictos de rutas dentro del WebView de Android. Las APIs usadas (Web Crypto, localStorage, Service Worker) están soportadas por el WebView de Android moderno.

## Seguridad y responsabilidad (adolescentes)

- Edad restringida a 10–19 años en el registro.
- Las contraseñas se hashean (PBKDF2, 100k iteraciones), nunca se guardan en texto plano.
- No se recopilan datos innecesarios. Sexo es opcional.
- Eliminación de cuenta borra todos los datos asociados.
- Mensajes que promueven hábitos saludables: nada de "entrena aunque estés lesionado" ni "pierde X kilos rápidamente".
- La app **no sustituye** el consejo de un entrenador, médico o profesional de la salud.

## Próximos pasos recomendados

1. **Migrar a Supabase** para tener autenticación real entre dispositivos y sincronización en la nube.
2. **Añadir notificaciones push** con la API de Notifications y un service worker.
3. **Empaquetar con Capacitor** y publicar en Google Play (ver `docs/PLAY_STORE.md`).
4. **Política de privacidad** obligatoria antes de publicar en Play Store.
5. **Tests E2E** con Playwright para flujos críticos.
