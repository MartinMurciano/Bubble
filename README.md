# 🫧 Bubble

Plataforma web y mobile de gestión y venta de entradas para eventos. Conecta organizadores con asistentes facilitando la publicación de eventos, compra de entradas, validación por QR y estadísticas en tiempo real.

---

## 📋 Descripción

Bubble permite a **organizadores** crear y gestionar eventos, configurar tipos de entradas personalizadas y consultar estadísticas de ventas. Los **clientes** pueden explorar eventos, comprar entradas de forma segura con Stripe, recibir su factura en PDF por email y visualizar sus tickets con código QR desde la app mobile. Los **administradores** validan organizadores y gestionan usuarios.

---

## 🚀 Stack tecnológico

### Frontend Web
- React 18 + Vite
- React Router · Bootstrap · Axios
- Stripe.js (CardElement)

### Mobile
- React Native + Expo SDK 54
- React Navigation (bottom tabs + stacks)
- Stripe React Native (CardField)
- Expo Local Authentication (biometría)

### Backend
- Node.js + Express
- MySQL2 con named placeholders
- JWT + bcrypt
- PDFKit · Nodemailer · Cloudinary · Nominatim

### Base de datos
- MySQL — 11 tablas relacionales

### Servicios externos
- **Stripe** — procesamiento de pagos
- **Cloudinary** — almacenamiento de imágenes
- **Nominatim (OSM)** — autocompletado de ubicaciones
- **Gmail SMTP** — envío de emails transaccionales

---

## 🗂️ Estructura del proyecto

```
bubble/
├── frontend/          # React Web (Vite)
├── mobile/            # React Native (Expo)
└── backend/           # Node.js + Express
    └── src/
        ├── modules/
        │   ├── auth/
        │   ├── events/
        │   ├── orders/
        │   ├── tickets/
        │   ├── organizer/
        │   ├── admin/
        │   └── genero/
        ├── middleware/
        ├── services/
        └── config/
```

---

## ⚙️ Variables de entorno

Crear un archivo `.env` en `/backend`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bubble
DB_USER=root
DB_PASS=

JWT_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bubble.app.noreply@gmail.com
SMTP_PASS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
APP_URL=http://localhost:5173
```

---

## 🛠️ Instalación y ejecución

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend Web
```bash
cd frontend
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

---

## 🗃️ Base de datos

Tablas principales:

| Tabla | Descripción |
|---|---|
| `rol` | Roles del sistema (Admin, Organizador, Cliente) |
| `usuario` | Todos los usuarios unificados con `id_rol` |
| `organizador` | Datos adicionales del organizador |
| `genero` | Géneros musicales |
| `fiesta` | Eventos creados |
| `fecha` | Fechas y ubicaciones por evento |
| `entrada` | Tipos de entradas con nombre custom, precio y stock |
| `factura` | Compras realizadas |
| `detalle` | Ítems por factura |
| `codigo_entrada` | QR por entrada (ACTIVO / USADO / VENCIDO) |
| `calificacion` | Ratings de 1 a 5 estrellas |

---

## 🔑 Roles

| ID | Rol | Descripción |
|---|---|---|
| 1 | Administrador | Valida organizadores y gestiona usuarios |
| 2 | Organizador | Crea eventos y consulta estadísticas |
| 3 | Cliente | Compra entradas y califica eventos |

---

## ✨ Funcionalidades principales

- **Autenticación** — Registro con validación de edad (18+), login con email o username, login biométrico en mobile, bloqueo tras 3 intentos fallidos
- **Eventos** — Listado con filtros por género y ciudad, múltiples fechas por evento, autocompletado de ubicación
- **Compra de entradas** — Pago con Stripe, datos de facturación, generación de QR por entrada, factura PDF enviada por email
- **Mis compras** — Historial de órdenes, visualización de tickets con estado
- **Calificaciones** — Rating 1-5 estrellas, solo para eventos con fecha pasada
- **Panel organizador** — Gestión de eventos, estadísticas en tiempo real
- **Panel administrador** — Validación de organizadores, gestión de usuarios
- **Botón de arrepentimiento** — Formulario de solicitud de devolución

---

## 🧪 Testing con Stripe

Tarjeta de prueba:
```
Número: 4242 4242 4242 4242
Fecha:  cualquiera
CVV:    cualquiera
```

---

## 👤 Autor

**Martín Murciano** — Analista de Sistemas  
Proyecto Final — Escuela Da Vinci · 2024
