# Juanfra Ruiz · Web lista para Vercel

Incluye la página principal, /eventos/, biografía, fotografías, logos, Spotify, WhatsApp, traducción al inglés y técnica para eventos sociales en todo el país.

## Publicar

Descomprimí el ZIP y usá la carpeta juanfra-ruiz-vercel como raíz del proyecto.

En Vercel, la configuración ya está en vercel.json:
- Framework Preset: Other.
- Build Command: node scripts/build-vercel.mjs.
- Output Directory: vercel-dist.
- Install Command: vacío.

Si usás el panel de Vercel, subí esta carpeta a un repositorio e importalo. Si usás la terminal, abrila dentro de esta carpeta y ejecutá:

```sh
npx vercel --prod
```

El comando permite iniciar sesión y elegir tu cuenta/proyecto.

## Dirección de la web

Activá las System Environment Variables de Vercel para que los enlaces canonical y Open Graph usen el dominio del proyecto. Si tenés un dominio propio, podés agregar SITE_URL con la dirección completa (por ejemplo, https://tudominio.com) y volver a desplegar.

La dirección original de ChatGPT permanece en los archivos fuente hasta que el build la adapta al nuevo dominio. Las páginas, imágenes, estilos, animaciones y contactos funcionan con rutas locales.

## Editar

El contenido está en dist/index.html y dist/eventos/index.html. Los estilos están en dist/style.css, las interacciones en dist/script.js y las imágenes/logos en dist/assets/.

La web no requiere base de datos, dependencias externas ni conexión a un calendario. No contiene credenciales.
