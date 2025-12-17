# 🏥 SBAR Juju - Configuração Vercel

## Variáveis de Ambiente Necessárias

Para que o aplicativo funcione corretamente na Vercel, você precisa configurar as seguintes variáveis de ambiente:

### No painel da Vercel:
1. Vá para **Settings** > **Environment Variables**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### Como obter essas variáveis:
1. Acesse [supabase.com](https://supabase.com)
2. Vá até seu projeto
3. Clique em **Settings** > **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

## Procedimento para Deploy

1. **Commit das alterações:**
```bash
git add -A
git commit -m "chore: add Vercel configuration and environment setup"
git push origin main
```

2. **Conecte seu repositório na Vercel:**
   - Vá para [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Selecione seu repositório GitHub
   - Na tela de configuração, adicione as variáveis de ambiente
   - Deploy!

3. **Se o deploy falhar:**
   - Verifique as variáveis de ambiente na Vercel
   - Verifique o log do build em Deployments > Build Logs
   - Certifique-se de que as chaves do Supabase estão corretas

## Estrutura de Pastas
```
sbarkids/
├── components/      # Componentes React
├── pages/          # Páginas principais
├── services/       # Serviços (Supabase, APIs)
├── lib/            # Bibliotecas (supabase.ts)
├── hooks/          # Custom React hooks
├── types/          # TypeScript types
├── utils/          # Utilitários
├── src/            # Estilos (index.css)
├── .env.example    # Exemplo de variáveis
└── vite.config.ts  # Configuração Vite
```

## Troubleshooting

### "Blank page on Vercel"
- [ ] Verificar se as variáveis de ambiente estão configuradas
- [ ] Checar o Console do navegador (F12) para erros
- [ ] Verificar o Build Log na Vercel

### "Supabase not configured"
- [ ] Confirmar que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem
- [ ] Verificar se as chaves estão corretas (sem espaços extras)
- [ ] Redeploy após adicionar as variáveis

### "Login não funciona"
- [ ] Verificar se o Supabase está online
- [ ] Confirmar que as credenciais estão corretas
- [ ] Verificar se a tabela 'users' existe no banco de dados
