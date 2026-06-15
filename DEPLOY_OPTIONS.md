# 🚀 Pipeline de Deploy - Opções Disponíveis

Criei **3 pipelines diferentes** para você escolher a que melhor se encaixa com suas necessidades!

## 📋 Resumo das Pipelines

### 1️⃣ **Deploy Vercel** (Recomendado para Next.js)
**Arquivo:** `.github/workflows/deploy.yml`

- ✅ Mais fácil para Next.js
- ✅ Deploy preview automático em PRs
- ✅ Deploy em produção automático na branch `main`
- ⏱️ Build mais rápido (otimizado para Next.js)
- 💰 Gratuito para projetos pessoais
- 🎯 **Melhor para:** Projetos Next.js sem dependências especiais

**Quando usar:** Você quer a solução mais simples e rápida para Next.js

---

### 2️⃣ **Build & Test** (Para validação)
**Arquivo:** `.github/workflows/build-test.yml`

- ✅ Valida build e lint em cada push
- ✅ Salva artefatos compilados
- ✅ Roda em PRs e na main
- 📦 Gera artifacts que podem ser reutilizados
- 🎯 **Melhor para:** Integração com outros sistemas de deploy

**Quando usar:** Você quer validar que o código compila antes de fazer deploy

---

### 3️⃣ **Docker** (Máxima flexibilidade)
**Arquivo:** `.github/workflows/docker-build.yml`
**Dockerfile:** `Dockerfile`

- ✅ Deploy em qualquer servidor (AWS, DigitalOcean, Heroku, etc)
- ✅ Build e push automático para Docker Hub
- ✅ Cache de layers para builds mais rápidos
- 🔧 Total controle sobre o ambiente
- 🎯 **Melhor para:** Deploy em infraestrutura própria ou serviços que usam Docker

**Quando usar:** Você quer máxima flexibilidade ou precisa fazer deploy em um servidor específico

---

## 🎯 Qual Escolher?

### Cenário 1: "Quero a forma mais fácil"
→ Use **Vercel** (Pipeline 1)

### Cenário 2: "Quero validar que tudo compila corretamente"
→ Use **Build & Test** (Pipeline 2)

### Cenário 3: "Vou fazer deploy em meu próprio servidor/Docker"
→ Use **Docker** (Pipeline 3)

### Cenário 4: "Quero usar Vercel + validação extra"
→ Use **Pipeline 1 + Pipeline 2** juntas

### Cenário 5: "Quero máxima flexibilidade"
→ Combine **Pipeline 2 + Pipeline 3**

---

## ⚡ Quick Start (Vercel - Mais Fácil)

### 1. Criar Token Vercel
```bash
# Acesse: https://vercel.com/account/tokens
# Crie um novo token com "Full Access"
```

### 2. Adicionar Secrets no GitHub
```bash
# Vá para: Settings → Secrets and variables → Actions
# Adicione:
# - VERCEL_TOKEN (do passo 1)
# - VERCEL_ORG_ID (encontre em https://vercel.com/account/settings/teams)
# - VERCEL_PROJECT_ID (seu Vercel project ID)
```

### 3. Fazer um Push
```bash
git add .github/workflows/deploy.yml DEPLOY_SETUP.md
git commit -m "feat: add vercel deploy pipeline"
git push origin main
```

### 4. Acompanhar
- Vá para **GitHub → Actions** para ver a execução
- Seu site fará deploy automaticamente!

---

## 🐳 Quick Start (Docker)

### 1. Configurar Docker Hub
```bash
# Crie uma conta em: https://hub.docker.com/
# Crie um token em: https://hub.docker.com/settings/security
```

### 2. Adicionar Secrets no GitHub
```bash
# Vá para: Settings → Secrets and variables → Actions
# Adicione:
# - DOCKER_USERNAME (seu usuário Docker Hub)
# - DOCKER_PASSWORD (seu token Docker Hub)
```

### 3. Fazer um Push
```bash
git add Dockerfile .dockerignore .github/workflows/docker-build.yml
git commit -m "feat: add docker build pipeline"
git push origin main
```

### 4. Sua imagem Docker estará em
```
docker.io/seu-usuario/processing-data-view:main
```

Você pode fazer pull e rodar em qualquer lugar:
```bash
docker pull seu-usuario/processing-data-view:main
docker run -p 3000:3000 seu-usuario/processing-data-view:main
```

---

## 📊 Comparação Rápida

| Feature | Vercel | Build & Test | Docker |
|---------|--------|--------------|--------|
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Custo | Gratuito* | Gratuito | Gratuito (use seu serv.) |
| Flexibilidade | Média | Alta | Máxima |
| Deploy Preview | ✅ Sim | ❌ Não | ⚠️ Precisa config. |
| Suporte Next.js | ✅ Nativo | ✅ Sim | ✅ Sim |
| Poder Computacional | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

*Vercel é gratuito para projetos pessoais; planos pagos a partir de $15/mês para times

---

## 🔗 Próximos Passos

1. **Escolha uma opção acima**
2. **Siga o Quick Start correspondente**
3. **Faça um push de teste**
4. **Veja a pipeline executar na aba Actions**
5. **Seu site fará deploy automaticamente! 🎉**

---

## 📚 Documentação Detalhada

Para configuração completa e troubleshooting, veja:
- **Para Vercel:** Leia `DEPLOY_SETUP.md`
- **Para Docker:** Leia o `Dockerfile` e `.dockerignore`

---

## ❓ Perguntas Comuns

**P: Quantas pipelines preciso rodar?**
R: Escolha UMA principal. Você pode adicionar outras depois se precisar validações extras.

**P: Posso rodar várias ao mesmo tempo?**
R: Sim! GitHub vai executar todas em paralelo. Custa mais (minutos de GitHub Actions), mas é possível.

**P: Como faço para fazer deploy em outro lugar que não seja Vercel?**
R: Use Docker (Pipeline 3) e faça pull da imagem onde você quiser.

**P: Meu secrets não funciona!**
R: Verifique a ortografia exata. Secrets são case-sensitive.

---

**Dúvidas?** Leia o arquivo correspondente à opção que escolheu! 🚀
