# Guía de Hosting Gratuito 🚀

Para subir este sistema a la web sin costo (pero con limitaciones de uso personal/pequeño negocio), utilizaremos la "Tríada del Hosting":

## 1. Base de Datos (PostgreSQL) 💾
**Recomendación:** [Neon](https://neon.tech/) o [Supabase](https://supabase.com/)
*   **Plan Gratuito:** 0.5 GB de almacenamiento y 1 GB de RAM.
*   **Ventaja:** Se configura en segundos y te dan un `DATABASE_URL` para poner en tu servidor.

## 2. Servidor Backend (NestJS) ⚙️
**Recomendación:** [Render](https://render.com/) o [Railway](https://railway.app/)
*   **Render (Free):** Permite desplegar aplicaciones Node.js gratis.
*   **Limitación:** El servidor se "duerme" tras 15 minutos sin uso. Al volver a entrar, puede tardar 30-50 segundos en arrancar.
*   **Railway:** Ofrece un crédito inicial de $5 que suele durar meses para proyectos pequeños, pero luego requiere pago mínimo.

## 3. Interfaz Frontend (React/Vite) 🎨
**Recomendación:** [Vercel](https://vercel.com/) o [Netlify](https://netlify.com/)
*   **Plan Gratuito:** Siempre online, muy rápido y con certificado SSL (HTTPS) automático.
*   **Ventaja:** Detecta cada `push` que hagas a GitHub y actualiza la web automáticamente.

---

## Comparativa de Limitaciones
| Capacidad | Local / Red Local | Hosting Gratuito |
| :--- | :--- | :--- |
| **Velocidad** | Instantánea | Primer acceso lento (30s) |
| **Costo** | $0 | $0 |
| **Acceso** | Solo en tu local/Wi-Fi | Desde cualquier parte del mundo |
| **Almacenamiento** | Disco duro de tu PC | Limitado (0.5GB - 1GB) |

---

## ¿Cómo Conectar Todo? 🔗
Una vez que despliegues el Backend, obtendrás una dirección como `https://valery-api.onrender.com`.
1. Entras a la versión web de tu sistema.
2. Vas a **Configuración > Conexión de Red (LAN)**.
3. Seleccionas **Modo Remoto**.
4. Pegas tu URL de Render y haces clic en **Guardar**.

¡Tu sistema web ahora se comunicará con tu servidor en la nube! ☁️
