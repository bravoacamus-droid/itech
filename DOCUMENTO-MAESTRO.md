# iTech Platform — Documento Maestro de Arquitectura

> Plataforma E-commerce + ERP moderna para **iTech Import Perú**.
> Reemplaza el sistema actual en Odoo por una solución propia sobre **Supabase + Vercel**.
> Estado: **v2 — definitiva** (decisiones confirmadas + rendimiento/escalado, PWA y plataforma del cliente; sin esquema de tablas todavía. Siguiente paso: Fase 0, inicializar el monorepo).

---

## 1. Visión y objetivos

Construir una plataforma única que integre:

1. **Tienda E-commerce moderna** (rediseño del itech.pe actual, misma marca, mucho más rápida y limpia).
2. **ERP completo** operado desde un back-office propio:
   - Almacén inteligente / predictivo (alarmas, dashboards, proyecciones).
   - CRM con pipeline automático asistido por IA (Gemini) + RAG sobre catálogo, precios y descuentos.
   - Contabilidad y **facturación electrónica SUNAT** (el cliente aporta su certificado digital; dejamos todo listo para conectar).
   - **Soporte técnico y reparaciones** (módulo completo en 7 fases, migrado desde el requerimiento Odoo).
   - **POS** (caja con arqueo, apartados, retomas, garantías).
   - Multi-sucursal, empleados (control de horario), cotizador con branding.
3. **Servicio B2B de soporte gestionado a empresas**, al estilo **BTECH** (infraestructura/cloud, ciberseguridad, consultoría, contratos con SLA, "Agenda una cita").

Principios rectores: **escalable, modular, seguro por diseño (RLS), multi-tenant/multi-sucursal, IA nativa, una sola fuente de verdad**.

---

## 2. Decisiones de arquitectura (resumen ejecutivo)

- **Repositorio:** **Monorepo con Turborepo + pnpm**. Un solo lugar para tipos, lógica de dominio, design system y migraciones; builds incrementales y deploys independientes por app.
- **Topología de apps:** **dos aplicaciones Next.js desplegables por separado** dentro del monorepo:
  - `web` → tienda + portal del cliente + portal B2B (dominio `itech.pe`).
  - `admin` → back-office ERP (subdominio `admin.itech.pe`).
  - **No** una sola app con `/admin`: separar reduce superficie de ataque pública, permite MFA/middleware más estrictos en staff, bundles más chicos y despliegues independientes. La seguridad real igual vive en la BD (RLS), pero la separación de superficies es defensa en profundidad.
- **Backend de datos:** **un solo proyecto Supabase** (Postgres + Auth + Storage + Realtime + Edge Functions + `pgvector`). RLS de Postgres como **frontera de seguridad principal**.
- **Identidad:** Supabase Auth con **claims JWT personalizados** (rol + sucursales + empresa) inyectados por un Auth Hook. Una sola identidad para clientes, staff y empresas B2B; el rol define qué ve cada quien.
- **Frontend:** Next.js 15 (App Router, React Server Components, Server Actions), TypeScript, Tailwind + shadcn/ui, tokens de marca iTech.
- **IA:** Gemini como motor (CRM, asistentes, forecasting) + **RAG con `pgvector`** sobre productos/precios/descuentos. Los **precios y reglas siempre se sirven autoritativamente desde la BD**, nunca "inventados" por el LLM.
- **Jobs/automatización:** workflows durables (Inngest **o** Trigger.dev) + `pg_cron`/Vercel Cron para tareas programadas.
- **Integraciones:** SUNAT (facturación electrónica directa + guías de remisión), Twilio/WhatsApp + Resend (notificaciones y confirmación de pedidos), pagos: **Culqi, Niubiz, Yape/Plin**.
- **Despliegue:** Vercel (apps web + cron) y Supabase (datos + Edge Functions para operaciones sensibles como la firma SUNAT).

---

## 3. Topología y estructura del monorepo

```
itech-platform/
├── apps/
│   ├── web/                  # Next.js — Storefront + Portal Cliente + Portal B2B (itech.pe)
│   │   ├── (storefront)/     #   catálogo, producto, carrito, checkout, libro de reclamaciones
│   │   ├── (account)/        #   cuenta del cliente, seguimiento de reparaciones, garantías/RMA
│   │   └── (b2b)/            #   portal empresas: contratos, tickets SLA, activos, citas
│   └── admin/                # Next.js — ERP back-office (admin.itech.pe)
│       ├── (sales-pos)/      #   POS, caja, apartados, retomas, anulaciones
│       ├── (inventory)/      #   almacén inteligente, compras, proveedores
│       ├── (repairs)/        #   soporte técnico y reparaciones (7 fases)
│       ├── (crm)/            #   pipeline, leads, IA
│       ├── (accounting)/     #   contabilidad + SUNAT
│       ├── (catalog)/        #   gestión de productos, imágenes, precios, descuentos
│       └── (admin-core)/     #   multi-sucursal, empleados, roles, dashboards gerenciales
│
├── packages/
│   ├── ui/                   # Design system (shadcn/ui + tokens de marca iTech)
│   ├── db/                   # Migraciones SQL, políticas RLS, tipos generados, seeds
│   ├── auth/                 # Helpers de sesión, guards de rol, claims
│   ├── domain/               # Lógica de negocio pura por contexto (sin I/O) + casos de uso
│   ├── ai/                   # Gateway Gemini, RAG, embeddings, guardrails, prompts
│   ├── integrations/         # SUNAT, Twilio, email, pagos (clientes tipados y aislados)
│   ├── jobs/                 # Definición de workflows durables (Inngest)
│   ├── sync/                 # Capa local-first: IndexedDB + cola de sincronización (PWA offline)
│   ├── config/               # tsconfig, eslint, tailwind preset, prettier compartidos
│   └── observability/        # logging, tracing, métricas, Sentry
│
├── supabase/
│   ├── migrations/           # esquema + RLS versionados
│   ├── functions/            # Edge Functions (firma SUNAT, webhooks, tareas sensibles)
│   └── seed.sql
│
├── _legacy-export/           # La copia estática actual (assets/marca/contenido de referencia)
├── turbo.json
├── pnpm-workspace.yaml
└── DOCUMENTO-MAESTRO.md
```

**Regla de dependencias:** `apps/*` dependen de `packages/*`; `packages/*` no dependen de `apps/*`. `domain/` no importa nada de infraestructura (es testeable en aislamiento). La I/O (Supabase, APIs externas) vive en `db/`, `integrations/`, `ai/`.

---

## 4. Stack tecnológico

- **Lenguaje:** TypeScript en todo el monorepo.
- **Framework:** Next.js 15 (App Router, RSC, Server Actions, streaming). PWA para recepción/taller en tablet/móvil.
- **UI:** Tailwind CSS + shadcn/ui + Radix; tokens de marca iTech; modo claro/oscuro.
- **Base de datos:** Postgres 15 (Supabase). `pgvector` para RAG. `pg_cron` para tareas. Pooling con Supavisor.
- **Acceso a datos:** Drizzle ORM para migraciones/esquema tipado **+** `supabase-js` para Auth, Realtime, Storage y consultas bajo RLS. El `service_role` **solo** en servidor (Server Actions/Edge Functions), nunca en el navegador.
- **Auth:** Supabase Auth (email/OTP, OAuth) + MFA para staff. Claims personalizados vía Access Token Hook.
- **IA:** Gemini (`gemini-2.x`) vía gateway propio en `packages/ai`; embeddings `text-embedding-004` en `pgvector`.
- **Jobs/workflows:** Inngest o Trigger.dev (automatizaciones CRM, notificaciones, reintentos, forecasting nocturno).
- **Notificaciones:** Twilio (WhatsApp/SMS) + Resend (email transaccional).
- **Pagos:** **Culqi** y **Niubiz** (tarjetas), **Yape/Plin** (QR/billetera) y **confirmación/atención de pedido por WhatsApp**; webhooks idempotentes.
- **Observabilidad:** Sentry (errores), Vercel Analytics, PostHog (producto), logs de Supabase.
- **Hosting:** Vercel (apps + cron) + Supabase (datos, storage, edge).
- **Calidad:** ESLint, Prettier, Vitest (unit), Playwright (e2e), CI en GitHub Actions; previews por PR en Vercel + Supabase branching.

---

## 5. Modelo de seguridad (núcleo del diseño)

La seguridad **no** vive en la app: vive en la base de datos. Toda app habla con Postgres bajo RLS.

### 5.1 Identidad y claims
- Una sola tabla de **perfiles** ligada a `auth.users`.
- Un **Access Token Hook** inyecta en el JWT: `role`, `branch_ids[]` (sucursales permitidas) y `company_id` (para usuarios B2B).
- Funciones SQL de ayuda (`auth.role()`, `auth.branches()`, `auth.company()`, `auth.has_perm(...)`) leen los claims y se usan dentro de las políticas. Marcadas `STABLE`, mínimas, sin `SECURITY DEFINER` salvo lo estrictamente necesario.

### 5.2 Roles (RBAC)
`customer`, `b2b_member`, `b2b_admin`, `technician`, `cashier`, `warehouse_clerk`, `accountant`, `branch_manager`, `org_admin` (gerente), `super_admin`.
Permisos finos por acción sensible (anular venta, reabrir garantía, ver finanzas, descuadre de caja) mediante una matriz rol→permiso evaluada en BD y en UI.

### 5.3 Tenancy y alcance
- **Multi-sucursal:** casi toda entidad operativa lleva `branch_id`; las políticas restringen a `auth.branches()`.
- **Multi-empresa (B2B):** los datos de cada empresa cliente se aíslan por `company_id`; un `b2b_member` solo ve lo suyo.

### 5.4 Reglas transversales
- **Deny by default:** RLS activado en todas las tablas; cada acceso es una política explícita.
- **"Modo Taller" (access masking):** el técnico, por su rol, solo ve sus órdenes asignadas; finanzas/configuración quedan fuera por RLS, no por ocultar en UI.
- **Datos sensibles del dispositivo** (PIN / patrón de desbloqueo): cifrados en reposo (pgsodium/Vault), accesibles solo a roles de taller, y registrados en auditoría.
- **Registros internos ocultos al cliente** ("daño de técnico"): separados por política a nivel de fila/columna; el portal del cliente nunca los expone.
- **Certificado digital SUNAT:** almacenado en **Supabase Vault** (cifrado); la **firma ocurre exclusivamente dentro de una Edge Function** del lado servidor. El certificado y su clave **jamás** llegan al navegador ni a `apps/web`.
- **Auditoría:** bitácora append-only para acciones críticas (anulaciones, descuadres, reaperturas de garantía, cambios de precio, accesos a datos sensibles).
- **Storage privado:** buckets separados con RLS para imágenes de producto (público lectura), fotos de reparación, firmas, certificados (privados estrictos).
- **Endurecimiento:** MFA staff, rate limiting, CSP/headers, validación de webhooks (firma + idempotencia), rotación de secretos, principio de mínimo privilegio.
- **Cumplimiento Perú:** Ley de Protección de Datos Personales, **Libro de Reclamaciones** obligatorio, normativa SUNAT de comprobantes electrónicos.

---

## 6. Contextos de dominio (bounded contexts)

Cada contexto tiene responsabilidad clara, dueño de sus datos y puntos de IA/seguridad. Se describen como dominios, **sin** esquema de tablas (eso se define en la fase de modelado).

### 6.1 Catálogo & PIM
Productos, variantes, categorías, atributos (marca/modelo), medios, **precios y descuentos** (listas, promociones, reglas), reseñas, **Libro de Reclamaciones**. Es la fuente autoritativa de precios que consume el RAG. Gestión completa desde `admin/(catalog)`: alta/edición de productos, **imágenes**, precios, descuentos.

### 6.2 Pedidos & Checkout
Carrito, checkout, pedidos, pagos (con webhooks idempotentes), estados de fulfillment. Integra inventario (reserva de stock) y facturación (emisión SUNAT al confirmar).

### 6.3 Almacén Inteligente / Inventario
- Stock por sucursal, lotes y **números de serie/IMEI**, movimientos, transferencias.
- **Predicción de demanda** (modelos estadísticos base + insights de Gemini), **punto de reorden** dinámico, **alarmas de stock bajo** con sugerencia automática de Orden de Compra.
- **Análisis ABC**, cobertura, rotación; **dashboards** y **proyecciones**.
- Consumo directo de repuestos desde un ticket de reparación (descuento virtual del inventario).

### 6.4 Compras & Proveedores
Órdenes de compra, recepción, costeo, **pedidos especiales con depósito** (cliente deja % y el ticket queda "Esperando Pieza"), reposición sugerida por las alarmas del almacén.

### 6.5 POS (Punto de Venta)
- **Apertura/cierre de caja con arqueo detallado** (desglose por denominación; si hay descuadre, exige nota justificativa para cerrar).
- **Apartados (layaway)** por cuotas.
- **Retomas/compra de usados (buyback)**: registro de IMEI, clasificación por grado (A/B/C), genera saldo a favor usable en reparación o retiro de efectivo.
- **Garantías extendidas (tipo AKKO)**: pop-up de venta sugerida al pagar.
- **Anulaciones (void)** total/parcial con permisos especiales.

### 6.6 Soporte Técnico & Reparaciones (módulo grande → §7)

### 6.7 CRM + IA
Leads, oportunidades, **pipeline Kanban con automatización** (movimiento de etapa, next-best-action, scoring) asistida por Gemini; resúmenes de conversaciones; **RAG** para responder sobre productos/precios/descuentos; asistente del cotizador.

### 6.8 Contabilidad & Facturación Electrónica SUNAT (→ §8)

### 6.9 B2B / Servicios Gestionados (→ §9)

### 6.10 Identidad, Roles & Multi-sucursal
Auth, RBAC, sucursales, **empleados** (perfil, tarifas de mano de obra por nivel), **control de horario (clock in/out)** desde el POS, programación de turnos.

### 6.11 Cotizador con branding
Generador de cotizaciones con identidad iTech (logo, colores), versión PDF y enlace web; asistido por IA para armado y precios desde catálogo.

### 6.12 Notificaciones & Comunicaciones
Orquestación de WhatsApp/SMS/email por evento (cambio de estado de ticket, citas, pagos). **Sistema inteligente de reseñas**: 4–5★ → redirección a Google Reviews; 1–3★ → formulario interno a gerencia (evita reseña pública negativa).

### 6.13 Plataforma de IA (transversal)
Gateway Gemini con control de costos/uso, caché, guardrails, trazabilidad de prompts; pipeline de embeddings y reindexado del catálogo en `pgvector`.

### 6.14 Analítica & Dashboards
**Dashboard multi-tienda** para gerencia (ventas, reparaciones, inventario por sucursal), KPIs, proyecciones.

### 6.15 Portal del Cliente
Seguimiento de reparación por ID de ticket en tiempo real, **citas**, **contador visual de garantía/RMA**.

---

## 7. Módulo Soporte Técnico & Reparaciones (7 fases)

Mapeo del requerimiento (originalmente para Odoo v18) a esta arquitectura. Vive en `admin/(repairs)` + portal en `web/(account)`.

**Fase 1 — Recepción:** tickets rápidos con **plantillas** (auto-cargan repuesto, mano de obra y tiempo estimado); clasificación jerárquica (Tipo→Marca→Modelo); **IMEI/serie** obligatorios; **PIN/patrón** (cifrado); **checklist de diagnóstico** ("No Testeable" si llega apagado); **evidencia fotográfica** desde tablet/móvil; **contrato + firma digital** de T&C antes de generar el ticket.

**Fase 2 — Taller:** **Modo Taller** (vista restringida por RLS al PIN del técnico: solo sus órdenes); **cronómetro** Inicio/Pausa que calcula mano de obra por **grupos de tarifa** (Nivel 1 ensamblaje vs Nivel 2 microsoldadura); **seguimiento de "daño de técnico"** (interno, oculto al cliente, afecta métricas y descuenta inventario); **Kanban** por urgencia/cita/fecha prometida.

**Fase 3 — Inventario:** consumo directo de repuestos desde el ticket; **alarmas de stock bajo** con sugerencia de PO; **pedidos especiales con depósito** (estado "Esperando Pieza").

**Fase 4 — Ventas/Pagos/POS:** se apoya en §6.5 (arqueo, apartados, retomas, garantías extendidas, anulaciones).

**Fase 5 — Experiencia del cliente:** **portal de seguimiento** por ID de ticket; **notificaciones automáticas** por cambio de estado (WhatsApp/SMS/email); **reseñas inteligentes** (ruteo por calificación); **gestión de citas** (presencial/domicilio).

**Fase 6 — Garantías (RMA):** **contador visual** de días de garantía (por perfil o QR del recibo); **"Reabrir por garantía"** (reabre ticket cerrado sin cobro, ligando el historial técnico previo).

**Fase 7 — Multi-sucursal & Empleados:** dashboard multi-tienda comparativo; **clock in/out** desde el POS para nómina y turnos.

---

## 8. Contabilidad & Facturación Electrónica SUNAT

- **Alcance:** emisión de Comprobantes de Pago Electrónicos (boleta, factura, notas de crédito/débito) **y Guías de Remisión electrónicas (GRE)** en **UBL 2.1**, firma con **certificado digital del cliente**, **envío directo a SUNAT** (SEE, sin OSE/PSE intermediario), recepción y archivo del **CDR**, manejo de contingencia y libros.
- **Guías de Remisión (GRE):** emisión directa a SUNAT (remitente/transportista según corresponda), ligada a ventas/traslados de inventario y a entregas B2B (recojo/entrega de equipos en reparaciones gestionadas).
- **Diseño seguro de la firma:** el certificado `.pfx` + clave se cargan una vez a **Supabase Vault** (cifrado). Una **Edge Function** dedicada: genera el XML, lo firma, lo envía a SUNAT, procesa el CDR y persiste el resultado. Nada de esto toca el cliente web.
- **"Listo para conectar":** configuración por empresa (RUC, series, ambiente beta/producción, endpoints SUNAT). El cliente solo sube su certificado y credenciales SUNAT y queda operativo.
- **Conciliación:** vínculo automático venta/pedido ↔ comprobante ↔ asiento contable.

---

## 9. B2B — Reparaciones Gestionadas & Helpdesk Empresarial

**Posicionamiento:** iTech como el **"departamento de soporte y reparaciones de tu empresa como servicio"**. No revendemos cloud/infra (eso era el modelo BTECH, descartado): apalancamos lo que iTech **ya domina** —reparaciones, repuestos, garantías e inventario— y lo convertimos en un servicio recurrente, predictivo y gestionado para empresas. Ese ERP integrado (reparaciones + almacén predictivo + IA/RAG) **es** la ventaja competitiva que un taller o revendedor común no puede igualar.

### 9.1 Las dos ofertas centrales

**A. Reparaciones gestionadas de flota.** La empresa contrata a iTech el mantenimiento y reparación de todo su parque de equipos (laptops, PCs, móviles, impresoras). Incluye: recojo/entrega programada, **SLA de reparación**, repuestos, garantía, equipo de respaldo (*loaner*) opcional y reportería. Reutiliza directamente el **módulo de Reparaciones (§7)**: los tickets de empresa entran a la misma operación de taller, pero agrupados por `company_id` y con SLA contractual.

**B. Helpdesk empresarial (mesa de ayuda).** Soporte a los empleados de la empresa por **WhatsApp / email / portal**, con **triage y primera respuesta por agente Gemini + RAG** (base de conocimiento + historial de activos de esa empresa), y **escalamiento a humano** con SLA medido. Permite atender muchas más cuentas con el mismo equipo.

### 9.2 Capacidades diferenciadoras (apalancan la plataforma)

- **Mantenimiento predictivo de flota:** con el historial de reparaciones + IA del almacén, se anticipan fallas y se crean **tickets preventivos** antes de que el cliente note el problema.
- **Portal de activos + "CIO virtual" (RAG):** cada empresa ve su inventario de TI (lo que compró/repara con iTech) y consulta en lenguaje natural (*"¿qué equipos están sin garantía?"*, *"¿qué conviene renovar este trimestre y cuánto cuesta?"*); Gemini responde con datos reales y **genera la cotización con branding iTech** (§6.11).
- **Cuentas corporativas:** precios negociados por empresa, **línea de crédito (net-30)**, flujos de **aprobación de compra**, centros de costo y multi-comprador, para repuestos/equipos/servicios.
- **Recompra y renovación corporativa (buyback a escala):** al renovar flota, iTech recompra la antigua (grado A/B/C, §6.5), reacondiciona y revende — ingreso doble + ángulo de sostenibilidad.
- **(Futuro) DaaS — Device-as-a-Service:** suscripción de flota con reparación/reemplazo incluidos; convierte la venta única en ingreso recurrente. Se documenta como visión, no en el MVP.

### 9.3 Portal de empresa y operación interna
- **Portal de empresa** (`web/(b2b)`, roles `b2b_admin`/`b2b_member`): tickets con **SLA y prioridades**, inventario de **activos**, contratos, citas, **reportes ejecutivos** (cumplimiento de SLA, salud de flota, gasto) y facturación/consumo.
- **Operación interna** (`admin`): cola de tickets B2B con asignación, métricas de SLA, integración con **CRM** (oportunidades/renovaciones) y **Contabilidad** (consumo → facturación recurrente SUNAT).
- **Captación:** vitrina B2B con CTA **"Agenda un diagnóstico / cita"** → alimenta el CRM (único elemento que tomamos del estilo de captación B2B observado).
- **Modelo de cobro:** **suscripción mensual** + **paquetes** de servicio (p.ej. planes por tamaño de flota o por bolsa de horas/tickets), facturados de forma recurrente y automática vía SUNAT.
- **Aislamiento:** todo dato B2B segmentado por `company_id` vía RLS (§5.3).

### 9.4 Alcance recomendado (mi recomendación: MVP primero, visión completa documentada)
Recomiendo entregar valor rápido sin sobre-construir, porque el MVP reutiliza el módulo de Reparaciones que ya existirá:

- **MVP B2B (rápido, bajo riesgo):** vitrina + "Agenda cita" → CRM · portal de empresa con **tickets SLA** + **inventario de activos básico** · **reparaciones gestionadas** sobre el módulo §7 · reportería simple de SLA.
- **Evolución (alto valor, incremental):** helpdesk **IA-first** (Gemini/RAG) · **mantenimiento predictivo** · **cuentas corporativas con crédito/aprobaciones** · **buyback corporativo**.
- **Visión (a 12–18 meses):** **DaaS** (flota por suscripción) + facturación recurrente medida.

> Pendiente de confirmar contigo: tipos de equipo/empresa objetivo, cobertura geográfica (recojo a domicilio) y si habrá equipo de respaldo (*loaner*) en los contratos.

---

## 10. IA: CRM automático + RAG

- **Gateway** único en `packages/ai`: control de costo/uso, caché, reintentos, registro y guardrails. Toda llamada a Gemini pasa por aquí.
- **RAG sobre catálogo/precios/descuentos:** embeddings del catálogo en `pgvector`; recuperación + generación con Gemini. **Los precios/descuentos definitivos siempre se leen de la BD** (el LLM redacta/explica, no fija montos). Reindexado incremental al cambiar productos/precios.
- **Casos CRM:** scoring de leads, **next-best-action**, movimiento automático de etapa del pipeline, resúmenes de hilos, redacción de seguimientos.
- **Otros usos:** asistente del **cotizador**, insights de **demanda/almacén**, ruteo de reseñas, soporte conversacional sobre productos.
- **Seguridad de IA:** sin datos sensibles en prompts salvo necesidad; respeto de RLS en la recuperación (la IA solo "ve" lo que el usuario podría ver); validación de salidas.

---

## 11. Marca & Design System

**Identidad iTech = blanco + juego de celestes.** El blanco domina (lienzo, mucho aire); los celestes/azules son la energía de la marca; el oscuro es solo neutro de texto/UI (no es color de marca). Tokens (a fijar en `packages/ui`):

- **Base / lienzo:** Blanco `#FFFFFF` · Fondo sutil `#F9FAFE`
- **Gama de celestes (corazón de la marca):**
  - Celeste claro `#7BDEFF` (acentos, fondos suaves, gradientes)
  - Azul primario / eléctrico `#0080FF` (botones, enlaces, énfasis)
  - Azul profundo `#0057AD` (hover, texto sobre celeste, estados activos)
- **Neutros (solo UI/texto, no marca):** Texto `#212529` · Slate `#4D5B7C` · Bordes `#DEE2E6`
- **Semánticos:** éxito `#28A745` · peligro `#DC3545` · alerta `#FFC107`

Dirección visual: **moderna, limpia, luminosa**, blanco con **gradientes cian→azul** de la marca, tarjetas de bordes suaves, microinteracciones, accesible (WCAG AA), responsive y rápida. El logo "iTech import" se usa desde `packages/ui` (extraído de `_legacy-export`).

---

## 12. No funcionales

- **Rendimiento:** RSC + caché/ISR para catálogo, imágenes optimizadas, Supavisor para conexiones.
- **Escalabilidad:** módulos desacoplados, jobs durables, lectura/escritura bien separadas en consultas críticas.
- **Disponibilidad/DR:** backups Supabase, restauración probada, contingencia SUNAT.
- **Offline-friendly (POS/recepción):** PWA con tolerancia a cortes en caja/taller.
- **i18n:** es-PE por defecto (preparado para más).
- **Testing:** unit (dominio), integración (RLS/políticas), e2e (flujos clave: checkout, ticket de reparación, emisión SUNAT).
- **DevEx:** previews por PR, seeds realistas, migraciones versionadas, entornos dev/staging/prod.

---

## 13. Roadmap por fases (incremental, cada fase entrega valor)

- **Fase 0 — Cimientos:** monorepo, design system + marca, Supabase, Auth + claims, esqueleto RLS, CI/CD, entornos.
- **Fase 1 — Storefront + Catálogo:** tienda moderna, gestión de productos/imágenes/precios/descuentos, Libro de Reclamaciones, reseñas.
- **Fase 2 — Inventario + POS + Compras:** stock multi-sucursal, caja/arqueo, apartados, retomas, garantías, PO y alarmas.
- **Fase 3 — Reparaciones:** las 7 fases + portal de seguimiento + notificaciones.
- **Fase 4 — Contabilidad + SUNAT:** facturación electrónica lista para conectar certificado.
- **Fase 5 — CRM + IA/RAG + Almacén predictivo:** pipeline automático, asistentes, forecasting y dashboards.
- **Fase 6 — B2B servicios gestionados:** vitrina, citas, portal de empresa, SLA.
- **Fase 7 — Multi-sucursal avanzado:** dashboards gerenciales, turnos/nómina, optimizaciones.

---

## 14. Decisiones confirmadas (v1)

1. **Topología:** ✅ **dos apps en monorepo** (`web` + `admin`). Mayor seguridad (superficie pública menor, MFA/middleware estrictos en staff), bundles más chicos y deploys independientes; la seguridad real vive en la BD (RLS).
2. **B2B (reparaciones + helpdesk):** ✅ **cobro por suscripción mensual + paquetes** de servicio (por flota o bolsa de horas/tickets), facturados de forma recurrente vía SUNAT. *(Por detallar luego: cobertura geográfica/recojo a domicilio y si se incluye equipo de respaldo* loaner*.)*
3. **SUNAT:** ✅ **emisión directa a SUNAT** (sin OSE/PSE), incluyendo boleta, factura, notas y **guías de remisión electrónicas (GRE)**.
4. **Pagos:** ✅ **Culqi** y **Niubiz** (tarjetas) + **Yape/Plin** + **confirmación de pedido por WhatsApp**.
5. **Jobs/workflows:** ✅ **Inngest** (recomendado por DX y manejo de reintentos/durabilidad) + `pg_cron`/Vercel Cron para tareas programadas.
6. **Alcance Fase 1:** ✅ **arrancar por Storefront + Catálogo** (rediseño moderno + gestión de productos/imágenes/precios/descuentos + Libro de Reclamaciones). Entrega valor visible rápido y asienta marca y design system.
7. **Migración de datos:** ✅ **partimos desde limpio** (catálogo nuevo cargado en la plataforma; Odoo queda solo como referencia histórica, y `_legacy-export` para marca/contenido).

---

## 15. Rendimiento, aislamiento de cargas y escalado

Pregunta clave: *¿el ERP a full frenará a los clientes que navegan y compran?* **No**, porque el aislamiento es por diseño.

### 15.1 Turborepo ≠ runtime
**Turborepo** es orquestación de **build/dev** (caché, builds incrementales): solo actúa al compilar, **no** afecta la velocidad en producción. En **Vercel**, cada app es un **deployment independiente** (`web` en `itech.pe`, `admin` en `admin.itech.pe`) con **autoescalado por separado**.

### 15.2 Aislamiento de cómputo
`web` (tienda) y `admin` (ERP) escalan de forma independiente: si decenas de usuarios usan el ERP intensivamente, eso consume el cómputo de `admin`; los miles navegando la tienda usan el de `web`. **El ERP no le quita recursos a la tienda.**

### 15.3 El único recurso compartido es la BD (y cómo se protege)
- **La tienda casi no toca Postgres:** el catálogo es lectura pura → **CDN + ISR + edge cache**. La mayoría del tráfico de compradores se sirve desde la CDN, no desde la base. Solo el checkout (escritura ligera) impacta la BD.
- **Réplicas de lectura:** dashboards, reportes y forecasting del ERP (consultas pesadas) se enrutan a una **read replica**, dejando la BD principal para lo transaccional de la tienda.
- **Analítica precomputada:** los cálculos costosos (proyecciones, ABC, KPIs) corren como **jobs programados (Inngest / `pg_cron`) en horas valle** y escriben a tablas resumen / **vistas materializadas**; los dashboards leen lo ya calculado, no agregan en vivo.
- **Pooling (Supavisor)**, índices adecuados, presupuestos de query y paginación por cursor en listados grandes.
- **Realtime acotado:** canales por alcance (sucursal/empresa/ticket), no suscripciones globales.

### 15.4 Resultado
La tienda permanece rápida **independientemente** de la carga del ERP. Escalar es: subir tier de Supabase / añadir réplicas, y dejar que Vercel autoescale cada app. Sin reescrituras.

---

## 16. Estrategia PWA

Una **PWA es una capa sobre las mismas apps Next.js** (service worker con **Serwist** + manifest), **no** un stack nuevo: mismo backend Supabase, mismo RLS, mismos `packages/`.

### 16.1 Capacidades que habilita
Instalable en el dispositivo · **offline** · **notificaciones push** · acceso a **cámara/escáner** (IMEI, QR, fotos) · **geolocalización** · **sincronización en segundo plano**.

### 16.2 Módulos por prioridad de valor
1. **Recepción y Taller (reparaciones):** crear tickets, fotos, firma digital, escaneo de IMEI/código; **tolerante a cortes de wifi** del taller.
2. **POS / Caja:** seguir vendiendo **offline** si se cae internet; impresión de ticket.
3. **Almacén:** escaneo para conteos, recepción de compras y transferencias.
4. **Técnico en campo / B2B a domicilio:** tickets asignados, navegación, firma y fotos en sitio.
5. **Cliente (tienda + portal):** instalable, **push de estado** de pedido/reparación, QR del recibo.

### 16.3 Offline fuerte (POS/Taller)
Capa **local-first** en `packages/sync`: datos en **IndexedDB** + **cola de operaciones** que sincroniza al reconectar, con resolución de conflictos. Los módulos críticos siguen operando sin red y concilian después.

### 16.4 Estructura (misma arquitectura)
- `web` → **PWA instalable + push** (tienda y portal del cliente).
- `admin` → vistas móviles PWA con offline/escáner para **taller, POS y almacén**.
- Opcional: surface dedicado `apps/field` (o route-group) para una instalación enfocada de técnicos/taller.

### 16.5 Nativo, ¿cuándo?
PWA cubre cámara, escáner y push (Android e iOS 16.4+). **Nativo (React Native) solo si** aparece un requisito duro: SDK de impresora específica, BLE avanzado o distribución por app store para clientes B2B. **PWA-first; nativo después solo si se justifica.**

---

## 17. Plataforma del Cliente (B2C + B2B) y personalización

Una **sola plataforma que se adapta** según quién entra. Mismo login; el rol (`customer` / `b2b_member` / `b2b_admin`) y el `company_id` definen las secciones visibles, y **RLS garantiza que cada quien solo vea lo suyo**. No son dos productos: es uno personalizado por segmento.

### 17.1 Cliente final (B2C) — "Mi iTech"
Seguimiento de reparación en tiempo real (línea de estados) · **aprobar/rechazar presupuesto** + firma digital · fotos de ingreso/salida · historial de equipos (IMEI/serie) · **garantía** con contador visual + "reabrir por garantía" (RMA) · citas (presencial/domicilio) · **pago** de saldo/depósito (Yape/Plin/Culqi) · chat con el taller · reseña inteligente · documentos y comprobante SUNAT descargables.

### 17.2 Empresa (B2B) — lo anterior + capa corporativa
**Vista de flota** con estado/SLA por ticket · multi-usuario con **aprobaciones por centro de costo** · **reportes ejecutivos** (SLA, gasto, salud de flota, garantías por vencer) · **inventario de activos + CIO virtual (RAG)** · recojo programado y registro masivo de equipos · **facturación recurrente** (mensual + paquetes) y descarga de comprobantes.

### 17.3 Personalización vía PWA
Push segmentado por audiencia ("listo para retirar" B2C · "SLA por vencer" B2B) · **escaneo de QR del recibo** para abrir ticket/ver garantía · cámara para enviar fotos del problema · offline para consultar estado/documentos · geolocalización para recojo.

### 17.4 Acceso sin fricción
**OTP / magic link** por WhatsApp/email/SMS: el cliente que dejó su equipo entra **sin crear contraseña**. Además, **seguimiento ligero** por **ID de ticket + últimos dígitos del teléfono sin login**; con login completo se desbloquean todas las funciones.

### 17.5 Sin stack nuevo
La personalización es UI dirigida por rol/segmento (RSC + feature flags) sobre el módulo de Reparaciones (§7), con RLS (§5) y PWA (§16). Reutiliza todo lo ya definido.

---

*Siguiente paso:* con la v2 confirmada, iniciar la **Fase 0** — inicializar el monorepo (Turborepo + pnpm), `packages/ui` con los tokens de marca (§11), proyecto Supabase con Auth + claims + esqueleto RLS (§5), y CI/CD con previews. Luego, **modelado de datos por contexto** (§6) para arrancar la Fase 1.
```
