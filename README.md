# vertiente

**electromovilidad sin chamullo**

Mock navegable para demo de postulación a fondo Corfo. Plataforma que ayuda a personas y pymes en Chile a decidir si les conviene cambiarse a un vehículo eléctrico, con números claros, una ruta simple y contacto con proveedores.

---

## Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (tokens de diseño en `src/index.css`)
- Recharts (gráfico TCO)
- react-router-dom v7
- lucide-react

## Pantallas

| Ruta | Descripción |
|---|---|
| `/` | Landing — hero, cómo funciona, banner pyme |
| `/simulador` | Diagnóstico en 4 pasos (datos precargados) |
| `/resultado` | Dashboard TCO: gráfico, stat cards, semáforo |
| `/ruta` | Ruta recomendada en 5 pasos + CTAs |
| `/pyme` | Sección empresa con diagnóstico de flota |

## Flujo de demo (60–90 seg)

1. `/` → CTA "Calcular mi ahorro"
2. `/simulador` → avanzar los 4 pasos (datos ya precargados) → "Ver mi resultado"
3. `/resultado` → mostrar semáforo, stat cards, gráfico TCO → "Ver mi ruta"
4. `/ruta` → recorrer los 5 pasos
5. (Opcional) `/pyme` → mostrar diagnóstico pyme

## Datos mock

Los supuestos editables están en `src/data/mockDefaults.ts` y `src/data/evModels.ts`.
La lógica de cálculo TCO está en `src/lib/tco.ts` (función pura, sin dependencias externas).

## Notas

- Mock para demo: sin backend, sin auth real, sin pagos reales.
- Los CTAs de pago/contacto son solo visuales.
- Los datos persisten en `localStorage` entre simulador y resultado.
