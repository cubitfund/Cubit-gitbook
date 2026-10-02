---
description: "Comandos locales de compilación, pruebas Foundry de la nueva versión, dapp, servicios y GitBook; sin difusión de transacciones."
section: "04 / CONSTRUIR"
reading: "5 MIN DE LECTURA"
---

# Ejecutar el proyecto en local

Los directorios tienen sus propias dependencias. Utiliza los lockfiles del repositorio y mantén alineadas las versiones de contratos, ABI, manifiestos y clientes.

Los siguientes comandos construyen o verifican los componentes localmente. No constituyen un procedimiento de puesta en producción.

## Requisitos previos

El proyecto utiliza Node.js reciente, pnpm para el dapp y los servicios, Foundry para Solidity y npm para este GitBook. Los servicios requieren Node **22 o superior**; el GitBook se preparó con Node 24.

Los contratos fijan **Solidity 0.8.26**, la EVM **Cancun**, compilación **via IR**, optimizador con **10 runs** y sin metadatos CBOR. Estos parámetros forman parte de la identidad de los bytecodes que deben verificarse.

Tras clonar, las dependencias Solidity del repositorio deben estar presentes:

```bash
git submodule update --init --recursive
```

## Compilar y probar los contratos

Desde `contracts/`, en la rama `redesign/tide-lp-autowalls-vault`:

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

La suite histórica `test/` utiliza la antigua API del ladder y no compila con la nueva versión: `FOUNDRY_TEST` limita la compilación a las pruebas de `test/redesign`. La compilación via IR es lenta.

Los perfiles de fuzzing e invariantes de la configuración se aplican a la suite histórica:

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

Un resultado de pruebas debe vincularse a la revisión exacta, los parámetros y las fuentes compiladas; un log antiguo no es un resultado de la nueva versión.

El script `script/Scenarios.s.sol` reproduce escenarios en un nodo local Anvil: `SCENARIO=band` para la banda, `SCENARIO=walls` para los muros y `SCENARIO=crossing` para el gas de los muros atravesados. Sigue las instrucciones del repositorio para el despliegue local, sin copiar ninguna clave en tus notas.

## Iniciar el dapp

Desde `dapp/`:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite muestra la URL de desarrollo. La configuración distingue un modo de simulación y los datos del despliegue configurado. Utiliza los ejemplos e instrucciones del repositorio para configurar un RPC localmente, sin copiar credenciales de acceso en las fuentes ni en el bundle público.

Que el frontend compile no prueba que su manifiesto corresponda al contrato presente en la red. El dapp lee la ABI de la versión en servicio.

## Mantener las ABI

Desde `contracts/`, la exportación sigue a la compilación:

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

El dapp dispone de `pnpm gen-abi` y los servicios de `pnpm gen:abi`. Inspecciona los cambios generados para las interfaces, eventos y tipos afectados. La vista `band()`, los campos `bandEth` y `bandTokens`, las vistas de los muros, `deliverAbsorbed()`, `pendingAbsorbedTokens()` y los dos vaults deben incluirse en la sincronización de la versión.

El comando `pnpm sync-deployment` del dapp vuelve a leer un manifiesto de despliegue: solo debe ejecutarse con los metadatos de la versión realmente verificada.

## Verificar los servicios

Desde `services/`:

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

El servicio keeper pertenece al modelo antiguo y ya no tiene uso en la nueva versión. La operación del retransmisor de eventos tiene su [página dedicada](services.md).

## Iniciar este GitBook

Desde `gitbook/`:

```bash
npm ci
npm run dev
```

El sitio se sirve en `http://localhost:4000` con reconstrucción de páginas. Para producir el directorio estático `_book/` y verificar los enlaces:

```bash
npm run build
npm run preview
```

La previsualización local utiliza `http://localhost:4001`. Las fuentes están incluidas; la búsqueda se ejecuta en el navegador sobre el índice del libro.

Para verificar los recorridos de navegador de la documentación:

```bash
npm run test:install
npm run test:browser
```

El [README de `gitbook/`](../sources.md#la-documentation) describe la elección de HonKit, la estructura, los controles y el mantenimiento editorial.

<p class="source-note">Fuentes: <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, scripts del repositorio, <code>dapp/package.json</code>, <code>services/package.json</code> y <code>gitbook/package.json</code>. El build de esta documentación no requiere claves ni URL RPC autenticadas.</p>
