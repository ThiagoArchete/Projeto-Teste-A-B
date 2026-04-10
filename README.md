# ☕ CaféExpress - Sistema de Monitoramento e Teste A/B

Este repositório contém a implementação completa de um ecossistema Full-Stack desenvolvido para demonstrar a aplicação prática de **Testes A/B e Monitoramento de Métricas de Performance** em dispositivos móveis.

O projeto foi construído do zero com foco na coleta de dados em tempo real, cálculo de interações (conversão) e performance de renderização de telas, culminando em um painel web com um dashboard.

---

## 🏗️ Arquitetura do Projeto

O ecossistema é dividido em três pilares principais:

1. **📱 Mobile (Front-end App):** Aplicativo construído em **React Native (Expo)** simulando uma cafeteria (CaféExpress). Possui navegação nativa, catálogo de produtos e envia silenciosamente métricas de navegação, tempo de tela e cliques em botões.
2. **⚙️ Back-end (API e Banco de Dados):** Servidor construído em **Node.js (Express)** utilizando **SQLite**. Ele recebe os eventos do aplicativo móvel e armazena os registros de *page_views* e *button_clicks*.
3. **📊 Dashboard Web (Painel Analítico):** Painel web construído em **React (Vite) + Recharts**. Ele consome a API a cada 3 segundos, exibe os KPIs e aplica um motor estatístico para declarar o vencedor do Teste A/B com base em pesos de conversão.

---

## 🚀 Como Rodar o Projeto (Tutorial Passo a Passo)

Para que o sistema funcione perfeitamente, os três pilares (API, Mobile e Web) precisam rodar simultaneamente em terminais separados.

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 20+ recomendada) instalado na sua máquina.

### Passo 1: Iniciando o Banco de Dados (API)
Abra um terminal na raiz do projeto e execute os comandos abaixo:
`cd backend`
`npm install`
`node server.js`
*(O terminal deverá exibir: `✅ Conectado ao banco de dados SQLite` e `🚀 API rodando na porta http://localhost:3000`)*

### Passo 2: Iniciando o Aplicativo Mobile
Abra um **segundo terminal** na raiz do projeto e execute:
`cd mobile`
`npm install`
`npx expo start --clear`
*(Para testar de forma rápida via navegador, pressione a tecla **`w`** no terminal assim que o Expo carregar)*

### Passo 3: Iniciando o Dashboard Analítico
Abra um **terceiro terminal** na raiz do projeto e execute:
`cd dashboard`
`npm install`
`npm run dev`
*(Acesse o link gerado, geralmente `http://localhost:5173`, no seu navegador. O painel será atualizado em tempo real conforme você interage com o aplicativo mobile)*

---

## 🎓 Contexto Acadêmico

Este projeto foi desenvolvido como requisito de avaliação para o projeto da disciplina ministrada pelo **Professor Alessandro Fukuta**. O objetivo prático é demonstrar o ciclo de vida da informação e os impactos visuais em um cenário de Teste A/B.

**👨‍💻 Membros Responsáveis:**
* Thiago Cunha Archete Silva
* Paulo Ricardo de Azevedo Alvino
* Vinícius de Araújo Silva