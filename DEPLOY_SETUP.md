# 🚀 GitHub Actions Deploy Pipeline

Esta é uma pipeline de CI/CD completa para deploying automático na Vercel usando GitHub Actions.

## O que a Pipeline Faz

✅ **Em Pull Requests:**
- Faz checkout do código
- Instala dependências (com cache)
- Executa linter (eslint)
- Faz build do projeto
- Cria um deploy preview na Vercel

✅ **Em Push para `main`:**
- Faz checkout do código
- Instala dependências (com cache)
- Executa linter (eslint)
- Faz build do projeto
- **Deploy automático em produção na Vercel**

## 📋 Pré-requisitos

1. Ter uma conta na [Vercel](https://vercel.com)
2. Ter o seu projeto Next.js conectado à Vercel
3. Gerar tokens de autenticação

## 🔧 Configuração Passo-a-Passo

### Passo 1: Criar Tokens na Vercel

1. Acesse [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Clique em "Create" para criar um novo token
3. Nomeie como algo descritivo (ex: "GitHub Actions")
4. Selecione "Full Access"
5. Copie o token (você não poderá vê-lo novamente)

### Passo 2: Encontrar IDs da Vercel

Para encontrar `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`:

1. Na pasta do seu projeto local, instale Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Link o projeto:
```bash
vercel link
```

4. Você verá dois arquivos criados/modificados:
   - `.vercel/project.json` - contém `projectId`
   - `.vercel/project.json` - contém `orgId`

Ou você pode encontrá-los no painel da Vercel:
- `VERCEL_PROJECT_ID`: URL do projeto = `vercel.com/[org-id]/[project-name]/[project-id]`
- `VERCEL_ORG_ID`: Pode ser encontrado em "Settings" → "General" do seu time/organização

### Passo 3: Adicionar Secrets no GitHub

1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em "New repository secret"

Adicione os seguintes secrets:

| Nome | Valor |
|------|-------|
| `VERCEL_TOKEN` | Token gerado na Vercel (Passo 1) |
| `VERCEL_ORG_ID` | ID da organização/time da Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |

> **Nota:** `GITHUB_TOKEN` é criado automaticamente pelo GitHub, não precisa adicionar manualmente.

### Passo 4: Fazer um Push para Testar

Faça um commit e push para a branch `main`:

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add github actions deploy pipeline"
git push origin main
```

Vá para **GitHub** → seu repositório → **Actions** para acompanhar a execução.

## 📊 Como Monitorar

1. **No GitHub:**
   - Vá para a aba **Actions** do seu repositório
   - Você verá cada execução da pipeline com status ✅ ou ❌

2. **Status em Pull Requests:**
   - A pipeline executa automaticamente em PRs
   - O status aparece no próprio PR
   - Deploy preview é criado automaticamente na Vercel

3. **Na Vercel:**
   - Acesse seu dashboard na Vercel
   - Veja deploys de produção e preview em tempo real

## 🔄 Workflow

```
┌─────────────────────────────────────────┐
│   Você faz push para 'main'             │
└────────────────┬────────────────────────┘
                 │
                 ▼
     ┌─────────────────────────┐
     │  GitHub Actions Inicia  │
     └────────────┬────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   ✅ Build           ✅ Lint
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
    ┌──────────────────────────┐
    │  Deploy em Produção ✅   │
    │  (seu site ao vivo)      │
    └──────────────────────────┘
```

## 🐛 Troubleshooting

### "Erro: Secret não encontrado"
- Verifique se digitou o nome correto do secret
- Secrets são case-sensitive

### "Build falha no GitHub mas funciona localmente"
- Pode ser um problema de cache
- Tente limpar o cache: **Settings** → **Actions** → **Clear all workflows**
- Ou verifique os logs detalhados na aba Actions

### "Deploy preview não aparece no PR"
- Verifique se `VERCEL_TOKEN` está correto
- Verifique se o token tem "Full Access"

## 📚 Recursos Adicionais

- [Documentação GitHub Actions](https://docs.github.com/en/actions)
- [Documentação Vercel + GitHub Actions](https://vercel.com/docs/git/vercel-for-github)
- [Deploy Next.js em Vercel](https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app/deploy)

## ✨ Próximos Passos (Opcional)

Você pode expandir esta pipeline com:

- **Testes automatizados:** Adicione `npm run test` 
- **Análise de código:** Integre CodeQL ou SonarCloud
- **Performance checks:** Adicione auditorias Lighthouse
- **Notificações:** Integre Slack/Discord para status
- **Deploy em staging:** Crie workflow separado para branch de staging

---

**Dúvidas?** Verifique os logs da pipeline na aba Actions do GitHub para detalhes completos.
