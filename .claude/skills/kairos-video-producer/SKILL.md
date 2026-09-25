---
name: kairos-video-producer
description: Produz vídeos da Kairos Digital (trailers, episódios, anúncios) no Higgsfield via MCP com personagens consistentes, fala nativa e gancho otimizado por métrica. Use sempre que Matheus pedir vídeo, trailer, episódio, reels, anúncio, cena com os fundadores ou com o elenco de IA (KAIROS, ORION, Hunter AI etc.), ou quiser melhorar gancho/viralidade de um vídeo.
---

# Kairos Video Producer

Playbook construído a partir de erros e medições reais (EP00, set/2026). Regras marcadas com **[medido]** vieram do Predict Virality; não troque por opinião.

## Regras inegociáveis (vieram de dinheiro perdido)

1. **Custo antes de tudo.** Sempre `generate_video` com `get_cost: true` e `balance` antes de gerar. Só dispara se o saldo cobre o vídeo INTEIRO. Nunca entrega vídeo pela metade.
2. **Roteiro aprovado antes de gastar.** Mostrar tabela tempo / cena / quem aparece / fala e esperar "aprovado".
3. **Vídeo completo numa geração**, nunca cenas soltas de 5s: `seedance_2_5` aceita 4–30s por geração.
4. **Fala está no prompt.** Seedance 2.5 tem áudio nativo com lip sync, mas só gera fala se o prompt disser QUEM fala O QUÊ, entre aspas, em português do Brasil. Prompt só visual = vídeo mudo com som ambiente (erro do EP00 v1).
5. **Todo personagem pedido aparece em cena**, com referência de imagem. Nada de "o modelo se vira".
6. **Nunca nomes reais de clientes.** O robô do WhatsApp se chama **Kairos**.
7. **Texto na tela sai torto** (valores, números). Mantenha só palavras curtas e grandes; números corrija na edição.
8. Preset sugerido pelo Higgsfield (`preset_recommendation`) não é gerado: reenviar com `declined_preset_id` quando o roteiro já foi aprovado.

## Pipeline

1. `balance` → saber créditos.
2. Roteiro (tabela) → aprovação.
3. Montar `medias` com `role: image_references` (até 9 imagens) — ver IDs abaixo.
4. `get_cost` com a config final → confirmar que cabe.
5. Gerar: `model: seedance_2_5`, `mode: omni_reference`, `duration` 30, `generate_audio: true`, `aspect_ratio` 16:9 (ou 9:16 para Reels/TikTok).
6. `jobs_wait` (30s de vídeo ≈ 10–15 min; se demorar, agendar check-in em vez de poll infinito).
7. Baixar, extrair frames (ffmpeg-static via npm), revisar quem apareceu e o que saiu torto.
8. **Loop de gancho** (grátis, seção abaixo) → entregar a versão com maior nota geral.

## Custos medidos (seedance_2_5, com áudio)

| Config | Créditos |
|---|---|
| 30s 480p | 90 |
| 30s 720p | 210 |
| 15s 480p | 45 |
| Kling 3.0 15s std com som | 30 |

API (cloud.higgsfield.ai, carteira em USD, separada do site): 5s 720p image-to-video com áudio = **$1,62**.
Plus: $49/mês = 1.000 créditos. Predict Virality = **grátis** (limite: vídeo ≤ 16s, 2 jobs simultâneos).

## Loop de gancho e métricas (Predict Virality)

1. Cortar os primeiros 15s: `ffmpeg -i in.mp4 -t 15 -c:v libx264 -c:a aac out15.mp4`.
2. `media_upload` → `curl -X PUT` → `media_confirm` (type video).
3. `virality_predictor` action create → `jobs_wait` → baixar o HTML do `result_url` e ler o JSON `"scores"` e `"global_scores_by_frame"` (nota por segundo).
4. Gerar 2–3 variações de abertura por edição, medir todas, manter a de maior `overall_score`.

### O que o modelo premia [medido — EP00 v3, 7 variações]

| Abertura (0–3s) | Geral | Gancho |
|---|---|---|
| Quarto escuro, homem dormindo (original) | 44 | 26 |
| Cold open: cliente reagindo no escritório escuro | **39** | **18** |
| Corte sem o quarto, abre no túnel de luz | 41 | 28 |
| KAIROS batendo no console + cor | 45 | 28 |
| Cortes rápidos dos agentes + cor | 46 | **33** |
| Feixe dourado + console do QG | 46 | 31 |
| **Feixe dourado + console + cor (+30% sat, +12% contraste)** | **47** | 32 |

Conclusões:
- **Imagem escura/pouca luz derruba o gancho**, mesmo com emoção forte (cold open com o cliente piorou 44→39).
- **Abrir no frame mais vibrante** (neon, luz dourada, movimento de energia) é o que mais sobe gancho e engajamento.
- Reforço de cor (`eq=saturation=1.3:contrast=1.12:brightness=0.04`) soma +1 geral, de graça.
- Cortes muito rápidos sobem o gancho mas derrubam a retenção (sustain 99→91).
- Só editando, o teto foi ~47. Para passar disso, o gancho precisa nascer no roteiro (próxima seção).

### Regra de roteiro para próximos vídeos
- **0–3s: o momento mais luminoso e cinético do vídeo** (feixe dourado, QG neon, ampulheta brilhando), com um personagem já em cena e uma fala curta de impacto. Nunca abrir em ambiente escuro/estático.
- Cenas escuras (quarto, escritório à noite) só depois dos 3s e com fonte de luz forte no quadro (tela do celular, neon).
- Payoff visual (venda fechando) repetido no fim para manter retenção.
- Estrutura narrativa que funcionou: estilo "Divertidamente" — agentes operando um Quartel-General dentro do celular enquanto o dono dorme; fundadores como criadores observando pelo vidro.

## Assets no Higgsfield (workspace privado 937d13ee-84bc-432f-a24b-45803a0b7cce)

Referências para `medias` (`role: image_references`):

| Quem | media_id |
|---|---|
| Matheus — ficha de rosto | 5cfe6a6e-aa25-426b-a753-e56b106fb3e0 |
| Matheus — corpo inteiro 4 ângulos (look EP00) | 99bdaf8d-60f8-4178-bda0-45aad672301e |
| Vilson — estúdio | 6a55cb4d-f682-489f-9975-ccecc2ecee4a |
| ORION + KAIROS (press kit) | 7985d8ba-9e65-4246-8b9b-61eb6c565bc3 |
| Hunter AI + Money Hunter (press kit) | 1356dfe9-4fa3-45b1-aadb-d5e8fa236876 |
| Instagram AI + QA AI (press kit) | 40ef3ed9-ff80-4a5e-88b3-83161696bc60 |
| CPO + CFO (press kit) | a805a8a8-9670-46fa-a729-4063e7123680 |
| Cliente-empresário (fictício) | a4bd7565-fe43-4fb4-b3da-d461a5f33596 |
| Painel holográfico Kairos | 8744e5f6-f578-43c1-833a-b6a7eb9093bf |
| Cenário caos SP | 04486fb6-d3cd-4f67-8460-2b4199fab53e |
| Logo reveal Kairos Digital | 166027f7-73da-4125-a17a-adc00314543d |

Elements (para Kling 3.0 / Seedance 2.0 via `<<<element_id>>>` no prompt): Matheus d133eef4-16a4-4e32-ab46-641c6fc1ae49, Vilson b6dea443-8e94-4266-98a3-bd1b008f5ea5, Kairos-Avatar 6387b364-ca1d-4467-abe2-6f0d449be9e8, ORION db9ee592-6fdd-4e8f-b1b2-826279bbf1b7, Instagram-AI bc6c4af3-af75-4d1a-bc08-bac2e2d952e6, Hunter-AI 09c37782-202c-4026-9f1a-61a41284bdaf, CFO ade29ee6-b0f6-49e2-b7d5-e603a23b1d61, Money-Hunter 55b83850-afee-49fe-aeef-42ff6ba47e28, QA-AI 701f6a74-2a42-4739-808b-9fd7f365b63c, CPO 425d0af3-8fea-48bd-9e5c-f3c0ffe5c2ae.

No prompt, descrever cada referência pela ordem ("Image 1 = MATHEUS: ...") com traços físicos. Nota: ORION saiu só como ampulheta gigante no EP00 — descrevê-lo explicitamente como "humanoide de cristal em pé, em primeiro plano" se ele precisar aparecer.

## Prompt — esqueleto que funcionou

```
30-second cinematic brand trailer, photoreal premium film look, multi-shot with motivated camera moves.
Palette: deep navy/black + #00b4ff, #7b2fff, #e040fb, #00e5a0.
Keep every identity exactly as in the references. Image 1 = ... Image 9 = ...
ALL spoken dialogue in Brazilian Portuguese with native lip sync, clear distinct voices.
Sound design: ... score building to a bass hit on the logo. No subtitles.
SHOT 1 (0-3s) [momento mais vibrante + fala de impacto] ...
SHOT 2 (3-8s) ... [plano, movimento de câmera, quem fala, voz, "fala exata"]
...
SHOT N (26-30s) logo reveal from Image 9. Narrator: "Kairos Digital. O tempo certo é agora."
Style: photoreal, cinematic lighting, shallow depth of field, subtle film grain.
```
Para cada fala: personagem + tipo de voz ("deep gravelly voice", "smooth confident female voice") + frase exata entre aspas.
