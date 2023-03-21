CRIAR LIB PARA CONVERTER DE XLSX PARA json

- Ao subir os arquivos dos pedidos, não está sendo registrado no Delyforce o tipo de envio informado na planilha.
- Trocar o simbolo de “Entregador próximo ao destino” para algo parecido com o da essa imagem se possível.
- 24. Adicionar um campo no formulário individual para inseir o número do pedido. Caso o campo não tenha sido preenchido na hora do envio, gerar o número do pedido automáticamente como já é feito.

-25.  Enviar os pedidos criados pelo envio em lote ou individual diretamente para a conta Master do Delyforce.

- botar informações dos usuários para banco de dados.

usuario (user)
  quem faz login,
  quem cria tarefa de um cliente
  tem usuário
  tem senha
  está associado a um ou mais clientes

cliente (client)
  quem nos contratou
  envia para conta de envio x
  rastreio pelas contas de rastreio y

conta de envio (account)
  sao identificadores e configurações de onde estarão as tarefas

conta de rastreio (tracking)
  são as contas onde pode-se rastrear

tarefa
  são pedidos de entrega
