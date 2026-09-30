# AutoBar — réplica local

Cópia da página pública `https://centralidealbr.com/produto/autobar`, obtida em 30/09/2026. A estrutura, CSS, fontes, imagens e módulos usados pela página foram preservados. Também há páginas locais de checkout, políticas e rastreio.

## Executar

```powershell
node server.mjs
```

Execute no diretório deste repositório e abra `http://127.0.0.1:3001/produto/autobar` (ou a raiz, que redireciona para o produto). `node check.mjs` valida as páginas e recursos locais. `node mirror.mjs; node localize-media.mjs; node sanitize.mjs` atualiza a cópia da referência e remove scripts de anúncios da versão local.

Galeria, opções de posto, kits, prévia da foto escolhida, carrinho e navegação para o checkout funcionam no navegador. A foto fica apenas na prévia local. A API de pagamento, frete, cupom, newsletter e rastreio da loja original não está incluída: a réplica não recebe pedidos nem cobra clientes. Para publicar uma loja transacional, essas integrações precisam ser ligadas a contas e credenciais próprias.

## Publicação

`node build.mjs` gera `public/` para a Vercel. O checkout publicado mostra um aviso de prévia porque não processa pagamentos. `vercel.json` encaminha as rotas legíveis para os HTMLs correspondentes.
