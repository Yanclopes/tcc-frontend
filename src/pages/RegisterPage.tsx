import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import type { GeoItem } from '@/types';

const CONSENT_VERSION = '2026-01-v1';

export function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [educationLevelId, setEducationLevelId] = useState<string>();
  const [stateId, setStateId] = useState<string>();
  const [cityId, setCityId] = useState<string>();
  const [schoolId, setSchoolId] = useState<string>();
  const [suggesting, setSuggesting] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [levels, setLevels] = useState<GeoItem[]>([]);
  const [states, setStates] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [schools, setSchools] = useState<GeoItem[]>([]);

  // Carrega escolaridades e estados ao montar.
  useEffect(() => {
    catalogService.educationLevels().then(setLevels).catch(() => undefined);
    catalogService.states().then(setStates).catch(() => undefined);
  }, []);

  // Cascata: estado -> cidades; cidade -> escolas.
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
    if (!consent) {
      toast('É necessário aceitar o termo de consentimento (LGPD).', 'error');
      return;
    }
    if (suggesting && suggestName.trim() && !cityId) {
      toast('Para sugerir uma escola, selecione o estado e a cidade dela.', 'error');
      return;
    }
    setLoading(true);
    try {
      const willSuggest = suggesting && suggestName.trim().length >= 2 && !!cityId;
      await register({
        ...form,
        educationLevelId: educationLevelId ? Number(educationLevelId) : undefined,
        schoolId: !suggesting && schoolId ? Number(schoolId) : undefined,
        suggestedSchoolName: willSuggest ? suggestName.trim() : undefined,
        suggestedSchoolCityId: willSuggest ? Number(cityId) : undefined,
        consentVersion: CONSENT_VERSION,
      });
      toast(
        willSuggest
          ? 'Conta criada! Sua escola foi enviada para aprovação do administrador.'
          : 'Conta criada! Bons jogos.',
        'success',
      );
      navigate('/jogar', { replace: true });
    } catch (err) {
      toast(extractError(err, 'Não foi possível criar a conta.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-center text-2xl font-extrabold text-slate-900">Criar conta</h1>
      <p className="mb-6 text-center text-sm text-slate-600">
        Informar escola e escolaridade ajuda o recorte regional da pesquisa (opcional).
      </p>
      <Card>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha (mín. 8 caracteres)</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <Label>Escolaridade</Label>
              <Select
                value={educationLevelId}
                onValueChange={setEducationLevelId}
                options={toOptions(levels)}
                placeholder="Selecione (opcional)"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Estado</Label>
                <Select value={stateId} onValueChange={setStateId} options={toOptions(states)} placeholder="UF" />
              </div>
              <div>
                <Label>Cidade</Label>
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
              <Label>Escola</Label>
              {suggesting ? (
                <Input
                  placeholder="Nome da sua escola"
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
                <span>Não encontrei minha escola na lista (sugerir para o administrador)</span>
              </label>
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Concordo que minhas respostas sejam usadas, de forma anônima, para fins de pesquisa
                acadêmica sobre o conhecimento dos ODS (LGPD).
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
