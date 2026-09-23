# Commercial Runtime v0.1

O runtime comercial transforma conectores em ciclos autônomos sem confundir tentativa com resultado. Cada execução tem canal, etapa e estado: `ready`, `running`, `paused_auth`, `paused_policy`, `failed` ou `completed`.

Uma pausa de autenticação isola apenas aquele canal. A conclusão de envio exige `remoteId` retornado pela plataforma; sem ele, não existe proposta enviada no registro do Kairos. O módulo não realiza chamadas externas sozinho nesta fase. Os próximos adaptadores oficiais devem usá-lo para descoberta, qualificação, rascunho, envio e acompanhamento.
