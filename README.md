# #devlore

Um arquivo digital de artigos sobre JavaScript e Python, construído como uma SPA estática com HTML, CSS e JavaScript puro. Sem backend, sem banco de dados, sem build.

Este README funciona como um tutorial: ao final, você sabe rodar o projeto, entender como ele é organizado e publicar um artigo novo.

## O que você vai encontrar

- Home com campo de busca e lista dos 5 artigos mais recentes
- Busca por título e por tags, em tempo real
- Página de artigo renderizada a partir de Markdown
- Roteamento por hash (`#/` e `#/<slug>`)
- Única dependência externa: [marked.js](https://marked.js.org/), para converter Markdown em HTML

## 1. Estrutura do projeto

```
devlore/
├── index.html
├── style.css
├── data/
│   └── content.json
├── content/
│   ├── artigo-1.md
│   └── artigo-2.md
└── js/
    ├── main.js
    ├── router.js
    ├── pages.js
    ├── content.js
    ├── config.js
    └── marked.min.js
```

- `data/content.json` guarda os metadados dos artigos (título, slug, tags, arquivo).
- `content/` guarda o texto completo de cada artigo, em Markdown.
- `js/` guarda os módulos da aplicação.

## 2. Como rodar localmente

O projeto usa `fetch()` para carregar o JSON e os arquivos Markdown, então **não funciona abrindo o `index.html` direto no navegador** (protocolo `file://`). É preciso servir os arquivos por HTTP.

Com Python:

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador.

## 3. Como o código está organizado

Cada módulo tem uma responsabilidade única.

| Arquivo      | Responsabilidade                                                       |
| ------------ | ---------------------------------------------------------------------- |
| `main.js`    | Ponto de entrada. Liga router, content e pages.                        |
| `router.js`  | Lê o hash da URL e decide se é a home ou um artigo.                    |
| `content.js` | Carrega `content.json` e os arquivos `.md`, com cache da lista.        |
| `pages.js`   | Transforma dados em HTML: home, artigo e página 404.                   |
| `config.js`  | Configurações do site: título, descrição, rodapé e links.              |

### O fluxo de uma navegação

1. O usuário acessa `#/meu-artigo`.
2. `router.js` lê o hash e chama o handler `article("meu-artigo")`.
3. `main.js` pede o artigo ao `content.js`.
4. `content.js` encontra a entrada no JSON e busca o `.md` correspondente.
5. `main.js` entrega o resultado ao `pages.js`, que converte o Markdown com `marked` e monta a página.

Se o slug não existir, `content.js` devolve `null` e `pages.js` mostra a página 404.

## 4. Como adicionar um artigo

### Passo 1: crie o arquivo Markdown

Crie um arquivo em `content/`, por exemplo `content/closures-em-javascript.md`:

```markdown
# Closures em JavaScript

Texto do artigo aqui.
```

Use um `#` (h1) como primeira linha. As tags do artigo são inseridas logo depois dele.

### Passo 2: registre no JSON

Adicione uma entrada em `data/content.json`:

```json
{
  "slug": "closures-em-javascript",
  "title": "Closures em JavaScript",
  "file": "closures-em-javascript.md",
  "tags": ["javascript", "fundamentos"]
}
```

- `slug`: o que aparece na URL (`#/closures-em-javascript`).
- `title`: o título exibido na lista.
- `file`: o nome do arquivo dentro de `content/`.
- `tags`: usadas na busca e exibidas como etiquetas.

A home mostra os 5 primeiros itens do JSON, então coloque os artigos mais novos no topo da lista.

### Passo 3: confira

Recarregue a página. O artigo deve aparecer na home e abrir em `#/closures-em-javascript`.

## 5. Como personalizar

Edite `js/config.js` para trocar o título, a descrição, o texto do rodapé, o contato e os links. Os estilos ficam todos em `style.css`.

## 6. Como publicar no GitHub Pages

1. Envie o projeto para um repositório no GitHub.
2. Vá em **Settings > Pages**.
3. Em **Source**, escolha a branch principal e a pasta raiz (`/`).
4. Salve. Em alguns minutos o site estará disponível no endereço indicado.

Como o projeto é 100% estático e usa roteamento por hash, não precisa de nenhuma configuração extra para as rotas funcionarem.

## Decisões de projeto

- **Sem framework e sem build:** o objetivo é mostrar domínio da plataforma web.
- **Roteamento por hash:** funciona em qualquer hospedagem estática, sem regras de redirecionamento.
- **Metadados separados do texto:** o JSON cuida do índice e da busca; o Markdown cuida do conteúdo. Adicionar um artigo nunca exige mexer em JavaScript.

## Autor

Guilherme Ribeiro. [GitHub](https://github.com/liberstack)