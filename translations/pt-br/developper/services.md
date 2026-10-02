---
description: "Operar o retransmissor de eventos: dry-run, cursores, revisões dos módulos e vocabulário dos muros; o keeper não tem mais uso."
section: "04 / CONSTRUIR"
reading: "4 MIN DE LEITURA"
---

# Serviços e operação

O repositório contém dois processos Node: um **keeper**, que pertence ao modelo antigo, e um **retransmissor de eventos** que pode preparar publicações. Uma configuração local não prova que um serviço funciona continuamente.

## Sem keeper na nova versão

O antigo keeper chamava `rebalance`, `raiseFloor` e a queima dos tokens absorvidos. Essas funções de manutenção desapareceram: a faixa nunca é reorganizada, os muros são colocados e esvaziados durante as vendas, e o roteador CUBIT envia os CUBIT absorvidos para o vault.

O serviço `services/keeper` continua no repositório, mas não tem mais razão de ser e não deve ser operado contra a nova versão. Nenhum bônus é pago: se CUBIT absorvidos continuarem pendentes, por exemplo após uma venda feita por outro roteador, qualquer conta pode chamar `deliverAbsorbed()`.

## O retransmissor de eventos

`services/floor-bot` lê os eventos, prepara um texto e mantém um cursor, bem como as chaves de deduplicação `transactionHash:logIndex`.

O modo dry-run e o modo de publicação têm estados separados. Os cursores incluem o contexto de cadeia e hook; blocos finalizados são usados nas redes previstas pelo serviço. Uma reorganização ou um checkpoint inconsistente deve ser conciliado antes da retomada.

O retransmissor persiste um `pendingPost` antes da publicação. Se o serviço externo aceitar a mensagem, mas o processo parar antes de registrar o sucesso, é preciso verificar se a mensagem existe antes de reenviar: um banco local e uma rede social não podem confirmar uma operação juntos.

O GitBook não executa nenhuma publicação. Colocar o retransmissor em funcionamento real depende de configuração e autorização operacionais separadas.

## Evolução dos módulos

O Lens atual é resolvido pelo registro. Mantenha a identidade do núcleo e o contexto de revisão durante toda a operação.

Os serviços leem as ABI e os eventos da versão descrita. Um retransmissor adaptado ao modelo antigo não deve ser apresentado como validado para a nova versão sem seus testes de aceitação.

## Adaptar o vocabulário aos muros

O retransmissor antigo anunciava eventos `FloorRaised`, que não existem mais. Na nova versão, um muro pode ser criado ou aprofundado a cada venda (`WallFunded`), às vezes em um preço inferior ao do muro anterior, e um muro totalmente atravessado é esvaziado (`WallAbsorbed`) antes que seus CUBIT sigam para a reserva do vault (`AbsorbedDelivered`).

O retransmissor deve, portanto, citar o **muro envolvido, seu nível e os fundos acrescentados ou absorvidos**, sem deduzir uma alta global a partir do nome de um evento. Mensagens antigas como “o floor sempre sobe” não descrevem essa política, e nenhum anúncio deve apresentar os muros como garantia de preço.

## Verificações operacionais úteis

Acompanhe os erros RPC, as diferenças de configuração, os cursores, a idade do último bloco processado e as publicações pendentes. Guarde os registros de recuperação e as identidades de versão, sem dados privados de assinatura.

Uma supervisão que reinicia processos não substitui a resolução de um checkpoint inconsistente ou de uma mudança de registro.

<p class="source-note">Fontes: <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> e <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
