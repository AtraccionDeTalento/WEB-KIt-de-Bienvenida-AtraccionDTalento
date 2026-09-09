# Portal de Bienvenida - Linktree USIL

Este repositorio contiene la versión web e interactiva del **Tool Kit de Bienvenida** para nuevos colaboradores de la **Corporación Educativa USIL**. 

La aplicación está diseñada como un portal Linktree responsivo y optimizado para dispositivos móviles y de escritorio.

## Características

* 📱 **Diseño Responsivo**: Formato celular adaptado para cualquier pantalla.
* 🗺️ **Nuestros Campus**: Mapas interactivos con enlace directo a Google Maps y códigos QR de ubicación para Campus 1 (Grau) y Campus 2 (La Fontana).
* 📧 **Principales Contactos**: Información organizada para consultas sobre planillas, seguros de vida ley, administración y bienestar social.
* 🚨 **Emergencias SOS**: Acceso directo al número telefónico de emergencia de USIL.
* 🔗 **Compartir Portal**: Modal personalizado con la previsualización del portal y opciones para compartir en WhatsApp, Facebook, LinkedIn, X (Twitter) y correo electrónico.

---

## Cómo subirlo a GitHub y activarlo en GitHub Pages

Para publicar este portal de forma gratuita en GitHub Pages y que corra desde la rama `main`, sigue estos sencillos pasos:

### Paso 1: Crear el repositorio en GitHub
1. Ingresa a tu cuenta en [GitHub](https://github.com).
2. Haz clic en el botón **New** (Nuevo repositorio).
3. Nombra tu repositorio (por ejemplo: `toolkit-bienvenida` o `linktree-usil`).
4. Déjalo como **Público** (requerido para GitHub Pages gratuito).
5. **No** selecciones la opción de inicializar con README, `.gitignore` o licencia (ya que los tenemos de forma local).
6. Haz clic en **Create repository**.

### Paso 2: Vincular y subir tu código local
Copia la URL de tu nuevo repositorio y ejecuta los siguientes comandos en tu terminal local dentro de esta carpeta:

```bash
# 1. Vincular el repositorio local con el remoto de GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 2. Renombrar la rama a main (por si acaso)
git branch -M main

# 3. Subir el código por primera vez
git push -u origin main
```

*(Reemplaza `TU_USUARIO` y `TU_REPOSITORIO` con tus datos correspondientes).*

### Paso 3: Activar GitHub Pages
Una vez subido el código a GitHub:
1. En la página de tu repositorio de GitHub, ve a la pestaña **Settings** (Configuración) en la barra superior derecha.
2. En la barra lateral izquierda, selecciona la sección **Pages** (dentro del menú *Code and automation*).
3. Bajo **Build and deployment** -> **Source**, asegúrate de que esté seleccionado **Deploy from a branch**.
4. En **Branch**, selecciona la rama **main** y la carpeta `/ (root)`.
5. Haz clic en **Save** (Guardar).

¡Listo! En unos minutos GitHub generará el enlace público de tu sitio web, el cual se verá parecido a:
`https://TU_USUARIO.github.io/TU_REPOSITORIO/`
