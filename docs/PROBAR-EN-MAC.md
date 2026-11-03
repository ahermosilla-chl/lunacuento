# Probar la app en el simulador de iPhone y en el emulador de Android

Guía para ver Lunacuento corriendo en tu Mac, **sin cuenta de desarrollador, sin tiendas y sin pagos**. Se usa el modo de prueba, que desbloquea todos los cuentos.

> Estado: estos pasos no se han ejecutado todavía en un Mac (el proyecto se construyó en Linux). Si algún comando falla, pega el error y se corrige.

## 0. Una sola vez: instalar herramientas

1. **Xcode** desde la App Store (pesa varios GB). Ábrelo una vez y acepta la licencia. Después:

   ```bash
   xcode-select --install
   ```

   ```bash
   sudo xcodebuild -license accept
   ```

   Xcode necesita tener instalado un simulador de iOS: **Xcode → Settings → Components** (o *Platforms*) → instala el iOS más reciente.
   La versión mínima de Xcode la fija Capacitor 8: <https://capacitorjs.com/docs/getting-started/environment-setup>.

2. **Node.js** 20 o superior (con Homebrew: <https://brew.sh>):

   ```bash
   brew install node
   ```

   ```bash
   node -v
   ```

3. **Android Studio**: <https://developer.android.com/studio>. Ábrelo una vez y deja que descargue el SDK (*More Actions → SDK Manager*: un *SDK Platform* reciente, *Android SDK Platform-Tools* y *Android Emulator*).

4. Variables de Android para la terminal (añádelas a `~/.zshrc` y abre una terminal nueva):

   ```bash
   echo 'export ANDROID_HOME="$HOME/Library/Android/sdk"' >> ~/.zshrc
   ```

   ```bash
   echo 'export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"' >> ~/.zshrc
   ```

   ```bash
   echo 'export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"' >> ~/.zshrc
   ```

## 1. Descargar el proyecto y preparar el modo de prueba

```bash
git clone https://github.com/ahermosilla-chl/lunacuento.git
cd lunacuento
```

Mientras los cambios no estén en `main`, cambia a la rama que los trae (si ya se fusionó, sáltate este paso):

```bash
git checkout claude/lunacuento-modo-prueba
```

```bash
npm ci
```

```bash
echo 'NEXT_PUBLIC_MODO_PRUEBA=1' > .env.local
```

Genera el sitio y cópialo a los proyectos nativos (necesita internet: descarga las fuentes):

```bash
npm run build:app
```

> Cada vez que cambies código o `.env.local`, repite `npm run build:app`. La variable se incrusta al compilar.

## 2. iPhone (simulador de Xcode)

Opción A, con la interfaz de Xcode:

```bash
npm run cap:ios
```

1. Se abre Xcode. Espera a que termine *Resolving Package Dependencies* (la primera vez tarda; necesita internet).
2. Arriba, junto al botón ▶, elige un simulador (p. ej. **iPhone 16** o el que tengas).
3. Para el simulador **no hace falta firmar**: si Xcode pide *Team*, no importa para el simulador.
4. Pulsa **▶ (Run)**. El simulador arranca y abre Lunacuento.

Opción B, solo con comandos:

```bash
xcrun simctl list devices available
```

Copia el nombre exacto de un iPhone de la lista (p. ej. `iPhone 16`) y:

```bash
npx cap run ios --target "$(xcrun simctl list devices available | grep -m1 'iPhone' | grep -oE '[0-9A-F-]{36}')"
```

Si prefieres elegir de una lista interactiva:

```bash
npx cap run ios
```

Girar el simulador: **Cmd + ← / →**. Cambiar de iPhone: menú **File → Open Simulator**.

## 3. Android (emulador de Android Studio)

Crear un emulador (una sola vez): abre Android Studio → **More Actions → Virtual Device Manager → Create Device** → elige *Pixel 8* (o similar) → una imagen de sistema reciente (descárgala con ⬇) → *Finish*.

Opción A, con la interfaz:

```bash
npm run cap:android
```

1. Se abre Android Studio. Espera a que termine **Gradle sync** (abajo; la primera vez tarda y descarga cosas).
2. Arriba, en el selector de dispositivos, elige tu emulador.
3. Pulsa **▶ (Run 'app')**. El emulador arranca y abre Lunacuento.

Opción B, solo con comandos:

```bash
emulator -list-avds
```

```bash
emulator -avd NOMBRE_DEL_EMULADOR &
```

Cuando el emulador termine de arrancar:

```bash
npx cap run android
```

## 4. Qué probar (modo de prueba)

- Al final de la página principal, el pie dice **"Modo de prueba: cuentos desbloqueados"**.
- No se ve el header de la web ni botones "Descarga la app": solo la barra con el logo y **ES/EN**.
- En el estante, **"El dragón que no podía dormir" no tiene candado** y se abre directo en el libro. No aparece la pantalla de compra en ningún lado.
- Abrir el libro: la tapa se abre, la hoja sigue el dedo (en el simulador, arrastra con el mouse), tocar los lados pasa página.
- **Lectura acompañada** con voz: pulsa "Escuchar" y confirma que se iluminan las palabras y que la página pasa sola. Es el único punto de la auditoría que falta verificar con voz real.
- **Modo dormir** con temporizador, y la pantalla "Buenas noches".
- Colorear: tocar una zona la pinta; el dibujo del dragón también está disponible.
- Cambiar ES/EN y escribir un nombre: el nombre aparece en estante y cuentos.
- Gira el dispositivo y comprueba que no haya scroll horizontal.

## 5. Ver errores de la página (opcional)

- **iPhone**: en Safari del Mac, menú **Develop → Simulator → (Lunacuento)**. Si no ves el menú: *Safari → Settings → Advanced → Show features for web developers*.
- **Android**: en Chrome del Mac, abre `chrome://inspect` y pulsa *inspect* bajo el emulador.

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| Pantalla en blanco o contenido viejo | Repite `npm run build:app` y vuelve a pulsar ▶. |
| Xcode: *No such module* / paquetes sin resolver | **File → Packages → Reset Package Caches**, luego **Resolve Package Versions**. |
| Xcode no encuentra simuladores | Instala una plataforma iOS en **Xcode → Settings → Components**. |
| Gradle: error de Java / JDK | **Android Studio → Settings → Build Tools → Gradle → Gradle JDK**: elige el *jbr* que trae Android Studio. |
| `emulator: command not found` | Revisa las variables del paso 0.4 y abre una terminal nueva. |
| `npm run build:app` falla bajando fuentes | Falta internet o Google Fonts está bloqueado en tu red. |
| Las compras no funcionan | Es lo esperado: en modo de prueba no hay compras. Los pagos se prueban después, con `docs/PUBLICAR.md`. |

## Volver al modo normal (con candado y compra)

```bash
rm .env.local
```

```bash
npm run build:app
```
