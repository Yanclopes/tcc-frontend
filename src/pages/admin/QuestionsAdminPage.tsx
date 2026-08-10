import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { catalogService } from '@/services/catalog.service';
import { questionsAdminService, type QuestionInput } from '@/services/admin.service';
import type { AdminQuestion, GeoItem, Goal } from '@/types';

const EMPTY_OPTIONS = ['', '', '', ''];

export function QuestionsAdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [levels, setLevels] = useState<GeoItem[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [goalNumber, setGoalNumber] = useState<string>();
  const [options, setOptions] = useState<string[]>(EMPTY_OPTIONS);
  const [correct, setCorrect] = useState(0);
  const [difficulty, setDifficulty] = useState('1');
  const [levelId, setLevelId] = useState<string>();
  const [source, setSource] = useState('');
  const [replaceOptions, setReplaceOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => questionsAdminService.list().then(setQuestions);

  useEffect(() => {
    Promise.all([
      catalogService.goals().then(setGoals),
      catalogService.educationLevels().then(setLevels),
      load(),
    ])
      .catch((err) => toast(extractError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setText('');
    setGoalNumber(undefined);
    setOptions(EMPTY_OPTIONS);
    setCorrect(0);
    setDifficulty('1');
    setLevelId(undefined);
    setSource('');
    setReplaceOptions(true);
  };

  const startEdit = (q: AdminQuestion) => {
    setEditingId(q.id);
    setText(q.text);
    setGoalNumber(String(q.goal.number));
    setOptions(q.options.map((o) => o.text));
    setCorrect(Math.max(0, q.options.findIndex((o) => o.id === q.answerOptionId)));
    setDifficulty(String(q.difficulty));
    setLevelId(q.educationLevel ? String(q.educationLevel.id) : undefined);
    setSource(q.source ?? '');
    setReplaceOptions(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!goalNumber) {
      toast('Selecione o ODS da pergunta.', 'error');
      return;
    }
    const sendOptions = !editingId || replaceOptions;
    if (sendOptions) {
      const filled = options.map((o) => o.trim());
      if (filled.some((o) => o.length === 0) || filled.length < 4) {
        toast('Preencha as 4 alternativas.', 'error');
        return;
      }
    }
    setSaving(true);
    try {
      const base: Partial<QuestionInput> & { isActive?: boolean } = {
        text: text.trim(),
        goalNumber: Number(goalNumber),
        difficulty: Number(difficulty),
        educationLevelId: levelId ? Number(levelId) : undefined,
        source: source.trim() || undefined,
      };
      if (sendOptions) {
        base.options = options.map((o) => ({ text: o.trim() }));
        base.correctOptionIndex = correct;
      }
      if (editingId) {
        await questionsAdminService.update(editingId, base);
        toast('Pergunta atualizada.', 'success');
      } else {
        await questionsAdminService.create(base as QuestionInput);
        toast('Pergunta criada.', 'success');
      }
      resetForm();
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (q: AdminQuestion) => {
    try {
      await questionsAdminService.setActive(q.id, !q.isActive);
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    }
  };

  const remove = async (q: AdminQuestion) => {
    if (!window.confirm('Remover esta pergunta? (só é possível se não houver respostas)')) return;
    try {
      await questionsAdminService.remove(q.id);
      toast('Pergunta removida.', 'success');
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    }
  };

  if (loading) return <FullPageSpinner label="Carregando perguntas…" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Perguntas</h1>
        <p className="text-sm text-slate-600">
          Cadastre e mantenha as perguntas do jogo. Perguntas já respondidas não podem ter as
          alternativas trocadas nem ser apagadas (preservação do dado) — desative-as.
        </p>
      </div>

      {/* Formulário */}
      <Card>
        <CardContent>
          <h2 className="mb-4 font-bold text-slate-900">
            {editingId ? `Editar pergunta #${editingId}` : 'Nova pergunta'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Enunciado</Label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                minLength={5}
                rows={2}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>ODS</Label>
                <Select
                  value={goalNumber}
                  onValueChange={setGoalNumber}
                  options={goals.map((g) => ({ value: String(g.number), label: `${g.number}. ${g.name}` }))}
                  placeholder="ODS"
                />
              </div>
              <div>
                <Label>Dificuldade</Label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                  options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `Nível ${n}` }))}
                />
              </div>
              <div>
                <Label>Escolaridade (opcional)</Label>
                <Select
                  value={levelId}
                  onValueChange={setLevelId}
                  options={levels.map((l) => ({ value: String(l.id), label: l.name }))}
                  placeholder="Todos"
                />
              </div>
            </div>

            {editingId && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={replaceOptions}
                  onChange={(e) => setReplaceOptions(e.target.checked)}
                />
                <span>Substituir as alternativas (bloqueado se a pergunta já tem respostas)</span>
              </label>
            )}

            {(!editingId || replaceOptions) && (
              <div className="space-y-2">
                <Label>Alternativas (marque a correta)</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrect(i)}
                      className="shrink-0"
                      title="Marcar como correta"
                    >
                      {correct === i ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <Input
                      value={opt}
                      onChange={(e) =>
                        setOptions((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))
                      }
                      placeholder={`Alternativa ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>Fonte (opcional)</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Ex.: ONU, 2015" />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <Plus className="h-4 w-4" /> {editingId ? 'Salvar' : 'Criar pergunta'}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-bold text-slate-900">Perguntas ({questions.length})</h2>
          <ul className="divide-y divide-slate-100">
            {questions.map((q) => (
              <li key={q.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div className="max-w-xl">
                  <p className={cn('font-medium text-slate-900', !q.isActive && 'text-slate-400 line-through')}>
                    {q.text}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    ODS {q.goal.number} · dificuldade {q.difficulty}
                    {q.educationLevel ? ` · ${q.educationLevel.name}` : ''}
                    {!q.isActive && ' · inativa'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant={q.isActive ? 'ghost' : 'outline'} onClick={() => toggleActive(q)}>
                    {q.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(q)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(q)}>
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
