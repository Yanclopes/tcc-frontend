import { BarChart3, Gamepad2, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ODS } from '@/lib/ods';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const features = [
  { icon: Gamepad2, title: 'Jogue e aprenda', desc: 'Perguntas de múltipla escolha sobre os 17 ODS, com poderes e pontuação.' },
  { icon: Trophy, title: 'Dispute o ranking', desc: 'Acumule pontos por velocidade e sequência de acertos.' },
  { icon: Users, title: 'Contribua com a pesquisa', desc: 'Cada resposta ajuda a mapear o conhecimento sobre a Agenda 2030.' },
];

export function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="animate-fade-in text-center">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          Agenda 2030 · Objetivos de Desenvolvimento Sustentável
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Teste seu conhecimento sobre os <span className="text-brand-600">ODS</span> jogando
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Uma experiência gamificada no estilo game show para aprender e ajudar a levantar
          dados sobre a sustentabilidade no Alto Vale do Itajaí.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/jogar">
              <Gamepad2 className="h-5 w-5" /> Começar a jogar
            </Link>
          </Button>
          {isAdmin && (
            <Button size="lg" variant="outline" asChild>
              <Link to="/dashboard">
                <BarChart3 className="h-5 w-5" /> Ver dashboard
              </Link>
            </Button>
          )}
          {!isAuthenticated && (
            <Button size="lg" variant="outline" asChild>
              <Link to="/registrar">Criar conta</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Grade dos 17 ODS */}
      <section>
        <p className="mb-3 text-center text-sm text-slate-500">
          Os 17 Objetivos de Desenvolvimento Sustentável — passe o mouse para ver a descrição.
        </p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-9 md:grid-cols-[repeat(17,minmax(0,1fr))]">
          {Object.values(ODS).map((o) => {
            // Alinha o tooltip para não estourar a tela nas pontas da grade.
            const align =
              o.number <= 3
                ? 'left-0'
                : o.number >= 15
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2';
            return (
              <div key={o.number} className="group relative">
                <div
                  tabIndex={0}
                  aria-label={`ODS ${o.number}: ${o.name}. ${o.description}`}
                  className="grid aspect-square cursor-help place-items-center rounded-lg text-lg font-bold text-white shadow-sm outline-none transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  style={{ backgroundColor: o.color }}
                >
                  {o.number}
                </div>

                {/* Tooltip (hover/foco) */}
                <div
                  role="tooltip"
                  className={cn(
                    'pointer-events-none absolute bottom-full z-30 mb-2 hidden w-56 rounded-xl bg-slate-900 p-3 text-left shadow-xl group-hover:block group-focus-within:block',
                    align,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded text-[11px] font-bold text-white"
                      style={{ backgroundColor: o.color }}
                    >
                      {o.number}
                    </span>
                    <span className="text-sm font-bold text-white">{o.name}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-snug text-slate-300">{o.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardContent className="space-y-2">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
