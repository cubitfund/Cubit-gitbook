---
description: "As identidades fixas do núcleo, a ausência de administrador do hook e os poderes permanentes do endereço da equipe sobre os módulos do registro."
section: "05 / VERIFICAR"
reading: "5 MIN DE LEITURA"
search:
  keywords: ["permissões", "equipe", "setters", "substituição", "administrador", "authority", "admin", "governança"]
---

# Permissões e substituições

CUBIT distingue um núcleo de identidades fixas, sem administrador, e um endereço da equipe que administra os módulos periféricos. **Os poderes do endereço da equipe são permanentes.**

## O que permanece fixo

O token, o hook principal, o PoolManager, o poolId e a âncora do registro não são substituídos pelos setters periféricos.

O token autoriza seu hook por uma conexão única. As taxas do núcleo, a FDV de lançamento e a geometria da faixa não têm setter, e a faixa nunca é retirada depois de colocada. Uma nova política que modifica o núcleo exige nova versão, validação e implantação; ela não atualiza automaticamente um pool antigo.

## Nenhum administrador do hook

O hook não tem **nenhum administrador**, e ninguém pode pausar os swaps nem o mecanismo dos muros.

Nenhum endereço pode, portanto, suspender uma venda ou a colocação de um muro. As regras do hook se aplicam tal como foram implantadas.

## O papel da equipe

O endereço da equipe, `TEAM_ADDRESS`, é fixado no hook e serve de `authority()` para o registro `CubitV2`. Seus poderes são permanentes: ele recebe a parcela da equipe nas taxas, 3% na compra e 3% na venda, e substitui e, em seguida, ativa os módulos do registro. Ele pode substituir o Vault, o roteador, o Lens ou a Forge **a qualquer momento e imediatamente**, sem prazo de aviso. Os quatro endereços substituíveis são:

| Setter | Principais verificações de conexão | Consequência |
| --- | --- | --- |
| `setVault(next)` | Código presente, mesmo hook e mesmo token, Vault novo sem stake | Novo contrato de referência para depósitos futuros e para os CUBIT absorvidos enviados depois |
| `setRouter(next)` | Código presente, mesmo hook/PoolManager/poolId | Roteador atual substituído: o que a dapp usa |
| `setLens(next)` | Código presente, mesmo hook/PoolManager/poolId/token | Contrato de leitura atual substituído |
| `setForge(next)` | Código presente, mesmo hook, vault de governança com código | Launchpad de referência, ausente no lançamento, registrado ou substituído para lançamentos futuros, com o vault de governança que recebe suas taxas |

Cada alteração emite `ModuleUpdated`, incrementa `moduleRevision` e fecha a funcionalidade correspondente até que a equipe a reabra: substituir o Vault, o Lens ou a Forge fecha, respectivamente, o Vault, Momentum ou a Forge; substituir o roteador não fecha nenhuma funcionalidade. Verifique o novo endereço e seu código antes de uma operação.

## O alcance de uma substituição

Uma substituição produz efeito já na sua transação. Ela permite escolher:

- para onde vão os CUBIT absorvidos pelos muros do CUBIT nos envios seguintes: o hook os entrega ao Vault registrado;
- para onde vão as futuras taxas de lançamento: a Forge registrada as paga ao seu próprio vault de governança;
- qual roteador a dapp usa.

Ela não afeta:

- o núcleo: token, hook, faixa, muros e taxas;
- os saldos já presentes nos vaults existentes, principal e reserva de recompensas.

A equipe protege a chave privada desse endereço.

## Os limites das verificações de compatibilidade

Getters que declaram os endereços corretos demonstram uma conexão esperada, não a segurança de todo código candidato. Eles não provam a ausência de proxy ou comportamento malicioso em uma implementação futura.

A equipe, portanto, escolhe o código periférico usado para operações futuras. Essa capacidade exige verificar cada substituição, seu bytecode e suas interações.

## Os fundos já depositados

Uma substituição de Vault não transfere os CUBIT depositados nem a reserva de recompensas do contrato antigo. Suas posições, seus prazos e suas saídas continuam nesse Vault antigo. O registro mantém a lista de Vaults e o frontend deve continuar expondo essas posições.

Um roteador antigo continua utilizável para swaps e continua sujeito às taxas do hook; uma aprovação concedida ao roteador antigo não vale para o novo.

Substituir Forge afeta os lançamentos futuros; os filhos já criados mantêm seus contratos e o vault de governança da Forge que os lançou.

Esses setters não corrigem retroativamente um contrato defeituoso nem movem os fundos que ele possa manter. A possibilidade de chamar uma saída on-chain e sua disponibilidade no frontend devem ser verificadas separadamente.

## O vault de governança do launchpad

O vault de governança não tem administrador nem saída antecipada. Ele recebe as taxas de lançamento em ETH e os tokens absorvidos pelos muros dos filhos: cada depósito fica bloqueado ali por 30 dias a partir de seu recebimento e, depois, **somente seu deployer** pode resgatá-lo. Esse direito vale para sempre e nenhuma função permite transferi-lo: é uma confiança explícita nessa conta. Esse deployer pode estender o bloqueio de todo o vault, depósitos presentes e futuros, quando quiser; nenhuma função o encurta.

## Aprovações e assinaturas

Uma aprovação está vinculada a um **spender específico**. Ela não acompanha o endereço atual do registro. O frontend deve revalidar a operação quando a revisão ou os módulos mudarem, especialmente entre uma aprovação e um swap.

Cada ação do protocolo é uma transação: verifique o endereço de destino e a cadeia antes de assiná-la.

<p class="source-note">Fontes: <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> e as verificações de frontend <code>releases.ts</code> / <code>vault.ts</code>.</p>
