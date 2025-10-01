# Analisador de E-mails com IA - Desafio AutoU

Projeto desenvolvido como parte do processo seletivo da AutoU.  
A aplicação web utiliza a Inteligência Artificial do Google Gemini para classificar e-mails, extrair ações e sugerir respostas personalizadas, otimizando a produtividade e a triagem de comunicações.

## Demonstração Online
A aplicação está hospedada e pronta para uso.  
Acesse através do link abaixo:

**[[Acessar a Aplicação Ao Vivo](http://autou.vercel.app/)](#)**

## Funcionalidades Principais
Este projeto vai além da simples classificação, atuando como um verdadeiro assistente de produtividade:

### Análise Inteligente por IA (Google Gemini)
- **Classificação Automática**: Identifica e-mails como Produtivo ou Improdutivo.  
- **Extração de Ação**: Detecta a próxima tarefa concreta sugerida no texto (ex: "Agendar reunião com...").  
- **Resposta Personalizada**: Gera sugestões de resposta que utilizam o contexto e os detalhes do e-mail original.  

### Múltiplos Métodos de Entrada
- Suporte para colar texto diretamente.  
- Upload de arquivos `.txt` e `.pdf`.  
- Interface moderna de arrastar e soltar (Drag and Drop) para arquivos.  
- Capacidade de analisar um arquivo anexado usando o texto como uma instrução ou contexto.  

### Controles Avançados para o Usuário
- **Ajuste de Criatividade**: Slider de "Temperatura" para controlar o quão determinística ou criativa será a resposta da IA.  
- **Instruções Customizadas**: Adicione instruções em tempo real para guiar o tom e o conteúdo da resposta.  
- **Templates de Prompt**: Salve e carregue instruções favoritas para agilizar tarefas repetitivas.  

### Refinamento de Respostas com Um Clique
- Após receber uma sugestão, refine-a instantaneamente para um tom mais **Formal**, **Casual** ou **Resumido**.  

### Interface Moderna e Responsiva
- Layout de duas colunas em desktops (Entrada à esquerda, Resultados à direita).  
- Totalmente adaptado para dispositivos móveis.  
- Modo Claro e Escuro (Dark/Light Mode) com detecção automática da preferência do sistema.  

## Tecnologias Utilizadas

| Categoria             | Tecnologia |
|-----------------------|------------|
| **Frontend**          | React (Vite), Tailwind CSS, Axios, React Dropzone |
| **Backend**           | Python 3, FastAPI, Uvicorn |
| **Inteligência Artificial** | API do Google Gemini (gemini-2.0-flash-lite) |
| **Plataformas de Deploy**   | Vercel (Frontend), Render (Backend) |

## Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)  
- Python (versão 3.10 ou superior)  
- Uma chave de API do Google Gemini (obtenha no [Google AI Studio](https://aistudio.google.com))  

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

### 2. Configurar e Rodar o Backend
```bash
# Navegue até a pasta do backend
cd backend

# Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate
# No Windows: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Crie a variável de ambiente com sua chave de API
export GOOGLE_API_KEY="SUA_CHAVE_API_DO_GEMINI"
# No Windows: set GOOGLE_API_KEY="SUA_CHAVE_API_DO_GEMINI"

# Inicie o servidor
uvicorn main:app --reload
```

O backend estará rodando em [http://localhost:8000](http://localhost:8000).

### 3. Configurar e Rodar o Frontend
```bash
# Em um novo terminal, navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação de desenvolvimento
npm run dev
```
