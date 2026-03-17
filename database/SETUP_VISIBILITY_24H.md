# 🔧 SETUP - Funções de Visibilidade de Alertas 24h

## 📋 Passo-a-Passo para Executar no Supabase

### **Passo 1: Criar as Funções de Visibilidade**

1. Abra o **Supabase SQL Editor** (seu projeto → SQL Editor)
2. Crie uma **New Query**
3. Cole o conteúdo de:
   ```
   database/EXECUTE_VISIBILITY_FUNCTIONS.sql
   ```
4. Clique em **Run** (⌘+Enter ou Ctrl+Enter)

> ✅ Se não houver erros, as funções foram criadas com sucesso!

---

### **Passo 2: Atualizar as Triggers de Conclusão**

1. Crie uma **New Query**
2. Cole o conteúdo de:
   ```
   database/EXECUTE_CONCLUSION_TRIGGERS.sql
   ```
3. Clique em **Run**

> ✅ Os triggers agora deixam alertas visíveis por 24h sem arquivar automaticamente

---

### **Passo 3: Atualizar as Views**

1. Crie uma **New Query**
2. Cole o conteúdo de:
   ```
   database/EXECUTE_VIEWS_FINAL.sql
   ```
3. Clique em **Run**

> ✅ As views agora retornam `status = 'resolvido / arquivado'` quando concluído

---

### **Passo 4: Testar as Funções (OPCIONAL CHA VOCÊ QUER VER OS RESULTADOS)**

1. Crie uma **New Query**
2. Cole o conteúdo de:
   ```
   database/TEST_VISIBILITY_FUNCTIONS.sql
   ```
3. Execute cada query individualmente para testar

**Resultados esperados:**
- Alertas ativos: `visivel = TRUE`
- Concluídos há 1h: `visivel = TRUE`, `tempo_restante = "23h 0min visível"`
- Concluídos há 25h: `visivel = FALSE`, `tempo_restante = "Expirado"`

---

## 🎯 Como Funciona Agora

### **Fluxo Completo:**

1. **Usuário marca alerta como "✓ Concluir"**
   - ✅ Atualiza `status = 'concluido'`
   - ✅ Preenche `concluded_at` (timestamp)
   - ✅ Preenche `concluded_by` (UUID do usuário)
   - ❌ NÃO arquiva automaticamente

2. **Banco de Dados:**
   - Trigger `alerta_conclusion_trigger` preenche `concluded_at` se NULL
   - Função `is_alerta_visible()` determina se deve exibir
   - Função `tempo_restante_visibilidade()` calcula "23h 54min visível"

3. **Frontend (React):**
   - Alerta aparece na seção "✓ Alertas Concluídos" (em verde)
   - Timer atualiza a cada 1 minuto
   - Após 24h, mostra "Expirado" ou remove automaticamente

4. **Usuário pode:**
   - ✅ Ver o timer "23h 54min visível"
   - ✅ Clicar "🗑 Remover" para arquivar manualmente
   - ✅ Ou aguardar 24h para expirar automaticamente

---

## 📝 Arquivos Envolvidos

| Arquivo | Função |
|---------|--------|
| `EXECUTE_VISIBILITY_FUNCTIONS.sql` | Cria funções SQL para determinar visibilidade |
| `EXECUTE_CONCLUSION_TRIGGERS.sql` | Atualiza triggers para não arquivar automaticamente |
| `EXECUTE_VIEWS_FINAL.sql` | Atualiza views para mostrar status correto |
| `TEST_VISIBILITY_FUNCTIONS.sql` | Testa se as funções funcionam |
| `services/alertasService.ts` | Métodos para chamar funções SQL do TypeScript |
| `components/sbar/AlertasDisplay.tsx` | Exibe "Alertas Concluídos" com timer |

---

## 🚀 Próximos Passos

Após executar os 3 scripts no Supabase:

1. **Recarregue o navegador** (F5 ou Cmd+R)
2. **Abra o DevTools** (F12 → Console)
3. **Marca um alerta como "✓ Concluir"**
4. **Verifique:**
   - Console log mostrando sucesso
   - Alerta aparecendo em "✓ Alertas Concluídos"
   - Timer exibindo "23h 54min visível"

---

## ❓ Dúvidas?

Se algo não funcionar:

1. Verifique se as funções foram criadas:
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name IN ('is_alerta_visible', 'tempo_restante_visibilidade');
   ```

2. Verifique se os triggers existem:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE event_object_table IN ('alertas_paciente', 'tasks');
   ```

3. Abra o **Console do navegador** (F12) e procure por:
   - `📍 alertasService` - logs de execução
   - `✅` ou `❌` - sucesso ou erro

---

**Status:** ✅ Pronto para testar!
