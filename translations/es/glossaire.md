---
description: "Definiciones de los términos de la guía CUBIT: banda, muro, objetivo, reserva de recompensas, tick, hook y claim."
section: "05 / VERIFICAR"
reading: "EL VOCABULARIO DEL PROTOCOLO"
search:
  keywords: ["glosario", "definición", "vocabulario", "términos"]
---

# Glosario

| Término | Definición en CUBIT |
| --- | --- |
| ABI | Descripción de funciones, eventos y tipos que permiten comunicarse con un contrato |
| Compra del desplegador | Compra de 0,1 ETH incluida en la transacción de lanzamiento, gravada con la tasa del 3% y no bloqueada |
| Dirección del equipo | Dirección fija que recibe la parte del equipo de las tasas y puede sustituir en cualquier momento, sin demora, y después activar los módulos del registro; sus poderes son permanentes |
| Autorización | Permiso ERC-20 concedido a una dirección de spender para un importe |
| Banda | Posición única de trading colocada en el lanzamiento con el 80% de la oferta, que cubre todos los precios por encima del precio de lanzamiento y nunca se retira |
| Quema | Destrucción de tokens; la nueva versión ya no quema los CUBIT de los muros, solo el residuo de redondeo del lanzamiento |
| Objetivo | Nivel calculado en cada venta, sobre el precio después de la venta, para colocar un muro: 0,4 × precio actual + 0,6 × precio de lanzamiento; en el precio de lanzamiento o por debajo, el muro se coloca un 1% por debajo del precio actual |
| Claim ERC-6909 | Unidad contable mantenida en el PoolManager para liquidar o conservar activos |
| Reclamación de recompensa | Llamada que solicita una recompensa adquirida; uso distinto del término claim ERC-6909 |
| Curva x·y=k | Curva de producto constante que siguen las compras y las ventas en la banda |
| CUBIT en manos de los holders | Oferta en circulación menos los CUBIT que la banda aún no ha vendido: lo que tienen los holders, incluidos los CUBIT en stake |
| Deadline | Timestamp máximo aceptado para una operación o firma |
| Exact-input | Swap con entrada fija y salida protegida por un mínimo |
| Exact-output | Swap con salida fija y entrada protegida por un máximo |
| FDV de lanzamiento | Capitalización totalmente diluida que fija el precio de lanzamiento; 3,75 ETH elegidos para la nueva versión |
| Comisión LP | Comisión del pool, distinta de las tasas del hook |
| Floor | Nombre histórico usado en el código; leer muros y objetivo por separado |
| Hook | Contrato conectado a las operaciones Uniswap v4, que aplica aquí la mecánica CUBIT; no tiene ningún administrador |
| ETH inactivos | ETH contabilizados fuera de cualquier posición; debe precisarse su compartimento |
| Lens | Contrato de lectura que deriva cifras del hook y del pool |
| Liquidez / profundidad | Activos realmente disponibles en las posiciones, según su estado y el precio |
| Mejor muro | Muro activo más cercano al mercado, el primero que encuentra una venta; el Lens da su precio bruto y su precio neto de comisiones y tasa |
| Muro | Posición LP financiada en ETH por las ventas, en un tick fijo; un solo muro por tick |
| Muro parcialmente consumido | Muro del que una parte de los ETH ha recomprado CUBIT; permanece en su sitio |
| Muro atravesado | Muro totalmente convertido en CUBIT por las ventas; la venta que lo ha atravesado lo vacía en beneficio de la reserva del vault |
| Oferta en circulación | Oferta total menos los CUBIT de los muros, los que esperan su envío y la reserva de recompensas de todos los vaults registrados; los CUBIT en stake siguen en circulación |
| Pending absorbed tokens | CUBIT de los muros atravesados, aislados en el hook hasta su envío mediante `deliverAbsorbed()` |
| Pending floor ETH | Fondos de los muros pendientes de colocación: el 12% de las ventas y los ETH liberados por los muros atravesados, colocados por la misma venta; solo quedan ahí un residuo demasiado pequeño para crear una posición y el caso extremo de un precio en lo más alto del rango de ticks |
| Permissionless | Llamada abierta a todos, sujeta a las condiciones deterministas del contrato |
| PoolId | Identificador derivado del conjunto de la PoolKey |
| Precio de lanzamiento | Precio en ETH por CUBIT fijado en el despliegue: FDV de lanzamiento dividida entre 21 millones |
| Registro V2 | Contrato que conserva los módulos actuales, su revisión, las funciones abiertas y el historial de los vaults |
| Reserva de recompensas | CUBIT que mantiene el vault para pagar a los depositantes: el 20% de la oferta en el lanzamiento y, después, los CUBIT de los muros atravesados |
| Slippage | Desviación de ejecución aceptada respecto a una cotización, acotada por los límites del swap |
| Snapshot | Conjunto coherente de datos leídos en un bloque concreto |
| Tick | Unidad discreta de precio del pool; su orientación es inversa al precio ETH/CUBIT |
| V1 / V2 | Núcleo del mercado / funciones adicionales del roadmap |
| Vault de gobernanza | Vault del launchpad que recibe las comisiones de lanzamiento de la Forge, en ETH, nunca devueltas a quien lanza, y los tokens de los muros de los hijos Forge; cada depósito queda bloqueado 30 días, más la eventual extensión, y, después, solo su desplegador puede reclamar, para siempre y sin posibilidad de transferir este derecho; ese desplegador puede extender el bloqueo, nunca acortarlo |

Para unidades y métodos de contratos, consulta la [integración](developper/integration.md).
