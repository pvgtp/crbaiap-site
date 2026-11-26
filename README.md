# crbaiap-site

Site institucional da Convenção Regional Baixo Amazonas da Igreja Adventista da Promessa, publicado em https://crbaiap.org pelo GitHub Pages.

Site estático: HTML, CSS e um JavaScript. Não tem etapa de build. Cada commit na branch `main` é publicado automaticamente.

## Como atualizar o conteúdo

Quase tudo que muda com o tempo fica na pasta `dados/`, em arquivos `.json`. Dá para editar direto pelo site do GitHub (ícone do lápis) e salvar com um commit. Em poucos minutos a alteração aparece no ar.

Regras do JSON: textos entre aspas duplas, itens separados por vírgula e sem vírgula depois do último item. Campos que você não tiver podem ficar vazios (`""`) ou ser omitidos; o site só mostra o que estiver preenchido.

### `dados/site.json` — contatos (rodapé e página Contato)

```json
{
  "email": "contato@crbaiap.org",
  "whatsapp": "(93) 99999-9999",
  "instagram": "@usuario",
  "facebook": "https://www.facebook.com/pagina",
  "youtube": "https://www.youtube.com/@canal",
  "endereco": "Rua, número, bairro, cidade-PA",
  "atendimento": "Segunda a sexta, das 8h às 12h"
}
```

### `dados/igrejas.json` — página Igrejas

Só `nome` e `municipio` são obrigatórios. As igrejas são agrupadas por município e ordenadas por nome. A busca aparece sozinha a partir de 6 igrejas.

```json
[
  {
    "municipio": "Santarém",
    "uf": "PA",
    "nome": "IAP Central",
    "endereco": "Rua, número, bairro",
    "pastor": "Pr. Nome Sobrenome",
    "cultos": "Sábado às 9h e às 18h; quarta às 19h30",
    "mapa": "https://maps.app.goo.gl/...",
    "whatsapp": "(93) 99999-9999"
  }
]
```

### `dados/agenda.json` — página Agenda e "Próximos eventos" da página inicial

Datas no formato `AAAA-MM-DD`. `fim`, `local`, `descricao`, `link` e `link_texto` são opcionais. Eventos que já passaram vão sozinhos para "Eventos anteriores". A página inicial mostra os três próximos.

```json
[
  {
    "titulo": "Assembleia Geral",
    "inicio": "2027-03-12",
    "fim": "2027-03-14",
    "local": "Santarém-PA",
    "descricao": "Uma frase sobre o evento.",
    "link": "https://...",
    "link_texto": "Fazer inscrição"
  }
]
```

### `dados/diretoria.json` — Diretoria Regional (página Quem somos)

Aparece na ordem em que estiver no arquivo.

```json
[
  { "cargo": "Presidente", "nome": "Pr. Nome Sobrenome" },
  { "cargo": "Secretário", "nome": "Nome Sobrenome" }
]
```

### `dados/ministerios.json` — página Ministérios

```json
[
  { "nome": "Jovens", "descricao": "Texto de apresentação.", "lider": "Nome Sobrenome", "whatsapp": "(93) 99999-9999" }
]
```

### `dados/downloads.json` — página Downloads

Envie o arquivo para a pasta `arquivos/` e cadastre aqui com o mesmo nome. Para apontar para um arquivo hospedado em outro lugar, coloque o link completo em `arquivo`.

```json
[
  { "titulo": "Ficha de arrolamento", "arquivo": "ficha-de-arrolamento.pdf", "descricao": "Opcional.", "categoria": "Formulários" }
]
```

## Textos fixos

Os textos de apresentação ficam no HTML de cada página: `index.html` (início), `quem-somos/index.html`, `contato/index.html` e assim por diante. O cabeçalho e o rodapé se repetem em todas as páginas; ao mudar o menu, altere em todas (inclusive `404.html`).

## Ver no computador antes de publicar

As listas são carregadas por JavaScript, então abrir o arquivo com dois cliques não funciona. Na pasta do projeto, rode:

```
python -m http.server 8000
```

e abra http://localhost:8000.

## Estrutura

```
index.html, 404.html        página inicial e página de erro
quem-somos/ igrejas/ ...    uma pasta por página (cada uma com index.html)
dados/                      conteúdo editável (.json)
arquivos/                   arquivos da página Downloads
assets/css/site.css         estilos
assets/js/site.js           monta as listas a partir de dados/
assets/img/ assets/fonts/   marca, ícones e fontes
CNAME                       domínio do GitHub Pages (crbaiap.org) — não apagar
```

## Identidade

Cores da logo: azul `#004B82` e laranja `#DF8701`. Fontes: Montserrat (a mesma da logo) nos títulos e Source Serif 4 nos textos, ambas sob a licença SIL Open Font License e hospedadas no próprio site.
