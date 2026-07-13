# Roadmap Anteiku — Plan de Corrección y Próximos Pasos

## Estado Actual

- **Frontend pulido**: UI, accesibilidad (WCAG 2.2), SEO (meta tags, OpenGraph, Twitter Cards, JSON-LD), animaciones (Framer Motion), theme (dark/light), carrito de compras funcional con Zustand + persistencia local.
- **Backend desconectado**: La capa de base de datos (Drizzle ORM + PostgreSQL) existe pero no se usa en ninguna página. Todo el frontend consume datos de mock.
- **Mock data como fuente temporal**: Las páginas (`/shop`, `/product/[slug]`, homepage) leen directamente de `features/product/lib/mock-data.ts`. La DB tiene productos diferentes (seed viejo) con categorías desactualizadas.

## Encontrado

1. **Todo usa mock data, queries de DB no usadas**: `/shop`, `/product/[slug]`, y la homepage leen de `mockProducts`. No existe ningún `fetch()` ni query a la DB en pages.
2. **Tipos inconsistentes (mock vs DB enum)**: El enum DB tiene `coffee | figures | apparel | stickers | tamagotchis | accessories`. El mock usa `coffee | apparel | notebooks`. Hay un desfase total.
3. **Dos catálogos distintos (mock vs seed)**: El `db/seed.ts` tiene productos viejos (Tokyo Noir, Re:Zero Espresso, Kaneki Mask Tee, etc.) que no coinciden con los productos del mock (Tokyo Noir, Shibuya Red, White Pony Chomba, etc.).
4. **Imágenes placeholder/inexistentes**: Varias imágenes en el seed usan `/placeholder-*.png` que no existen. Las imágenes reales están en `/products/*.png`.
5. **Checkout es demo, no crea órdenes**: El checkout muestra un formulario pero no envía datos a la DB. No se crean registros en `orders` ni `order_items`.
6. **next.config.ts vacío**: No hay configuración de `images.remotePatterns`, `serverExternalPackages`, ni optimizaciones.
7. **Código muerto**:
   - `components/motion.tsx` exporta `FadeIn`, `SlideUp`, `StaggerContainer`, `StaggerItem` — ninguno es importado fuera del archivo.
   - `features/cart/ui/add-to-cart-button.tsx` — componente duplicado de `product-actions.tsx`, nunca importado.
   - Directorios vacíos `services/` y `hooks/`.
8. **siteUrl hardcodeado**: `"https://anteiku.com"` está hardcodeado en `app/layout.tsx`, `app/product/[slug]/page.tsx`, `app/shop/page.tsx`, y `app/page.tsx` (JSON-LD).
9. **`.env.local` con placeholders**: Los valores de Supabase, MercadoPago, Resend y Auth están vacíos o con `[YOUR-...]` placeholders.
10. **`formatPrice` asume cents pero mock almacena enteros**: `formatPrice` divide por 100 (`cents / 100`), pero los precios en mock son enteros ARS (ej: `13500` = $13.500). Esto genera precios incorrectos en la UI.

## Plan de Corrección

### 1. ~~Unificar schema DB a categorías del mock~~ ✅ COMPLETADO
**Archivo**: `db/schema.ts`
- ~~Cambiar enum `product_category`~~ → Reemplazado por tabla `categories` con CRUD completo.
- Campo `categoryId` en productos (FK a `categories`).
- Relaciones: `categoriesRelations`, `productsRelations` con `category: one(categories)`.
- El enum `product_category` fue eliminado.

### 2. Alinear seed data con mock data
**Archivo**: `db/seed.ts`
- Reemplazar todos los productos del seed con los 8 productos del mock data.
- Precios en enteros ARS (mismos valores que en mock).
- Categorías correctas: `coffee`, `apparel`, `notebooks`.
- Imágenes reales de `/products/*.png`.

### 3. Fix `formatPrice` — precios enteros ARS
**Archivo**: `lib/utils.ts`
- Quitar la división por 100. Los precios ya son enteros ARS.
- `formatPrice(13500)` → `$13.500` (formato argentino con separador de miles).

### 4. Limpiar código muerto
- **`components/motion.tsx`**: Eliminar exports no usados (`FadeIn`, `SlideUp`, `StaggerContainer`, `StaggerItem`). Mantener solo los variants reutilizables si el home los usa inline.
- **`features/cart/ui/add-to-cart-button.tsx`**: Eliminar (duplicado no importado).
- **Directorios vacíos**: Agregar `.gitkeep` a `services/` y `hooks/`.

### 5. Fix next.config.ts
**Archivo**: `next.config.ts`
- Agregar `images.remotePatterns` para desarrollo (localhost) y placeholder patterns.
- Agregar `serverExternalPackages: ["postgres"]` para el driver de DB.

### 6. Fix siteUrl hardcodeado
**Archivos**: `app/layout.tsx`, `app/product/[slug]/page.tsx`, `app/shop/page.tsx`, `app/page.tsx`
- Reemplazar `"https://anteiku.com"` con `process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"`.

### 7. Fix imágenes placeholder en cart drawer y order summary
**Archivos**: `features/cart/ui/cart-drawer.tsx`, `features/checkout/ui/order-summary.tsx`
- Reemplazar el `div` con texto "img" por `next/image` con fallback al nombre del producto.
- Si la imagen del item no existe, mostrar iniciales o icono de categoría.

## Próximos Pasos (post-conexión)

1. **Conectar DB real con Supabase**: Configurar `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, etc.
2. **Reemplazar mocks por queries de DB**: Crear queries en pages usando Drizzle. Eliminar dependencia de `mock-data.ts` en pages.
3. **Integrar MercadoPago**: flujo de pago real en checkout.
4. **Admin CRUD de productos/categorías**: panel admin para gestionar inventario.
5. **Auth (login/signup)**: Auth.js (NextAuth v5) con Google, Email (magic link). RBAC con roles: owner (acceso total), admin (gestión), customer (compras). Cada cliente recibe su propia instancia (sin multi-tenant).
6. **Admin panel**: dashboard con sidebar para gestión de productos, órdenes y clientes.
7. **Email confirmación (Resend)**: enviar email de confirmación de compra.
8. **Búsqueda UI**: implementar search con filtro de categorías.
9. **Stock validation**: validar stock antes de agregar al carrito y durante checkout.

## Admin CRUD (implementado)

- **Productos**: CRUD completo con formulario react-hook-form + Zod. Estados: activo/inactivo/borrador. Campo `featured`. Slug auto-generado desde nombre. Campo `categoryId` (FK a tabla `categories`).
- **Categorías**: CRUD completo con tabla `categories` (nombre, slug, descripción, imagen, orden, activo). El enum `product_category` fue eliminado. Formulario con auto-generación de slug.
- **Variantes**: CRUD de variantes por producto (talle, color, SKU, precio override, stock).
- **Ordenes**: Listado con filtros, detalle con items, actualizacion de estado (pendiente/pagado/enviado/entregado/cancelado), notas internas del admin.
- **Clientes (CRM)**: Listado con stats (total clientes, ordenes, ingresos). Perfil con historial de ordenes, direcciones, telefono.
- **Dashboard**: Stats reales (productos, ordenes, clientes, ingresos).
- **Envíos**: CRUD de métodos de envío (nombre, descripción, costo ARS, días estimados, estado activo/inactivo). Sidebar actualizado.
- **Schema**: Tabla `categories` con campos: id, name, slug, description, image, sortOrder, active, createdAt, updatedAt. Campo `categoryId` en productos (FK). Relacion products → categories.

### Nuevas tablas (implementadas)

- **shipment_methods**: Métodos de envío (retiro gratis, estándar, express). FK desde orders.
- **payments**: Tracking de pagos con MercadoPago (método, ID transacción, monto, estado, metadata JSONB). FK desde orders.
- **addresses**: Direcciones de clientes (calle, número, departamento, ciudad, provincia, código postal, país, teléfono, default). FK desde users.
- **inventory_movements**: Auditoría de stock (variante, cambio positivo/negativo, razón, notas). FK desde variants.

### Pendiente

- **Supabase Storage para imagenes**: Los formularios de productos aceptan URLs de imagen. Pendiente integrar subida a Supabase Storage.
- **Migraciones de DB**: Crear migraciones para las tablas nuevas con `npx drizzle-kit generate` y aplicarlas.
- **Integrar MercadoPago real**: Conectar flujo de pago en checkout con la tabla `payments`.

## Nuevas funcionalidades (implementadas)

### Descuentos

- **Tabla `discounts`**: Descuentos aplicables a productos o categorias con fechas de vigencia.
- **Tipos**: Porcentaje (0-100%) o monto fijo en ARS.
- **Alcance**: Por producto, por categoria, o global.
- **Compras minimas**: Opcional, monto minimo en ARS para aplicar el descuento.
- **Fechas**: Vigencia con `startsAt` y `endsAt`.
- **Admin CRUD**: Pagina `/admin/discounts` con tabla, crear, editar, eliminar.

### Cupones

- **Tabla `coupons`**: Codigos de descuento unicos.
- **Tipos**: Porcentaje, monto fijo, o envio gratis.
- **Usos**: Limite total (`maxUses`) y por usuario (`maxUsesPerUser`).
- **Validacion**: Server action `validateCoupon` verifica vigencia, usos, compra minima.
- **Admin CRUD**: Pagina `/admin/coupons` con tabla, crear, editar, eliminar.

### Suscripciones

- **Tabla `subscriptionPlans`**: Planes de suscripcion con precio, intervalo y features.
- **Tabla `userSubscriptions`**: Suscripciones de usuarios con estado, periodo y metodo de pago.
- **Planes default**: Cafe Mensual ($8.500/mes) y Cafe + Merch ($15.000/mes).
- **Estados**: active, cancelled, past_due, paused.
- **Admin**: Pagina `/admin/subscriptions` con planes y suscripciones activas.
