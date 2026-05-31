# EVMarket — Contexto del proyecto para Claude Code

## Qué es

Plataforma digital que ayuda a personas y pymes en Chile a decidir si les conviene cambiarse a un
vehículo eléctrico. Entrega diagnóstico con números claros, comparativa de modelos reales, plan de
carga y conexión con proveedores. Tesis editorial: **"electromovilidad sin chamullo"**.

Dos segmentos: **persona natural** (flujo gratuito + análisis completo $32.990) y **pyme**
(diagnóstico completo $159.990). El flujo de persona natural está construido; el flujo pyme está
en desarrollo.

## Stack

React + Vite + TypeScript + Tailwind CSS + Recharts + react-router-dom + lucide-react.
Sin backend, sin base de datos, sin autenticación real. Todo simulado en frontend con datos mock.
No agregar dependencias nuevas sin avisar. Las únicas autorizadas pendientes: `qrcode` y `jsPDF`
(para el QR-comprobante y el informe PDF del flujo análisis completo).

## Identidad visual

- Verde principal (botones/acciones): `#16A34A`
- Verde profundo (texto/acentos): `#0F3D2E`
- Verde claro (fondos/badges): `#DCFCE7`
- Amarillo de acento (solo detalles, no fondos): `#FACC15`
- Base: blanco y negro/gris muy oscuro.
- Logo: "**ev**market" en minúsculas; "ev" en verde principal, resto en verde profundo.
- Tipografía: Inter (Google Fonts). Títulos peso fuerte, cuerpo legible.

## Supuestos del TCO (en `data/mockDefaults.ts`)

- precioBencina: $1.250/L
- precioElectricidadCasa: $250/kWh
- precioElectricidadPublica: $450/kWh
- consumoEVKmKwh: 5 km/kWh (alineado con SEC)
- precioEVEstandar: $20.000.000
- reventaCombustion (persona natural): $10.000.000
- mantencionEVMensual: $18.000
- diasPorMes: 30

## Lógica de infraestructura de carga (persona natural)

Basada en 6 horas de carga nocturna disponible y 5 km/kWh. Siempre declarar estos supuestos en pantalla.

Tramos según km/día:
- ≤70 km/día → cargador de viaje 2,3 kW, sin instalación especial, sin costo adicional.
- 70–200 km/día → instalación domiciliaria 7,4 kW. Costo estándar: $1.900.000 (Estudio de Costos
  Infraestructura de Carga 2026, AgenciaSE). Se suma a la inversión inicial en el gráfico TCO.
- >200 km/día → 7,4 kW domiciliario + carga pública para el excedente sobre 200 km/día.

Cálculo de energía (tramo mixto):
- Primeros 200 km/día → precio casa ($250/kWh)
- Excedente → precio público ($450/kWh)

Inversión neta EV = $20.000.000 − $10.000.000 (reventa) + costo instalación si aplica.

## Heurística de estimador de instalación (post-pago persona natural)

Base: $1.900.000 (referencia: acometida 20 m, distancia interna 10 m, sobrepuesta, ampliación empalme).
- Acometida: ±$20.000/m sobre/bajo 20 m
- Distancia interna medidor↔estacionamiento: ±$20.000/m sobre/bajo 10 m
- Soterrada: +$500.000
- Empalme dedicado: +$250.000 (la base asume ampliación)
- Resultado como rango ±12%. Piso: $1.200.000.

## Reglas de diseño

- Sin semáforo ni veredicto "te conviene / no te conviene". Solo números; la persona decide.
- Registro y pagos: siempre simulados en frontend. No persistir estado de "registrado" entre diagnósticos.
- Scroll al tope en cada cambio de vista/paso.
- Formato montos: $X.XXX.XXX (punto como separador de miles, sin decimales).
- Commits: formato `feat:`, `fix:`, `style:`, `chore:`. Push al remoto tras cada commit.

## Estado actual del proyecto

Construido:
- Landing con CTAs diferenciados (persona natural / pyme).
- Flujo persona natural: formulario de diagnóstico (1 paso), dashboard con muro de registro
  difuminado, ruta recomendada con 3 CTAs ($32.990, guardar, pyme).
- Lógica TCO en `lib/tco.ts`.
- Lógica de infraestructura de carga con tramos por km/día.
- Sección pyme en landing.

En desarrollo / pendiente:
- Flujo "Análisis completo" ($32.990): 4 vistas (estimador instalación, comparativa modelos,
  financiamiento, contacto proveedores con QR-comprobante PDF).
- Flujo pyme completo: 9 pasos desde pre-pago hasta contacto con bancos y proveedores.

## Qué NO cambiar sin consultar

- La lógica del TCO y los supuestos de carga (son deliberados y basados en fuentes oficiales).
- Los precios de los servicios ($32.990 análisis completo, $159.990 pyme).
- La identidad visual y el tratamiento del logo.
- El principio de no emitir veredictos: solo mostrar números.
