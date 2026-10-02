---
description: "Comandos locais de compilação, testes Foundry da nova versão, dapp, serviços e GitBook; sem transmissão de transações."
section: "04 / CONSTRUIR"
reading: "5 MIN DE LEITURA"
---

# Executar o projeto localmente

Os diretórios têm suas próprias dependências. Use os lockfiles do repositório e mantenha alinhadas as versões dos contratos, ABI, manifestos e clientes.

Os comandos a seguir constroem ou verificam os componentes localmente. Eles não constituem um procedimento de implantação em produção.

## Pré-requisitos

O projeto usa Node.js recente, pnpm para o dapp e os serviços, Foundry para Solidity e npm para este GitBook. Os serviços exigem Node **22 ou superior**; o GitBook foi preparado com Node 24.

Os contratos fixam **Solidity 0.8.26**, a EVM **Cancun**, compilação **via IR**, otimizador com **10 runs**, sem metadados CBOR. Esses parâmetros fazem parte da identidade dos bytecodes a verificar.

Após clonar, as dependências Solidity do repositório devem estar presentes:

```bash
git submodule update --init --recursive
```

## Compilar e testar os contratos

Em `contracts/`, na branch `redesign/tide-lp-autowalls-vault`:

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

A suíte histórica `test/` usa a API antiga do ladder e não compila com a nova versão: `FOUNDRY_TEST` limita a compilação aos testes de `test/redesign`. A compilação via IR é lenta.

Os perfis de fuzzing e de invariantes da configuração se referem à suíte histórica:

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

Um resultado de testes deve ser vinculado à revisão exata, aos parâmetros e às fontes compiladas; um log antigo não é um resultado da nova versão.

O script `script/Scenarios.s.sol` reproduz cenários em um nó local Anvil: `SCENARIO=band` para a faixa, `SCENARIO=walls` para os muros e `SCENARIO=crossing` para o gas dos muros atravessados. Siga as instruções do repositório para a implantação local, sem copiar nenhuma chave para suas anotações.

## Iniciar o dapp

Em `dapp/`:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite exibe a URL de desenvolvimento. A configuração distingue um modo de simulação dos dados da implantação configurada. Use os exemplos e instruções do repositório para configurar um RPC localmente, sem copiar credenciais de acesso para as fontes ou o bundle público.

O fato de o frontend compilar não prova que seu manifesto corresponde ao contrato presente na rede. O dapp lê a ABI da versão em serviço.

## Manter as ABI

Em `contracts/`, a exportação vem após a compilação:

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

O dapp possui `pnpm gen-abi` e os serviços, `pnpm gen:abi`. Inspecione as alterações geradas para as interfaces, eventos e tipos envolvidos. A visualização `band()`, os campos `bandEth` e `bandTokens`, as visualizações dos muros, `deliverAbsorbed()`, `pendingAbsorbedTokens()` e os dois vaults devem ser incluídos na sincronização do lançamento.

O comando `pnpm sync-deployment` do dapp relê um manifesto de implantação: ele só deve ser executado com os metadados da versão realmente verificada.

## Verificar os serviços

Em `services/`:

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

O serviço keeper pertence ao modelo antigo e não tem mais uso na nova versão. A operação do retransmissor de eventos tem sua [página dedicada](services.md).

## Iniciar este GitBook

Em `gitbook/`:

```bash
npm ci
npm run dev
```

O site é servido em `http://localhost:4000` com reconstrução das páginas. Para gerar o diretório estático `_book/` e verificar os links:

```bash
npm run build
npm run preview
```

A prévia local usa `http://localhost:4001`. As fontes estão incluídas; a busca é executada no navegador sobre o índice do livro.

Para verificar os percursos de navegador da documentação:

```bash
npm run test:install
npm run test:browser
```

O [README de `gitbook/`](../sources.md#la-documentation) descreve a escolha do HonKit, a estrutura de diretórios, as verificações e a manutenção editorial.

<p class="source-note">Fontes: <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, scripts do repositório, <code>dapp/package.json</code>, <code>services/package.json</code> e <code>gitbook/package.json</code>. Nenhuma chave ou URL RPC autenticada é necessária para o build desta documentação.</p>
