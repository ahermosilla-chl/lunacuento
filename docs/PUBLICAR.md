# Publicar Lunacuento en App Store y Google Play

Guía paso a paso para la app (Capacitor + RevenueCat). Modelo: **app gratis con 2 cuentos** y una **compra única NO consumible de US$7,99** que desbloquea la Biblioteca completa.

> Estado: el código y los proyectos `ios/` y `android/` están listos, pero **todavía no se han compilado en un Mac ni en Android Studio** (esta fase se construyó en Linux, sin Xcode ni Android SDK). Los pasos 4 y 5 son la primera compilación real: si algo falla, será ahí.

## Datos fijos (usar exactamente estos valores en todas partes)

| Dato | Valor |
|---|---|
| Nombre de la app | Lunacuento |
| Bundle ID (iOS) / Package name (Android) | `com.lunacuento.app` |
| Producto de compra (iOS y Android) | `lunacuento_biblioteca` |
| Tipo de producto | iOS: **No consumible** · Android: **Producto integrado (in-app), de una sola vez** |
| Precio base | US$7,99 (las tiendas calculan los demás países) |
| Entitlement en RevenueCat | `biblioteca` |
| Variables de entorno | `NEXT_PUBLIC_RC_IOS_KEY`, `NEXT_PUBLIC_RC_ANDROID_KEY` |

Cuentas necesarias: Apple Developer Program (de pago, anual), Google Play Console (pago único de registro) y RevenueCat (el plan gratis alcanza al comienzo; revisa su precio vigente).

---

## 1. App Store Connect (iOS)

1. En **Certificates, Identifiers & Profiles → Identifiers** crea un App ID con el Bundle ID `com.lunacuento.app` y activa **In-App Purchase**.
2. En **App Store Connect → Apps → +** crea la app: nombre *Lunacuento*, idioma principal Español, Bundle ID `com.lunacuento.app`, SKU a elección (p. ej. `lunacuento-ios`).
3. **Acuerdos, impuestos y banca** (Business): firma el *Paid Apps Agreement* y completa datos fiscales y bancarios. **Sin esto las compras no funcionan**, ni siquiera en sandbox.
4. **Monetización → Compras dentro de la app → +**:
   - Tipo: **No consumible**.
   - Product ID: `lunacuento_biblioteca`.
   - Precio: base US$7,99.
   - Localizaciones (ES y EN): nombre "Biblioteca completa" / "Full library"; descripción corta: "Todos los cuentos y dibujos. Pago único." / "Every story and drawing. One-time purchase."
   - Captura de pantalla para revisión: `docs/capturas/compra-375.png` (o una del iPhone real).
   - Estado debe quedar en *Listo para enviar*; se envía junto con la primera versión de la app.
5. **Usuarios y acceso → Integraciones → In-App Purchase**: genera una **clave de In-App Purchase** (archivo `.p8`) y anota *Key ID* y *Issuer ID*. Se usan en RevenueCat (paso 3).
6. **Información de la app → Categoría de Niños** (ver checklist al final): elige *Kids* y el rango de edad. **Esta decisión activa reglas más estrictas.**
7. Ficha: textos ES/EN, capturas, URL de privacidad y de soporte, clasificación por edades, y "Privacidad de la app" (etiquetas de privacidad, ver checklist).

## 2. Google Play Console (Android)

1. Crea la app: nombre *Lunacuento*, idioma por defecto Español, tipo *App*, *Gratis*.
2. Completa **Panel → Configurar la app**: acceso a la app (sin inicio de sesión), anuncios (**No contiene anuncios**), clasificación de contenido (cuestionario IARC), público objetivo (ver checklist), seguridad de los datos, política de privacidad.
3. Configura **Perfil de pagos** (Configuración → Perfil de pagos) para poder vender.
4. **Monetizar con Play → Productos → Productos integrados en la aplicación → Crear producto**:
   - ID de producto: `lunacuento_biblioteca` (no se puede cambiar después).
   - Nombre y descripción en ES y EN, como arriba.
   - Precio: US$7,99 (ajusta los demás países si quieres) y actívalo.
5. **Configuración → Acceso a la API** (o IAM en Google Cloud): crea una **cuenta de servicio** con permisos para leer pedidos e información financiera (ver guía de RevenueCat) y descarga su **JSON**. Se usa en RevenueCat (paso 3).
6. Cuentas nuevas de desarrollador personal: Google puede exigir una **prueba cerrada con un mínimo de testers durante un tiempo** antes de pedir acceso a producción. Verifica el requisito vigente en Play Console.

## 3. RevenueCat

1. Crea un proyecto "Lunacuento".
2. **Apps → + New**:
   - **App Store**: Bundle ID `com.lunacuento.app`; sube la clave `.p8` de In-App Purchase con su Key ID e Issuer ID.
   - **Play Store**: package name `com.lunacuento.app`; sube el JSON de la cuenta de servicio.
3. **Product catalog → Products**: agrega `lunacuento_biblioteca` en cada app (importar desde la tienda, o crear a mano con el mismo id).
4. **Entitlements → + New**: identificador exacto **`biblioteca`**; adjunta los dos productos (iOS y Android).
5. **Offerings** (opcional): la app pide el producto directo por id (`getProducts`), no depende de offerings. Si quieres usarlas después, crea "default" con un paquete *Lifetime*.
6. **API keys → Public app-specific API keys**: copia la de iOS (`appl_…`) y la de Android (`goog_…`). **Son públicas**, no la *secret key*.
7. En el equipo de compilación crea `.env.local` (no se sube al repo) a partir de `.env.example`:

   ```bash
   NEXT_PUBLIC_RC_IOS_KEY=appl_xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RC_ANDROID_KEY=goog_xxxxxxxxxxxxxxxx
   ```

   Se incrustan al compilar: **hay que definirlas antes de `npm run build:app`**. Sin ellas la app funciona, pero las compras responden "no disponibles".

## 4. Compilar en Mac con Xcode

Requisitos: macOS con la versión de Xcode que pida Capacitor 8 (revisa <https://capacitorjs.com/docs/getting-started/environment-setup>) y Node.js 20 o superior. Capacitor 8 usa Swift Package Manager: **no hace falta CocoaPods**.

```bash
git clone https://github.com/ahermosilla-chl/lunacuento.git && cd lunacuento
npm ci
cp .env.example .env.local        # completar las claves de RevenueCat
```

```bash
npm run build:app                 # next build (genera out/) + cap sync
```

```bash
npm run cap:ios                   # abre ios/App en Xcode
```

En Xcode:

1. Target **App → Signing & Capabilities**: elige tu *Team* y deja "Automatically manage signing".
2. **+ Capability → In-App Purchase** (obligatorio: sin esto `getProducts` vuelve vacío).
3. **General**: *Version* (p. ej. 1.0.0) y *Build* (sube el número en cada subida). Orientación: el proyecto ya viene con las de Capacitor; si quieres solo vertical en iPhone, desmarca las horizontales.
4. Elige "Any iOS Device (arm64)" → **Product → Archive** → en el Organizer: **Distribute App → App Store Connect → Upload**.
5. En App Store Connect, la build aparece en **TestFlight** tras procesarse. Para publicar: asóciala a la versión, completa la ficha y **Envía a revisión** junto con la compra `lunacuento_biblioteca`.

Cada vez que cambies el sitio: `npm run build:app` otra vez (copia `out/` a `ios/` y `android/`).

El ícono y el splash salen de `assets/*.svg`; para regenerarlos: `npm run assets`.

## 5. Compilar en Android Studio

Requisitos: Android Studio reciente con el SDK que pida el proyecto (`compileSdk 36`) y el JDK que indique Capacitor 8 (el que trae Android Studio suele servir).

```bash
npm ci
cp .env.example .env.local        # claves de RevenueCat
npm run build:app
npm run cap:android               # abre android/ en Android Studio
```

En Android Studio:

1. Espera el *Gradle sync*. Para probar: botón ▶ con un emulador o un teléfono con depuración USB.
2. **Versión**: en `android/app/build.gradle` sube `versionCode` (entero, +1 en cada subida) y ajusta `versionName`.
3. **Build → Generate Signed App Bundle / APK → Android App Bundle**. Crea un *keystore* nuevo la primera vez y **guárdalo fuera del repo con copia de seguridad** (si se pierde, no podrás actualizar la app). Activa *Play App Signing* al subir.
4. En Play Console: **Pruebas → Prueba interna → Crear versión** y sube el `.aab`. Primero prueba allí; para producción: **Producción → Crear versión**.

## 6. Probar las compras (sandbox)

La compra solo se puede probar desde un build con claves reales y el producto ya creado en la tienda y en RevenueCat. El simulador/emulador sin tienda responde "no disponible" o "error", por diseño.

**iOS**
1. App Store Connect → **Usuarios y acceso → Sandbox → Probadores**: crea un probador con un correo que no sea un Apple ID real.
2. En el iPhone: **Ajustes → Desarrollador → Cuenta de Sandbox de Apple** (aparece tras instalar un build de Xcode o TestFlight) e inicia sesión con el probador.
3. Instala por Xcode (▶ en el teléfono) o por TestFlight. Las compras de builds de desarrollo y TestFlight son de sandbox y no cobran.

**Android**
1. Play Console → **Configuración → Pruebas de licencia**: agrega los correos Gmail de los probadores.
2. Sube un `.aab` a **Prueba interna**, agrega a los probadores a la lista y **instala desde el enlace de Play** (no por ▶ de Android Studio: la compra necesita una build firmada y distribuida por Play).
3. Con la cuenta de prueba, la compra muestra "compra de prueba" y no cobra.

**Qué comprobar** (en ambas):
- Al tocar el cuento con candado se abre la pantalla de compra; **Comprar** y **Restaurar compra** piden primero la suma del portón para adultos.
- Compra: tras pagar, el libro con candado se abre y la biblioteca queda desbloqueada.
- Cancelar el diálogo de la tienda muestra "Compra cancelada" y no desbloquea.
- Cierra y reabre la app **sin conexión**: sigue desbloqueada (copia local de la última respuesta de RevenueCat).
- Desinstala, reinstala y toca **Restaurar compra**: vuelve a desbloquearse.
- En RevenueCat → **Customers** aparece la compra (marcada *Sandbox*).

Si `getProducts` no devuelve el producto: revisa que el id sea idéntico, que el producto esté en estado válido en la tienda (iOS: *Listo para enviar*), que el *Paid Apps Agreement* esté firmado, que la capability *In-App Purchase* esté en Xcode y que pasen unas horas tras crearlo.

## 7. Checklist categoría Niños (App Store) y Familias (Google Play)

**Ambas tiendas**
- [ ] Sin anuncios ni analíticas ni rastreadores de terceros (la app no los tiene). RevenueCat se usa solo para validar la compra, con identificador anónimo; la app **nunca** llama a `collectDeviceIdentifiers` ni pide identificadores de publicidad.
- [ ] Portón para adultos antes de **comprar**, **restaurar** y abrir **enlaces externos** (implementado: suma con números en palabras y 3 opciones).
- [ ] Del niño solo se guarda el nombre, en el dispositivo; no sale a ningún servidor.
- [ ] Sin cuentas, sin chat, sin compartir en redes, sin enlaces a la web que no pasen por el portón.
- [ ] **URL de privacidad** pública y correcta: la web publicada, `https://<tu-dominio>/es/privacidad/`. La página de Privacidad dice qué se guarda, que no hay anuncios y qué hace RevenueCat.
- [ ] **Correo de soporte real**: la página de Privacidad dice "publicaremos al lanzar"; hay que reemplazarlo por el correo real antes de enviar.
- [ ] Los textos de Privacidad y Términos son **borrador**: revisarlos con asesoría legal antes de publicar (COPPA, RGPD-K y leyes locales).
- [ ] Reemplazar `[APP_STORE_URL]` y `[PLAY_STORE_URL]` en `src/lib/stores.ts` cuando existan las fichas, y volver a desplegar la web.

**App Store (Niños)**
- [ ] Categoría de la app: *Niños*, con el rango de edad elegido (5 y menos / 6–8 / 9–11). Para 0–7 años, "5 y menos" o "6–8" según el cuento.
- [ ] Cuestionario de **clasificación por edades** respondido con honestidad (sin contenido sensible).
- [ ] **Etiquetas de privacidad** ("Privacidad de la app"): declarar lo que RevenueCat recibe (identificador y compras) según su documentación vigente; no declarar seguimiento (*tracking*), porque no se rastrea.
- [ ] Notas para el revisor: explicar dónde está la compra (cuento con candado → Comprar) y el portón para adultos; dar acceso al probador sandbox si lo piden.
- [ ] Botón **Restaurar compra** visible en la pantalla de compra (implementado; Apple lo exige).
- [ ] Capturas de iPhone (6,9" o 6,5") y de iPad (la app lo admite); sin precios en las capturas que se contradigan con la tienda.
- [ ] Guía 4.2 (funcionalidad mínima): la app no es solo una web; funciona sin conexión, tiene compra nativa y contenido propio. Dejarlo claro en las notas.

**Google Play (Familias)**
- [ ] **Público objetivo y contenido**: marcar los grupos de edad que corresponden (incluyendo niños) y cumplir la *Política para familias*.
- [ ] **Anuncios**: declarar que no contiene.
- [ ] **Seguridad de los datos**: declarar lo que recibe RevenueCat y que no se comparte con terceros para publicidad.
- [ ] Verificar en el **Google Play SDK Index** y en la documentación de RevenueCat que el SDK está admitido para apps de Familias (esta información cambia; confírmala antes de enviar).
- [ ] Sin permisos peligrosos (la app declara `INTERNET`; revisa el manifiesto final por si el SDK de compras agrega alguno propio).
- [ ] Clasificación de contenido (IARC) completada.
- [ ] Ícono 512×512 (exportar `assets/icon-only.svg`), gráfico de funciones 1024×500 y capturas de teléfono (y tablet si la ofreces).
- [ ] Prueba cerrada si tu cuenta la exige (ver paso 2.6).

## 8. Antes de cada versión

```bash
npm run lint
npm run build:app
```

Sube *Build*/`versionCode`, prueba una compra sandbox y restaurar, y recién entonces envía a revisión.
