import { AlertTriangle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { Input, Label } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { catalogService } from '@/services/catalog.service';
import { userService } from '@/services/user.service';
import type { GeoItem } from '@/types';

/**
 * Tela obrigatória após rejeição da sugestão de escola. Bloqueia toda navegação
 * até o participante refazer a escolha (nova escola do catálogo ou nova sugestão).
 */
export function CompleteProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stateId, setStateId] = useState<string>();
  const [cityId, setCityId] = useState<string>();
  const [schoolId, setSchoolId] = useState<string>();
  const [suggesting, setSuggesting] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [schools, setSchools] = useState<GeoItem[]>([]);

  useEffect(() => {
    catalogService.states().then(setStates).catch(() => undefined);
  }, []);

  useEffect(() => {
    setCityId(undefined);
    setCities([]);
    setSchoolId(undefined);
    setSchools([]);
    if (stateId) catalogService.cities(Number(stateId)).then(setCities).catch(() => undefined);
  }, [stateId]);

  useEffect(() => {
    setSchoolId(undefined);
    setSchools([]);
    setSuggesting(false);
    setSuggestName('');
    if (cityId) catalogService.schools(Number(cityId)).then(setSchools).catch(() => undefined);
  }, [cityId]);

  const toOptions = (items: GeoItem[]): SelectOption[] =>
    items.map((i) => ({ value: String(i.id), label: i.name }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stateId || !cityId) {
      toast('Estado e cidade são obrigatórios.', 'error');
      return;
    }
    const willSuggest = suggesting && suggestName.trim().length >= 2;
    if (!suggesting && !schoolId) {
      toast('Selecione uma escola ou marque "não encontrei" para sugerir outra.', 'error');
      return;
    }
    if (suggesting && !willSuggest) {
      toast('Digite o nome da escola que você quer sugerir (mín. 2 caracteres).', 'error');
      return;
    }
    setLoading(true);
    try {
      await userService.updateOwnSchool({
        stateId: Number(stateId),
        cityId: Number(cityId),
        schoolId: !suggesting && schoolId ? Number(schoolId) : undefined,
        suggestedSchoolName: willSuggest ? suggestName.trim() : undefined,
      });
      await refreshUser();
      toast(
        willSuggest
          ? 'Nova sugestão enviada para revisão. Bons jogos!'
          : 'Escola atualizada. Bons jogos!',
        'success',
      );
      navigate('/jogar', { replace: true });
    } catch (err) {
      toast(extractError(err, 'Não foi possível atualizar sua escola.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-center text-2xl font-extrabold text-slate-900">Completar perfil</h1>
      <p className="mb-4 text-center text-sm text-slate-600">
        Sua sugestão de escola foi rejeitada. Escolha uma escola cadastrada ou envie uma nova sugestão para continuar jogando.
      </p>

      {user?.schoolRejectionReason && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Motivo informado pelo administrador:</p>
            <p className="mt-1">{user.schoolRejectionReason}</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>
                  Estado <span className="text-rose-500">*</span>
                </Label>
                <Select value={stateId} onValueChange={setStateId} options={toOptions(states)} placeholder="UF" />
              </div>
              <div>
                <Label>
                  Cidade <span className="text-rose-500">*</span>
                </Label>
                <Combobox
                  value={cityId}
                  onValueChange={setCityId}
                  options={toOptions(cities)}
                  placeholder="Cidade"
                  emptyText="Nenhuma cidade"
                  disabled={!stateId}
                />
              </div>
            </div>

            <div>
              <Label>
                Escola <span className="text-rose-500">*</span>
              </Label>
              {suggesting ? (
                <Input
                  placeholder="Nome completo da escola"
                  value={suggestName}
                  onChange={(e) => setSuggestName(e.target.value)}
                />
              ) : (
                <Combobox
                  value={schoolId}
                  onValueChange={setSchoolId}
                  options={toOptions(schools)}
                  placeholder="Escola"
                  emptyText="Nenhuma escola cadastrada nesta cidade"
                  disabled={!cityId}
                />
              )}
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={suggesting}
                  disabled={!cityId}
                  onChange={(e) => setSuggesting(e.target.checked)}
                />
                <span>Não encontrei minha escola (enviar nova sugestão)</span>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Salvar e continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
