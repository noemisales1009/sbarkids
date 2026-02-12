# 🔧 Como Resolver o Erro 406 - clinical_rounds_simple

## Problema

O aplicativo está apresentando múltiplos erros 406 no console relacionados à tabela `clinical_rounds_simple`:

```
Failed to load resource: the server responded with a status of 406 ()
URL: .../rest/v1/clinical_rounds_simple?select=*&patient_id=eq...&round_id=is.null
```

## Causa

O erro **HTTP 406 (Not Acceptable)** do Supabase geralmente ocorre quando:

1. ✅ **A tabela não existe no banco de dados**
2. ✅ **As políticas RLS (Row Level Security) estão bloqueando o acesso**
3. ❌ Problemas com autenticação (menos comum neste caso)

## Solução

### Opção 1: Executar o Script SQL de Migração (Recomendado)

1. Acesse o painel do Supabase: https://app.supabase.com
2. Vá para seu projeto
3. Clique em **SQL Editor** no menu lateral
4. Abra o arquivo `database/migrations/fix_clinical_rounds_simple_rls.sql`
5. Copie todo o conteúdo
6. Cole no SQL Editor do Supabase
7. Clique em **Run** para executar

### Opção 2: Criar a Tabela Manualmente

Se a tabela não existir, execute primeiro:

1. Abra o arquivo `database/create_clinical_rounds_simple.sql`
2. Execute no SQL Editor do Supabase
3. Depois execute o arquivo `database/migrations/fix_clinical_rounds_simple_rls.sql`

### Opção 3: Verificar Políticas RLS Existentes

Você pode verificar se as políticas já existem:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'clinical_rounds_simple';

-- Verificar políticas existentes
SELECT * 
FROM pg_policies 
WHERE tablename = 'clinical_rounds_simple';
```

## Verificação

Após executar o script, recarregue a página da aplicação. Os erros 406 devem desaparecer e você verá no console:

```
✅ Dados carregados com sucesso
```

ou

```
ℹ️ Nenhum registro encontrado (esperado na primeira vez)
```

## Código Atualizado

O serviço `clinicalRoundsSimpleService.ts` foi atualizado para:
- ✅ Silenciar erros 406 excessivos no console
- ✅ Exibir mensagens de aviso mais claras
- ✅ Continuar funcionando mesmo quando a tabela não está acessível

## Segurança

⚠️ **Nota de Segurança**: As políticas RLS criadas permitem acesso **anônimo completo** à tabela (similar a outras tabelas do sistema). 

Se você precisar de controle de acesso mais restrito:

1. Modifique as políticas no arquivo SQL
2. Use condições como `auth.uid()` para verificar usuários autenticados
3. Adicione verificações de permissão baseadas em roles

Exemplo de política mais restrita:

```sql
-- Apenas usuários autenticados podem ler
CREATE POLICY "Authenticated users can read clinical_rounds_simple"
  ON public.clinical_rounds_simple
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

## Links Úteis

- [Documentação do Supabase sobre RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Exemplos de Políticas RLS](https://supabase.com/docs/guides/database/postgres/row-level-security#policies)
