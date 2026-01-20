# 🍽️🩺 Dietas e Exames - Guia de Configuração

## ✅ O que foi adicionado?

Duas novas funcionalidades foram integradas ao sistema SBAR na seção **Background (B - Breve Histórico)**:

1. **🍽️ Dietas** - Controle nutricional completo do paciente
2. **🩺 Exames** - Registro de exames realizados

---

## 📋 Passo 1: Executar SQL no Supabase

Vá para o **SQL Editor** no dashboard do Supabase e execute o script:

📁 **Arquivo:** `database/migrations/create_dietas_exames_tables.sql`

Este script irá:
- ✅ Criar tabela `exames_pacientes`
- ✅ Criar tabela `dietas_pacientes`
- ✅ Adicionar índices para performance
- ✅ Configurar RLS (Row Level Security)
- ✅ Criar políticas de acesso
- ✅ Criar trigger para atualizar `updated_at`

---

## 🔧 Passo 2: Verificar Tabelas Criadas

No Supabase, vá para **Table Editor** e confirme que as tabelas foram criadas:

### Tabela: `exames_pacientes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint | ID auto-incremento |
| `paciente_id` | uuid | FK → patients |
| `nome_exame` | text | Nome do exame |
| `data_exame` | date | Data do exame |
| `observacao` | text | Observações (opcional) |
| `is_archived` | boolean | Arquivado? |
| `created_at` | timestamp | Data de criação |

### Tabela: `dietas_pacientes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | ID único |
| `paciente_id` | uuid | FK → patients |
| `tipo` | varchar(50) | Tipo de dieta |
| `data_inicio` | date | Data de início |
| `data_remocao` | timestamp | Data de remoção (opcional) |
| `volume` | numeric(10,2) | Volume em ml |
| `vet` | numeric(10,2) | VET em kcal |
| `pt` | numeric(10,2) | PT em g |
| `th` | numeric(10,2) | TH em g |
| `vet_pleno` | numeric(10,2) | VET pleno (meta) |
| `pt_g_dia` | numeric(10,2) | PT g/dia (meta) |
| `vet_at` | numeric(10,2) | % VET atual (calculado) |
| `pt_at` | numeric(10,2) | % PT atual (calculado) |
| `observacao` | text | Observações (opcional) |
| `is_archived` | boolean | Arquivado? |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

**Nota:** Os campos `vet_at` e `pt_at` são **calculados automaticamente** pelo banco de dados.

---

## 📊 Passo 3: Usar no Sistema

As funcionalidades já estão integradas no componente **BackgroundEditor**!

### Como Acessar?

1. Abra um **Relatório SBAR** de qualquer paciente
2. Na seção **B - Breve Histórico**, você verá as novas seções:
   - 🍽️ **Dietas**
   - 🩺 **Exames**

### Como Adicionar?

#### Adicionar Exame:
1. Clique no botão **"+ Adicionar"** na seção 🩺 Exames
2. Preencha:
   - Nome do exame
   - Data do exame
   - Observações (opcional)
3. Clique em **"Salvar"**

#### Adicionar Dieta:
1. Clique no botão **"+ Adicionar"** na seção 🍽️ Dietas
2. Preencha:
   - Tipo de dieta
   - Data de início
   - Data de remoção (se aplicável)
   - **Valores nutricionais:**
     - Volume (ml)
     - VET (kcal) e VET Pleno
     - PT (g) e PT g/dia
     - TH (g)
   - Observações (opcional)
3. Clique em **"Salvar"**

**Os percentuais VET Atual e PT Atual são calculados automaticamente!**

---

## 🎨 Interface

### Cores das Seções:
- 💊 **Medicações** → Azul (`bg-blue-900/20`)
- 🔧 **Dispositivos** → Verde (`bg-green-900/20`)
- 🧪 **Culturas** → Roxo (`bg-purple-900/20`)
- ⚕️ **Procedimentos** → Laranja (`bg-orange-900/20`)
- 🩺 **Exames** → Verde-Água (`bg-teal-900/20`) ✨ **NOVO**
- 🍽️ **Dietas** → Amarelo (`bg-yellow-900/20`) ✨ **NOVO**

### Funcionalidades:
- ✏️ **Editar** qualquer registro
- 📋 **Visualizar** histórico completo
- 🗑️ **Arquivar** (soft delete via `is_archived`)

---

## 🔌 Serviços Disponíveis

Os serviços foram adicionados em `services/backgroundService.ts`:

### Exames:
```typescript
import { backgroundService } from './services/backgroundService';

// Buscar exames do paciente
const exames = await backgroundService.getExames(patientId);

// Adicionar exame
const novoExame = await backgroundService.saveExame({
  paciente_id: patientId,
  nome_exame: 'Hemograma',
  data_exame: '2026-01-14',
  observacao: 'Resultado dentro da normalidade',
  is_archived: false
});

// Atualizar exame
const atualizado = await backgroundService.updateExame(exameId, {
  observacao: 'Alteração nos valores'
});
```

### Dietas:
```typescript
import { backgroundService } from './services/backgroundService';

// Buscar dietas do paciente
const dietas = await backgroundService.getDietas(patientId);

// Adicionar dieta
const novaDieta = await backgroundService.saveDieta({
  paciente_id: patientId,
  tipo: 'Enteral',
  data_inicio: '2026-01-14',
  volume: 1200,
  vet: 1500,
  pt: 60,
  th: 200,
  vet_pleno: 1800,
  pt_g_dia: 75,
  is_archived: false
});

// Atualizar dieta
const atualizada = await backgroundService.updateDieta(dietaId, {
  volume: 1500,
  vet: 1700
});
```

---

## 📈 Cálculos Automáticos (Dietas)

Os campos `vet_at` e `pt_at` são calculados automaticamente:

```sql
-- VET Atual (%)
vet_at = (vet / vet_pleno) * 100

-- PT Atual (%)
pt_at = (pt / pt_g_dia) * 100
```

**Exemplo:**
- VET = 1500 kcal
- VET Pleno = 1800 kcal
- **VET Atual = 83.3%** ✅ (calculado automaticamente)

---

## 🧪 Testar

1. Execute o SQL no Supabase
2. Reinicie o app: `npm run dev`
3. Abra um relatório SBAR
4. Na seção **Background**, clique em **"+ Adicionar"** nas novas seções
5. Teste adicionar, editar e visualizar os dados!

---

## 📝 Arquivos Modificados

1. ✅ `database/migrations/create_dietas_exames_tables.sql` - **NOVO**
2. ✅ `services/backgroundService.ts` - Adicionadas interfaces e métodos
3. ✅ `components/sbar/BackgroundEditor.tsx` - Adicionadas seções e modais

---

## 🎉 Pronto!

Agora você pode registrar **Dietas** e **Exames** dos pacientes de forma completa e integrada ao sistema SBAR!

### Próximos Passos (Opcional):
- 📊 Criar gráficos de evolução nutricional
- 📅 Adicionar lembretes de exames periódicos
- 🔔 Criar alertas quando VET/PT estiver abaixo da meta
- 📄 Exportar relatórios nutricionais em PDF

---

**Desenvolvido para SbarKids** 🏥💙
