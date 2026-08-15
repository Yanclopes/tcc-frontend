import { Check, Link2, Pencil, Plus, School as SchoolIcon, Trash2, X } from 'lucide-react';
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
  // Nome editado por sugestão (permite corrigir typo do aluno antes de aprovar).
  const [sugNameOverride, setSugNameOverride] = useState<Record<number, string>>({});

  // Modal ativo: aprovar-com-edit, vincular ou rejeitar.
  const [modal, setModal] = useState<
    | { kind: 'link'; suggestion: SchoolSuggestion; schoolId?: string }
    | { kind: 'reject'; suggestion: SchoolSuggestion; reason: string }
    | null
  >(null);

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
    const overrideName = (sugNameOverride[s.id] ?? '').trim();
    try {
      await schoolsService.approve(
        s.id,
        sugLevels[s.id] ?? [],
        overrideName && overrideName !== s.name ? { name: overrideName } : undefined,
      );
      toast(`Escola "${overrideName || s.name}" criada e aluno vinculado.`, 'success');
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    }
  };

  const confirmLink = async () => {
    if (modal?.kind !== 'link' || !modal.schoolId) {
      toast('Selecione a escola existente para vincular.', 'error');
      return;
    }
    try {
      await schoolsService.link(modal.suggestion.id, Number(modal.schoolId));
      toast('Aluno vinculado à escola existente.', 'success');
      setModal(null);
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    }
  };

  const confirmReject = async () => {
    if (modal?.kind !== 'reject' || modal.reason.trim().length < 4) {
      toast('Descreva o motivo (mín. 4 caracteres).', 'error');
      return;
    }
    try {
      await schoolsService.reject(modal.suggestion.id, modal.reason.trim());
      toast('Sugestão rejeitada. Aluno será solicitado a refazer no próximo login.', 'success');
      setModal(null);
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
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.city.name}
                        {s.city.state ? ` / ${s.city.state.code}` : ''}
                        {s.suggestedBy ? ` · sugerida por ${s.suggestedBy.name}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => approve(s)}>
                        <Check className="h-4 w-4" /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModal({ kind: 'link', suggestion: s })}
                      >
                        <Link2 className="h-4 w-4" /> Vincular existente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModal({ kind: 'reject', suggestion: s, reason: '' })}
                      >
                        <X className="h-4 w-4" /> Rejeitar
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Nome final (edite se o aluno digitou errado):
                      </p>
                      <Input
                        value={sugNameOverride[s.id] ?? s.name}
                        onChange={(e) =>
                          setSugNameOverride((prev) => ({ ...prev, [s.id]: e.target.value }))
                        }
                      />
                    </div>
                    <div>
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

      {/* Modais de link/reject */}
      {modal?.kind === 'link' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900">Vincular à escola existente</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Sugestão: <span className="font-semibold">{modal.suggestion.name}</span>
                  {' · '}
                  {modal.suggestion.city.name}
                  {modal.suggestion.city.state ? ` / ${modal.suggestion.city.state.code}` : ''}
                </p>
              </div>
              <div>
                <Label>Escola cadastrada</Label>
                <Combobox
                  value={modal.schoolId}
                  onValueChange={(v) =>
                    setModal((prev) => (prev?.kind === 'link' ? { ...prev, schoolId: v } : prev))
                  }
                  options={schools.map((s) => ({
                    value: String(s.id),
                    label: `${s.name} · ${s.city.name}`,
                  }))}
                  placeholder="Escolha uma escola do catálogo"
                />
                <p className="mt-1 text-xs text-slate-500">
                  O aluno passará a apontar para essa escola. Não penaliza.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setModal(null)}>
                  Cancelar
                </Button>
                <Button onClick={confirmLink}>Vincular</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {modal?.kind === 'reject' && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900">Rejeitar sugestão</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Sugestão: <span className="font-semibold">{modal.suggestion.name}</span>
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  O aluno será solicitado a refazer no próximo login e verá o motivo.
                </p>
              </div>
              <div>
                <Label>Motivo</Label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  rows={3}
                  value={modal.reason}
                  onChange={(e) =>
                    setModal((prev) =>
                      prev?.kind === 'reject' ? { ...prev, reason: e.target.value } : prev,
                    )
                  }
                  placeholder="Ex.: Nome muito genérico — informe o nome completo da escola."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setModal(null)}>
                  Cancelar
                </Button>
                <Button onClick={confirmReject}>Rejeitar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
