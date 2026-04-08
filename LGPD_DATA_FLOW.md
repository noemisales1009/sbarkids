# Fluxo de Dados Pessoais - LGPD

## 1. Dados Pessoais Coletados

### Dados de Pacientes (tabela `patients`)
| Campo | Tipo | Finalidade |
|-------|------|------------|
| name | texto | Identificacao do paciente |
| dob | data | Calculo de idade |
| mother_name | texto | Identificacao adicional |
| diagnosis | texto | Dados clinicos |
| comorbidade | texto | Dados clinicos |
| peso | numero | Dados clinicos |
| bed_number | numero | Localizacao no hospital |

### Dados de Usuarios (tabela `users`)
| Campo | Tipo | Finalidade |
|-------|------|------------|
| name | texto | Identificacao do profissional |
| email | texto | Autenticacao |
| role | texto | Controle de acesso |
| foto | blob | Perfil do profissional |

## 2. Fluxo de Dados

```
[Profissional] --> [Login (Supabase Auth)] --> [App SBAR Kids]
                                                    |
                                                    v
                                           [Supabase Database]
                                                    |
                    +-------------------------------+-------------------------------+
                    |               |               |               |               |
              [patients]    [alertas_paciente]  [clinical_rounds]  [tasks]    [audit_logs]
```

### 2.1 Autenticacao
- Login via email/senha (Supabase Auth)
- Token JWT armazenado no localStorage do navegador
- Sessao expira automaticamente apos 15 minutos de inatividade
- Refresh token gerenciado pelo Supabase

### 2.2 Acesso a Dados de Pacientes
- Profissional autenticado acessa lista de pacientes
- Ao abrir ficha do paciente, acao registrada na trilha de auditoria
- Dados transmitidos via HTTPS (TLS 1.2+)
- Dados NAO sao armazenados em sessionStorage (LGPD compliance)

### 2.3 Registro Clinico (SBAR)
- Assessment e Recommendation salvos por turno (manha, tarde, noite)
- Cada salvamento registra: quem salvou, quando, qual turno
- Historico de rounds preservado por paciente

### 2.4 Alertas
- Criacao, conclusao, arquivamento e justificativa registrados
- Cada acao registra: quem fez, quando, qual alerta, motivo

## 3. Trilha de Auditoria (tabela `audit_logs`)

Todas as acoes sobre dados de pacientes sao registradas:

| Acao | Descricao | Dados Registrados |
|------|-----------|-------------------|
| login | Profissional fez login | user_id, user_name |
| logout | Profissional fez logout | user_id, user_name |
| abriu_ficha | Abriu ficha do paciente | user, patient_id, patient_name |
| visualizou_historico | Viu historico do paciente | user, patient_id, patient_name |
| salvou_assessment | Salvou avaliacao | user, patient_id, turno |
| salvou_recommendation | Salvou recomendacao | user, patient_id, turno |
| concluiu_alerta | Concluiu um alerta | user, patient_id, descricao |
| arquivou_alerta | Arquivou um alerta | user, patient_id, descricao, motivo |
| justificou_alerta | Justificou um alerta | user, patient_id, descricao |
| editou_paciente | Editou dados do paciente | user, patient_id, campo |
| gerou_relatorio | Gerou relatorio | user, patient_id |

### Acesso aos logs
- Apenas usuarios com role `admin` ou `Administrador` podem ler os logs
- Logs sao imutaveis (sem UPDATE ou DELETE permitido)
- Registros mantidos indefinidamente

## 4. Seguranca

### Row Level Security (RLS)
- Todas as tabelas tem RLS habilitado
- Politicas por role (admin, medico, enfermeiro)
- Apenas autenticados acessam dados

### Transmissao
- Todas as comunicacoes via HTTPS
- API Supabase com TLS 1.2+

### Armazenamento
- Dados armazenados no Supabase (infraestrutura AWS)
- Backups automaticos do Supabase
- Sem dados sensiveis em localStorage/sessionStorage

### Timeout de Sessao
- 15 minutos de inatividade = logout automatico
- Aviso 2 minutos antes do logout
- Protege contra acesso nao autorizado em terminais compartilhados

## 5. Direitos do Titular (LGPD Art. 18)

Para exercer direitos de acesso, correcao ou exclusao de dados:
- Contatar o administrador do sistema
- Dados podem ser exportados via SQL pelo admin
- Exclusao logica (soft delete) preserva integridade dos registros clinicos
- Exclusao fisica disponivel para admin via Supabase

## 6. Base Legal

O tratamento de dados pessoais de saude e realizado com base em:
- **Art. 7, VIII** - Tutela da saude, em procedimento realizado por profissionais da saude
- **Art. 11, II, f** - Dados sensiveis para tutela da saude
- **Art. 6** - Principios de finalidade, adequacao, necessidade e seguranca
