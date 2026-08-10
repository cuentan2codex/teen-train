// Copia dist/index.html a dist/404.html para que GitHub Pages
// sirva el SPA en cualquier ruta profunda (recarga, deep link, etc.).
// GitHub Pages devuelve el contenido de 404.html (con status 404) cuando
// no encuentra un archivo para la ruta solicitada. El SPA cargará
// normalmente y React Router resolverá la ruta en el cliente.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const src = path.join(dist, 'index.html');
const dest = path.join(dist, '404.html');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Copiado dist/index.html -> dist/404.html (SPA fallback)');
} else {
  console.error('No se encontró dist/index.html. ¿Build falló?');
  process.exit(1);
}
