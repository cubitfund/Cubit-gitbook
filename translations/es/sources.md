---
description: "Alcance de las lecturas, jerarquía documental, fuentes de la dirección artística y método de mantenimiento del GitBook."
section: "05 / VERIFICAR"
reading: "REFERENCIAS DE LA GUÍA"
search:
  keywords: ["fuentes", "referencias", "documentación", "HonKit", "especificación", "versión", "redesign"]
---

# Fuentes y método

Esta guía se ha redactado a partir del código local y de las decisiones de diseño fijadas el **14 de septiembre de 2026**. Los archivos citados a continuación son rutas del repositorio, no endpoints de red.

La nueva versión se describe a partir de la rama `redesign/tide-lp-autowalls-vault`. Las referencias históricas de código designan la revisión `991fca9` del protocolo, conservada en la rama `work/v1-v2-fixed-walls`. La documentación publicada no constituye una validación de los contratos descritos.

## Orden de lectura

La referencia de la nueva versión es **`contracts/docs/REDESIGN_HANDOFF.md`**. Este documento recoge las decisiones de diseño y su implementación en el código; prevalece sobre los documentos anteriores.

Las tasas no cambian: **un 3% en la compra para el equipo** y **un 15% en la venta: 12% para los muros y 3% para el equipo**. La liquidez de trading es una banda única, los muros se colocan y se vacían en cada venta y la FDV de lanzamiento elegida es de **3,75 ETH**.

El documento **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** expresaba la base de lanzamiento en **7 000 USD de FDV** sobre 21 millones de tokens. La nueva versión fija la FDV directamente en ETH; esta guía no establece ninguna correspondencia entre estas dos referencias.

Para saber qué funciona realmente, hay que relacionar después el código, los resultados de validación y el despliegue de una misma versión.

Un comentario de código no sustituye una decisión confirmada. A la inversa, una decisión no prueba que una implementación o una red la ejecuten.

## El código leído

| Fuente | Uso en la guía |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | Decisiones fijadas e implementación en el código |
| `contracts/src/CubitToken.sol` | Oferta fija y derecho de quema |
| `contracts/src/CubitHook.sol` | Tasas, banda, muros, cuentas y conexión V2 |
| `contracts/src/libraries/BandLib.sol` | Geometría, precios, ticks y objetivo de los muros |
| `contracts/src/libraries/WallLib.sol` | Muros por tick: financiación y vaciado de los muros atravesados |
| `contracts/src/CubitLens.sol` e interfaces | Precios, banda, muros, saldos, oferta en circulación, CUBIT en manos de los holders y mejor muro |
| `contracts/src/periphery/CubitRouter.sol` | Swaps, límites, autorizaciones y envío de los CUBIT absorbidos |
| `contracts/src/periphery/CubitV2.sol` | Identidad de módulos y sustituciones |
| `contracts/src/periphery/CubitVault.sol` | Bloqueo, recompensa diaria y reserva |
| `contracts/src/periphery/CubitGovernanceVault.sol` | Depósitos bloqueados 30 días y reclamación por el desplegador |
| `contracts/src/periphery/CubitForge.sol` | Launchpad público, aislamiento de hijos y dirección del vault de gobernanza |
| `contracts/src/periphery/CubitLaunch.sol` | Lanzamiento en una transacción: banda, reserva del vault y compra del desplegador |
| `dapp/src/chain` | Descubrimiento, cotizaciones, contexto de firma y Vaults antiguos |
| `dapp/src/pages/Momentum.tsx` | Página Momentum de solo lectura: muros activos, parcialmente consumidos y atravesados |
| `services/` y sus README | Retransmisor de eventos y keeper antiguo |
| `contracts/foundry.toml` y manifiestos de paquetes | Comandos y parámetros de build |

## Informes y documentos históricos

El informe de referencia de la versión antigua es `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`. Describe el ladder, el mantenimiento mediante keepers y la quema de los muros, sustituidos en la nueva versión.

`roadmapdev.md` y los documentos históricos de la especificación sirvieron para entender la intención y los hitos V1/V2. Los textos originales se archivaron en `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`. Los pasajes sobre un muro único monótono, la colocación E/C, el ladder, los keepers o una desaparición total de los derechos administrativos no constituyen la regla de la nueva versión.

`contracts/docs/STRICT_BURN.md` explica la evolución histórica de la quema de los tokens absorbidos, abandonada en la nueva versión. `contracts/docs/MODULE_SETTERS.md` documenta la sustitución de periféricos. Ningún número antiguo de pruebas se presenta aquí como resultado de validación de la nueva versión.

La antigua página roadmap del dapp es una referencia editorial fechada; su contenido no debe utilizarse por sí solo para integrar la nueva versión.

## La dirección artística

El tema adapta las decisiones ya presentes en el dapp:

| Fuente visual | Elementos retomados |
| --- | --- |
| `dapp/src/index.css` | Crema `#f5f1e8`, tinta `#111312`, violeta `#5b4bff`, lima `#c7ff3d`, naranja `#ff704d`, papel `#ede7d8` |
| `dapp/src/index.css` | Títulos Archivo de peso alto y anchura extendida; etiquetas Martian Mono; textura discreta |
| `dapp/src/components/primitives.tsx` | Bordes marcados, sombras desplazadas, paneles y estados |
| `dapp/src/components/Header.tsx` | Logotipo tipográfico, cuadrado violeta, navegación y distinción de estados |
| `dapp/src/ui.tsx` | Motivo estrellado puntual y etiquetas monoespaciadas |

Las fuentes se copian localmente durante el build con sus licencias. La guía retoma el lenguaje gráfico del dapp sin reutilizar sus eslóganes obsoletos.

## La documentación

El motor elegido es **HonKit 6.2.2**, fork del motor GitBook dedicado a crear libros y documentación a partir de Markdown. El índice, la generación estática, la búsqueda y la navegación entre páginas proceden de este framework. El tema CUBIT amplía sus plantillas y estilos. [Documentación oficial de HonKit](https://honkit.netlify.app/).

La instalación local y los comandos `serve` / `build` siguen la [documentación oficial de inicio](https://honkit.netlify.app/setup.html). La [configuración del libro](https://honkit.netlify.app/config.html) precisa, entre otros aspectos, la raíz del contenido y los estilos. La versión 6.2.2 identifica la versión utilizada.

El README en la raíz de `gitbook/` describe la instalación, los comandos, los controles de navegador y los límites de las herramientas. Las validaciones de este sitio verifican el libro; no validan los contratos del protocolo.

## Mantener esta guía

Para una nueva versión, empieza actualizando el estado de las versiones y la referencia normativa. Después sincroniza las reglas, la API y los recorridos realmente conectados. Conserva la mención histórica cuando un resultado antiguo no corresponda a las fuentes finales.

Añade una página en `docs/`, inclúyela en `SUMMARY.md` y reconstruye el libro. Las fuentes de esta documentación se seleccionan explícitamente; las configuraciones privadas, claves, RPC autenticados y volcados de transacciones no forman parte del sitio.
