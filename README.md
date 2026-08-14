# Desafio ODS — Frontend

Interface web da plataforma gamificada para **levantamento do conhecimento sobre os Objetivos de
Desenvolvimento Sustentável (ODS)**. Consome a API NestJS do backend.

> Trabalho de Conclusão de Curso — Sistemas de Informação / UNIDAVI.

## Stack

Alinhada ao referencial teórico do TCC:

| Camada | Tecnologia |
| --- | --- |
| Biblioteca de UI | **React 18** + **TypeScript** |
| Build | **Vite** |
| Estilo | **Tailwind CSS** |
| Componentes acessíveis | **Radix UI** (Dialog, Select, Tabs, Progress, Label, Slot) |
| HTTP | **Axios** (com interceptors de JWT e 401) |
| Rotas | **React Router** |
| Ícones | **lucide-react** |

## Funcionalidades

- **Autenticação** (login/registro) com **JWT** e controle por **papel** (`user`/`admin`).
- **Jogo gamificado** (game show de perguntas e respostas): escolha de modo (Rápido/Clássico/Infinito/Sobrevivência),
  perguntas por ODS, timer com bônus de velocidade, **power-ups** (50:50, Plateia, Pular),
  pontuação e sequência (*streak*), tela de resultado. Exige autenticação para jogar.
- **Ranking** (placar geral).
- **Dashboard administrativo** (somente `admin`): KPIs gerais, desempenho **por ODS**,
  **por região** (estado/cidade/escola) e **por pergunta**, com filtros combináveis
  (ODS, escolaridade, região, incluir anônimos).

## Estrutura

```
src/
├── components/
│   ├── ui/          # Kit de UI (Button, Card, Input, Select, ProgressBar, OdsBadge…)
│   ├── layout/      # Navbar, Layout, ProtectedRoute
│   ├── game/        # OptionButton, PowerupBar, ScoreHud, ResultScreen
│   └── dashboard/   # StatCard, HBarChart, FilterBar
├── context/         # AuthContext, ToastContext
├── lib/             # api (axios), ods (cores/nomes), utils
├── pages/           # Home, Login, Register, Game, Ranking, Dashboard, NotFound
├── services/        # Chamadas à API por domínio
└── types/           # Tipos espelhando os DTOs do backend
```

## Como executar

Requer o **backend** no ar (ver repositório do backend).

```bash
cp .env.example .env      # ajuste VITE_API_URL se necessário
npm install
npm run dev               # http://localhost:5173
```

Build de produção:

```bash
npm run build             # gera dist/
npm run preview           # serve o build localmente
```

### Docker

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000/api/v1 -t ods-frontend .
docker run -p 8080:80 ods-frontend   # http://localhost:8080
```

## Variáveis de ambiente

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `VITE_API_URL` | URL base da API (inclui `/api/v1`) | `http://localhost:3000/api/v1` |

> As variáveis `VITE_*` são **embutidas no bundle** em tempo de build — não coloque segredos aqui.

## Acesso admin

O dashboard exige papel `admin`. Um admin inicial é criado pela *seed* do backend
(`ADMIN_EMAIL`/`ADMIN_PASSWORD`). Faça login com essas credenciais para ver o menu **Dashboard**.
