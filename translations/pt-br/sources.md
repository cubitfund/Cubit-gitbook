---
description: "Escopo das leituras, hierarquia dos documentos, fontes da direção de arte e método de manutenção do GitBook."
section: "05 / VERIFICAR"
reading: "REFERÊNCIAS DO GUIA"
search:
  keywords: ["fontes", "referências", "documentação", "HonKit", "especificação", "versão", "redesign"]
---

# Fontes e método

Este guia foi redigido a partir da base de código local e das decisões de design fixadas em **14 de setembro de 2026**. Os arquivos citados abaixo são caminhos do repositório, não endpoints de rede.

A nova versão é descrita com base na branch `redesign/tide-lp-autowalls-vault`. As referências históricas de código designam a revisão `991fca9` do protocolo, preservada na branch `work/v1-v2-fixed-walls`. A documentação publicada não constitui validação dos contratos descritos.

## Ordem de leitura

A referência da nova versão é **`contracts/docs/REDESIGN_HANDOFF.md`**. Esse documento registra as decisões de design e sua implementação no código; ele prevalece sobre os documentos anteriores.

As taxas não mudam: **3% na compra para a equipe** e **15% na venda: 12% para os muros e 3% para a equipe**. A liquidez de negociação é uma faixa única, os muros são colocados e esvaziados a cada venda e a FDV de lançamento adotada é de **3,75 ETH**.

O documento **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** expressava a base de lançamento em **7 000 USD de FDV** sobre 21 milhões de tokens. A nova versão fixa a FDV diretamente em ETH; este guia não estabelece correspondência entre essas duas referências.

Para saber o que realmente funciona, é preciso, em seguida, relacionar o código, os resultados de validação e a implantação de uma mesma versão.

Um comentário de código não substitui uma decisão confirmada. Inversamente, uma decisão não prova que uma implementação ou uma rede a execute.

## O código lido

| Fonte | Uso no guia |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | Decisões fixadas e implementação no código |
| `contracts/src/CubitToken.sol` | Oferta fixa e direito de queima |
| `contracts/src/CubitHook.sol` | Taxas, faixa, muros, contas e conexão V2 |
| `contracts/src/libraries/BandLib.sol` | Geometria, preços, ticks e alvo dos muros |
| `contracts/src/libraries/WallLib.sol` | Muros por tick: financiamento e esvaziamento dos muros atravessados |
| `contracts/src/CubitLens.sol` e interfaces | Preços, faixa, muros, saldos, oferta em circulação, CUBIT em mãos dos holders e melhor muro |
| `contracts/src/periphery/CubitRouter.sol` | Swaps, limites, aprovações e envio dos CUBIT absorvidos |
| `contracts/src/periphery/CubitV2.sol` | Identidade dos módulos e substituições |
| `contracts/src/periphery/CubitVault.sol` | Bloqueio, recompensa diária e reserva |
| `contracts/src/periphery/CubitGovernanceVault.sol` | Depósitos bloqueados por 30 dias e resgate pelo deployer |
| `contracts/src/periphery/CubitForge.sol` | Launchpad público, isolamento dos filhos e endereço do vault de governança |
| `contracts/src/periphery/CubitLaunch.sol` | Lançamento em uma transação: faixa, reserva do vault e compra do deployer |
| `dapp/src/chain` | Descoberta, cotações, contexto de assinatura e Vaults antigos |
| `dapp/src/pages/Momentum.tsx` | Página Momentum somente leitura: muros ativos, parcialmente consumidos e atravessados |
| `services/` e seus README | Retransmissor de eventos e antigo keeper |
| `contracts/foundry.toml` e manifestos de pacotes | Comandos e parâmetros de build |

## Relatórios e documentos históricos

O relatório de referência da versão antiga é `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`. Ele descreve o ladder, a manutenção por keepers e a queima dos muros, substituídos na nova versão.

`roadmapdev.md` e os documentos históricos da especificação serviram para compreender a intenção e os marcos V1/V2. Os textos originais foram arquivados em `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`. Trechos sobre um muro único monotônico, a alocação E/C, o ladder, os keepers ou o desaparecimento total dos direitos administrativos não constituem a regra da nova versão.

`contracts/docs/STRICT_BURN.md` explica a evolução histórica da queima dos tokens absorvidos, abandonada na nova versão. `contracts/docs/MODULE_SETTERS.md` documenta a substituição dos periféricos. Nenhum número antigo de testes é apresentado aqui como resultado de validação da nova versão.

A antiga página de roadmap do dapp é uma referência editorial datada; seu conteúdo não deve ser usado sozinho para integrar a nova versão.

## A direção de arte

O tema adapta as decisões já presentes no dapp:

| Fonte visual | Elementos reutilizados |
| --- | --- |
| `dapp/src/index.css` | Creme `#f5f1e8`, tinta `#111312`, roxo `#5b4bff`, lima `#c7ff3d`, laranja `#ff704d`, papel `#ede7d8` |
| `dapp/src/index.css` | Títulos Archivo com peso forte e largura estendida; rótulos Martian Mono; textura discreta |
| `dapp/src/components/primitives.tsx` | Bordas marcadas, sombras deslocadas, painéis e estados |
| `dapp/src/components/Header.tsx` | Logotipo tipográfico, quadrado roxo, navegação e distinção de estados |
| `dapp/src/ui.tsx` | Motivo de estrela pontual e rótulos monoespaçados |

As fontes são copiadas localmente no build com suas licenças. O guia retoma a linguagem gráfica do dapp, sem reutilizar slogans que se tornaram obsoletos.

## A documentação

O mecanismo escolhido é **HonKit 6.2.2**, fork do mecanismo GitBook dedicado à criação de livros e documentação a partir de Markdown. O sumário, a geração estática, a busca e a navegação entre páginas vêm desse framework. O tema CUBIT estende seus templates e estilos. [Documentação oficial do HonKit](https://honkit.netlify.app/).

A instalação local e os comandos `serve` / `build` seguem a [documentação oficial de início](https://honkit.netlify.app/setup.html). A [configuração do livro](https://honkit.netlify.app/config.html) especifica, entre outros pontos, a raiz dos conteúdos e os estilos. A versão 6.2.2 identifica a versão utilizada.

O README na raiz de `gitbook/` descreve a instalação, os comandos, as verificações de navegador e os limites das ferramentas. As validações deste site verificam o livro; não validam os contratos do protocolo.

## Manter este guia

Para um novo lançamento, comece atualizando o estado das versões e a referência normativa. Depois sincronize as regras, a API e os percursos realmente conectados. Preserve a indicação de histórico quando um resultado antigo não se referir às fontes finais.

Acrescente uma página em `docs/`, referencie-a em `SUMMARY.md` e reconstrua o livro. As fontes desta documentação são selecionadas explicitamente; configurações privadas, chaves, RPC autenticados e dumps de transações não fazem parte do site.
