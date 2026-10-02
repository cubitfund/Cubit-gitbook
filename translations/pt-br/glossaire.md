---
description: "Definições dos termos do guia CUBIT: faixa, muro, alvo, reserva de recompensas, tick, hook e claim."
section: "05 / VERIFICAR"
reading: "O VOCABULÁRIO DO PROTOCOLO"
search:
  keywords: ["glossário", "definição", "vocabulário", "termos"]
---

# Glossário

| Termo | Definição no CUBIT |
| --- | --- |
| ABI | Descrição de funções, eventos e tipos que permitem comunicar com um contrato |
| Compra do deployer | Compra de 0,1 ETH incluída na transação de lançamento, taxada em 3% e não bloqueada |
| Endereço da equipe | Endereço fixo que recebe a parcela da equipe nas taxas e pode substituir a qualquer momento, sem prazo de espera, e depois ativar os módulos do registro; seus poderes são permanentes |
| Aprovação | Autorização ERC-20 concedida a um endereço de spender para um valor |
| Faixa | Posição única de negociação colocada no lançamento com 80% da oferta, que cobre todos os preços acima do preço de lançamento e nunca é retirada |
| Queima | Destruição de tokens; a nova versão não queima mais os CUBIT dos muros, apenas a poeira de arredondamento do lançamento |
| Alvo | Nível calculado a cada venda, sobre o preço após a venda, para colocar um muro: 0,4 × preço atual + 0,6 × preço de lançamento; no preço de lançamento ou abaixo dele, o muro é colocado 1% abaixo do preço atual |
| Claim ERC-6909 | Unidade contábil mantida no PoolManager para liquidar ou conservar ativos |
| Resgate de recompensa | Chamada que resgata uma recompensa acumulada; uso distinto do termo claim ERC-6909 |
| Curva x·y=k | Curva de produto constante seguida pelas compras e vendas na faixa |
| CUBIT em mãos dos holders | Oferta em circulação menos os CUBIT que a faixa ainda não vendeu: o que os holders têm, incluindo os CUBIT em stake |
| Deadline | Timestamp máximo aceito para uma operação ou assinatura |
| Exact-input | Swap com entrada fixa e saída protegida por um mínimo |
| Exact-output | Swap com saída fixa e entrada protegida por um máximo |
| FDV de lançamento | Capitalização totalmente diluída que fixa o preço de lançamento; 3,75 ETH adotados para a nova versão |
| Taxa LP | Comissão do pool, distinta das taxas do hook |
| Floor | Nome histórico usado no código; leia os muros e o alvo separadamente |
| Hook | Contrato conectado às operações Uniswap v4, que aplica aqui a mecânica CUBIT; ele não tem nenhum administrador |
| ETH ocioso | ETH contabilizado fora de qualquer posição; seu compartimento deve ser especificado |
| Lens | Contrato de leitura que deriva números do hook e do pool |
| Liquidez / profundidade | Ativos realmente disponíveis nas posições, conforme seu estado e o preço |
| Melhor muro | Muro ativo mais próximo do mercado, o primeiro que uma venda encontra; o Lens informa seu preço bruto e seu preço líquido de taxas e imposto |
| Muro | Posição LP financiada em ETH pelas vendas, em um tick fixo; um único muro por tick |
| Muro parcialmente consumido | Muro em que parte dos ETH recomprou CUBIT; ele permanece no lugar |
| Muro atravessado | Muro totalmente convertido em CUBIT pelas vendas; a venda que o atravessou o esvazia em favor da reserva do vault |
| Oferta em circulação | Oferta total menos os CUBIT dos muros, os que aguardam envio e a reserva de recompensas de todos os vaults registrados; os CUBIT em stake continuam em circulação |
| Pending absorbed tokens | CUBIT dos muros atravessados, isolados no hook até seu envio por `deliverAbsorbed()` |
| Pending floor ETH | Fundos dos muros aguardando alocação: 12% das vendas e ETH liberados pelos muros atravessados, alocados pela mesma venda; ali permanecem apenas uma poeira pequena demais para criar uma posição e o caso extremo de um preço no topo do intervalo de ticks |
| Permissionless | Chamada aberta a todos, sujeita às condições determinísticas do contrato |
| PoolId | Identificador derivado de toda a PoolKey |
| Preço de lançamento | Preço em ETH por CUBIT fixado na implantação: FDV de lançamento dividida por 21 milhões |
| Registro V2 | Contrato que mantém os módulos atuais, sua revisão, as funcionalidades abertas e o histórico dos vaults |
| Reserva de recompensas | CUBIT mantidos pelo vault para pagar os depositantes: 20% da oferta no lançamento e, depois, os CUBIT dos muros atravessados |
| Slippage | Diferença de execução aceita em relação a uma cotação, delimitada pelos limites do swap |
| Snapshot | Conjunto coerente de dados lidos em um bloco específico |
| Tick | Unidade discreta de preço do pool; sua orientação é invertida em relação ao preço ETH/CUBIT |
| V1 / V2 | Núcleo do mercado / funcionalidades adicionais do roadmap |
| Vault de governança | Vault do launchpad que recebe as taxas de lançamento da Forge, em ETH, nunca devolvidas a quem lança, e os tokens dos muros dos filhos Forge; cada depósito fica bloqueado por 30 dias, mais a eventual extensão, e, depois, somente seu deployer pode resgatar, para sempre e sem possibilidade de transferir esse direito; esse deployer pode estender o bloqueio, nunca encurtá-lo |

Para as unidades e os métodos dos contratos, veja a [integração](developper/integration.md).
