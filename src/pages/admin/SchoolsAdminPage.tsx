import { Check, Pencil, Plus, School as SchoolIcon, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { Input, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { catalogService } from '@/services/catalog.service';
import { schoolsService } from '@/services/schools.service';
import type { GeoItem, School, SchoolSuggestion } from '@/types';

/** Grupo de checkboxes de níveis de escolaridade. */
function LevelPicker({
  levels,
  selected,
  onToggle,
}: {
  levels: GeoItem[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((lv) => {
        const on = selected.includes(lv.id);
        return (
          <button
            key={lv.id}
            type="button"
            onClick={() => onToggle(lv.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              on
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {lv.name}
          </button>
        );
      })}
    </div>
  );
}

export function SchoolsAdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>([]);
  const [levels, setLevels] = useState<GeoItem[]>([]);
  const [states, setStates] = useState<GeoItem[]>([]);

  // Formulário de criação/edição de escola.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [stateId, setStateId] = useState<string>();
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [cityId, setCityId] = useState<string>();
  const [selLevels, setSelLevels] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  // Níveis escolhidos por sugestão (para aprovação).
  const [sugLevels, setSugLevels] = useState<Record<number, number[]>>({});

  const load = async () => {
    const [sc, sg] = await Promise.all([
      schoolsService.list(),
      schoolsService.listSuggestions('pending'),
    ]);
    setSchools(sc);
    setSuggestions(sg);
  };

  useEffect(() => {
    Promise.all([
      catalogService.educationLevels().then(setLevels),
      catalogService.states().then(setStates),
      load(),
    ])
      .catch((err) => toast(extractError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCities([]);
    if (stateId) catalogService.cities(Number(stateId)).then(setCities).catch(() => undefined);
  }, [stateId]);

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.id), label: c.name })),
    [cities],
  );

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setStateId(undefined);
    setCityId(undefined);
    setSelLevels([]);
  };

  const startEdit = (s: School) => {
    setEditingId(s.id);
    setName(s.name);
    setStateId(s.city.state ? String(s.city.state.id) : undefined);
    setCityId(String(s.city.id));
    setSelLevels(s.educationLevels.map((l) => l.id));
    if (s.city.state) {
      catalogService.cities(s.city.state.id).then(setCities).catch(() => undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cityId) {
      toast('Selecione o estado e a cidade da escola.', 'error');
      return;
    }
    setSaving(true);
    try {
      const input = { name: name.trim(), cityId: Number(cityId), educationLevelIds: selLevels };
      if (editingId) {
        await schoolsService.update(editingId, input);
        toast('Escola atualizada.', 'success');
      } else {
        await schoolsService.create(input);
        toast('Escola cadastrada.', 'success');
      }
      resetForm();
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: School) => {
    if (!window.confirm(`Remover a escola "${s.name}"? Alunos vinculados ficarão sem escola.`)) return;
    try {
      await schoolsService.remove(s.id);
      toast('Escola removida.', 'success');
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    }
  };

  const approve = async (s: SchoolSuggestion) => {
    try {
      await schoolsService.approve(s.id, sugLevels[s.id] ?? []);
      toast(`Escola "${s.name}" criada e aluno vinculado.`, 'success');
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    }
  };

  const reject = async (s: SchoolSuggestion) => {
    if (!window.confirm(`Rejeitar a sugestão "${s.name}"?`)) return;
    try {
      await schoolsService.reject(s.id);
      toast('Sugestão rejeitada.', 'success');
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    }
  };

  const toggle = (list: number[], id: number) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  if (loading) return <FullPageSpinner label="Carregando escolas…" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Escolas</h1>
        <p className="text-sm text-slate-600">
          Cadastre escolas e os níveis de escolaridade que atendem. Sugestões dos alunos aparecem
          aqui para aprovação.
        </p>
      </div>

      {/* Sugestões pendentes */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            Sugestões pendentes
            {suggestions.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {suggestions.length}
              </span>
            )}
          </h2>
          {suggestions.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma sugestão pendente.</p>
          ) : (
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <li key={s.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.city.name}
                        {s.city.state ? ` / ${s.city.state.code}` : ''}
                        {s.suggestedBy ? ` · sugerida por ${s.suggestedBy.name}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approve(s)}>
                        <Check className="h-4 w-4" /> Aprovar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reject(s)}>
                        <X className="h-4 w-4" /> Rejeitar
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-medium text-slate-500">
                      Níveis atendidos (aplicados ao aprovar):
                    </p>
                    <LevelPicker
                      levels={levels}
                      selected={sugLevels[s.id] ?? []}
                      onToggle={(id) =>
                        setSugLevels((prev) => ({ ...prev, [s.id]: toggle(prev[s.id] ?? [], id) }))
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Formulário de escola */}
      <Card>
        <CardContent>
          <h2 className="mb-4 font-bold text-slate-900">
            {editingId ? 'Editar escola' : 'Nova escola'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Estado</Label>
                <Select
                  value={stateId}
                  onValueChange={(v) => {
                    setStateId(v);
                    setCityId(undefined);
                  }}
                  options={states.map((s) => ({ value: String(s.id), label: s.name }))}
                  placeholder="UF"
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Combobox
                  value={cityId}
                  onValueChange={setCityId}
                  options={cityOptions}
                  placeholder="Cidade"
                  disabled={!stateId}
                />
              </div>
            </div>
            <div>
              <Label>Níveis de escolaridade atendidos</Label>
              <LevelPicker
                levels={levels}
                selected={selLevels}
                onToggle={(id) => setSelLevels((prev) => toggle(prev, id))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <Plus className="h-4 w-4" /> {editingId ? 'Salvar' : 'Cadastrar'}
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

      {/* Lista de escolas */}
      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-bold text-slate-900">Escolas cadastradas ({schools.length})</h2>
          {schools.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma escola cadastrada ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {schools.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <SchoolIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.city.name}
                        {s.city.state ? ` / ${s.city.state.code}` : ''}
                        {s.educationLevels.length > 0 &&
                          ` · ${s.educationLevels.map((l) => l.name).join(', ')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(s)}>
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
