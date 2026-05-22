# smart-vs-mcp test validation report

Fecha: 2026-05-22

## Inventario de suites

- `tests/SmartVsMcp.UnitTests/settings-and-workspace.unit.test.ts`
- `tests/SmartVsMcp.IntegrationTests/status.integration.test.ts`
- `tests/SmartVsMcp.FunctionalTests/cli.functional.test.ts`

## Cobertura por comando

- `doctor`: integración de salud (`405 online`, `puerto no alcanzable`), funcional smoke.
- `status`: integración vía `getStatus` con settings válidos/faltantes.
- `list`: funcional smoke con `--workspace`.
- `scan`: cobertura indirecta por ruta de CLI compartida; pendiente caso funcional dedicado.
- `--help`: funcional smoke.

## Hallazgos y gaps

1. **Gap de contrato de exit code en `doctor`**  
   Comando: `node dist/index.js doctor --workspace <repo>`  
   Observación: depende del estado real del endpoint local (`0` online, `1` offline).  
   Acción: baseline congelado en pruebas (`expect([0,1])`) y pendiente formalizar contrato fijo.

2. **No hay escenario funcional aislado para `scan`**  
   Hay cobertura de lógica por CLI compartida, pero falta caso directo con workspace temporal dedicado.

3. **`.slnx` no ejecuta pruebas TypeScript**  
   El runner real es `vitest`; `dotnet test` no aplica al stack actual.

## Comandos de ejecución

- `npm run build`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:functional`
- `npm run test:all`
