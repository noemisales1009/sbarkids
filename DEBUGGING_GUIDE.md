# Guia de Diagnóstico - SBAR Juju

Se o aplicativo está em branco ou carregando indefinidamente na Vercel, siga este guia.

## ✅ Passo 1: Verificar Console do Navegador

1. Abra o aplicativo na Vercel
2. Pressione `F12` para abrir o Console do Navegador
3. Procure por mensagens de erro (em vermelho)
4. **Procure especialmente por:**
   - ❌ Erros de variáveis de ambiente
   - ❌ Erros de CORS
   - ❌ Erros de carregamento de módulos
   - ❌ Erros de Supabase

## ✅ Passo 2: Verificar Logs na Vercel

1. Vá em: https://vercel.com/dashboard
2. Selecione seu projeto `sbarkids`
3. Vá em **Deployments**
4. Clique na última deployment
5. Clique em **Runtime Logs** para ver erros em tempo real
6. Procure por mensagens de erro em vermelho

## ✅ Passo 3: Verificar Variáveis de Ambiente

1. No dashboard da Vercel, vá em **Settings** → **Environment Variables**
2. Verifique se estas variáveis estão configuradas:
   - `VITE_SUPABASE_URL` ✅
   - `VITE_SUPABASE_ANON_KEY` ✅
3. Se não estão, adicione-as agora com seus valores do Supabase
4. Clique em **Save**
5. **IMPORTANTE:** Faça um redeploy depois de adicionar variáveis

## ✅ Passo 4: Forçar Redeploy

1. No dashboard da Vercel, vá em **Deployments**
2. Clique no ⋯ (três pontos) da última deployment
3. Selecione **Redeploy**
4. Aguarde a nova deployment ser concluída
5. Recarregue o navegador (Ctrl+F5 para cache limpo)

## ✅ Passo 5: Testar Localhost

Para confirmar que o código está funcionando:

```bash
npm install
npm run dev
```

Abra http://localhost:3000 (ou a porta mostrada no terminal)

## 📊 Mensagens Esperadas no Console

Quando tudo está funcionando, você deve ver:

```
🚀 Iniciando aplicação SBAR Juju...
✅ Elemento root encontrado
🔄 Renderizando App...
✅ App renderizado com sucesso
✓ Root element found
✅ Montado em App
🔍 Verificando variáveis de ambiente Supabase...
✅ Variáveis de ambiente Supabase configuradas com sucesso
✅ Cliente Supabase inicializado
🔄 Iniciando verificação de autenticação...
```

## ⚠️ Mensagens de Aviso

Se as variáveis de ambiente não estão configuradas:

```
⚠️ AVISO: Variáveis de ambiente Supabase não configuradas!
  VITE_SUPABASE_URL: ❌ NÃO CONFIGURADA
  VITE_SUPABASE_ANON_KEY: ❌ NÃO CONFIGURADA
  ℹ️ A aplicação funcionará em modo demonstração
```

Neste caso, você verá a tela de login após 5 segundos (timeout).

## 🐛 Problemas Comuns

### Problema: Página em branco indefinidamente

**Causa:** Supabase não carrega ou há erro crítico

**Solução:**
1. Abra Console (F12)
2. Procure por erros em vermelho
3. Se houver erro de CORS/Supabase:
   - Verifique as variáveis de ambiente na Vercel
   - Faça um redeploy

### Problema: "Carregando..." nunca desaparece

**Causa:** A verificação de autenticação está travada

**Solução:**
1. Aguarde 5 segundos - deve ir para Login
2. Se não acontecer, verifique Console para erros
3. Verifique se Supabase está acessível

### Problema: Erro de CORS

**Causa:** Navegador bloqueou requisição do Supabase

**Solução:**
1. Verifique URL do Supabase em variáveis de ambiente
2. Certifique que está usando HTTPS
3. Verifique CORS no Supabase

### Problema: "Variáveis de ambiente não encontradas"

**Causa:** Vercel não tem as variáveis configuradas

**Solução:**
1. Vá em Settings → Environment Variables na Vercel
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Salve
4. Faça um redeploy

## 🔧 Próximos Passos

Se o problema persiste:

1. Compartilhe o erro que aparece no Console (F12)
2. Compartilhe os logs da Vercel (Runtime Logs)
3. Verifique se as variáveis de ambiente estão corretas
4. Teste no localhost para confirmar que o código funciona

## 📱 Informações Úteis

- **Repository:** https://github.com/noemisales1009/sbarkids
- **Vercel Project:** https://vercel.com/dashboard/projects
- **Supabase Project:** https://app.supabase.com
- **Console do Navegador:** F12 ou Ctrl+Shift+I
