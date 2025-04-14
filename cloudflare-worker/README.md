
# Shopify API Proxy Worker

Este é um Cloudflare Worker que atua como um proxy seguro entre seu frontend e a API Admin do Shopify, resolvendo problemas de CORS.

## Como implantar

1. Crie uma conta no [Cloudflare Workers](https://workers.cloudflare.com/) se ainda não tiver uma.

2. Instale a Wrangler CLI:
   ```
   npm install -g @cloudflare/wrangler
   ```

3. Faça login na sua conta Cloudflare:
   ```
   wrangler login
   ```

4. Crie um novo worker:
   ```
   wrangler init shopify-proxy-worker
   ```

5. Substitua o código gerado pelo conteúdo do arquivo `shopify-proxy-worker.js`.

6. Configure as variáveis de ambiente necessárias:
   ```
   wrangler secret put SHOPIFY_STORE_URL
   wrangler secret put SHOPIFY_ACCESS_TOKEN
   ```

7. Implante o worker:
   ```
   wrangler publish
   ```

8. Após a implantação, você receberá um URL para o seu worker. Atualize o valor de `WORKER_BASE_URL` no arquivo `src/services/shopifyWorker.ts` do seu projeto React.

## Endpoints disponíveis

- `/shop` - Retorna informações da loja Shopify
- `/products` - Retorna produtos (aceita parâmetro `limit`)
- `/orders` - Retorna pedidos (aceita todos os parâmetros da API de pedidos Shopify)

## Segurança

- Nunca exponha suas credenciais do Shopify no código frontend
- O worker age como uma camada de segurança, mantendo suas chaves de API protegidas
- Considere adicionar autenticação ao worker em um ambiente de produção
