import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { odsName } from '@/lib/ods';
import { catalogService } from '@/services/catalog.service';
import type { DashboardFilter, GeoItem, Goal, RegionLevel } from '@/types';

const ALL = 'all';

/** Barra de filtros do dashboard. Emite o filtro consolidado via onChange. */
export function FilterBar({
  filter,
  onChange,
  showLevel = false,
}: {
  filter: DashboardFilter;
  onChange: (next: DashboardFilter) => void;
  showLevel?: boolean;
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [states, setStates] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [schools, setSchools] = useState<GeoItem[]>([]);
  const [levels, setLevels] = useState<GeoItem[]>([]);

  useEffect(() => {
    catalogService.goals().then(setGoals).catch(() => undefined);
    catalogService.states().then(setStates).catch(() => undefined);
    catalogService.educationLevels().then(setLevels).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (filter.stateId) {
      catalogService.cities(filter.stateId).then(setCities).catch(() => undefined);
    } else {
      setCities([]);
    }
  }, [filter.stateId]);

  useEffect(() => {
    if (filter.cityId) {
      catalogService.schools(filter.cityId).then(setSchools).catch(() => undefined);
    } else {
      setSchools([]);
    }
  }, [filter.cityId]);

  const withAll = (options: SelectOption[], allLabel: string): SelectOption[] => [
    { value: ALL, label: allLabel },
    ...options,
  ];
  const numOrUndef = (v: string) => (v === ALL ? undefined : Number(v));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="ODS">
        <Select
          value={filter.goalNumber ? String(filter.goalNumber) : ALL}
          onValueChange={(v) => onChange({ ...filter, goalNumber: numOrUndef(v) })}
          options={withAll(
            goals.map((g) => ({ value: String(g.number), label: `${g.number} · ${odsName(g.number)}` })),
            'Todos os ODS',
          )}
        />
      </Field>

      <Field label="Escolaridade">
        <Select
          value={filter.educationLevelId ? String(filter.educationLevelId) : ALL}
          onValueChange={(v) => onChange({ ...filter, educationLevelId: numOrUndef(v) })}
          options={withAll(
            levels.map((l) => ({ value: String(l.id), label: l.name })),
            'Todas',
          )}
        />
      </Field>

      <Field label="Estado">
        <Select
          value={filter.stateId ? String(filter.stateId) : ALL}
          onValueChange={(v) =>
            onChange({ ...filter, stateId: numOrUndef(v), cityId: undefined, schoolId: undefined })
          }
          options={withAll(
            states.map((s) => ({ value: String(s.id), label: s.name })),
            'Todos',
          )}
        />
      </Field>

      <Field label="Cidade">
        <Select
          value={filter.cityId ? String(filter.cityId) : ALL}
          onValueChange={(v) => onChange({ ...filter, cityId: numOrUndef(v), schoolId: undefined })}
          disabled={!filter.stateId}
          options={withAll(
            cities.map((c) => ({ value: String(c.id), label: c.name })),
            'Todas',
          )}
        />
      </Field>

      <Field label="Escola">
        <Select
          value={filter.schoolId ? String(filter.schoolId) : ALL}
          onValueChange={(v) => onChange({ ...filter, schoolId: numOrUndef(v) })}
          disabled={!filter.cityId}
          options={withAll(
            schools.map((s) => ({ value: String(s.id), label: s.name })),
            'Todas',
          )}
        />
      </Field>

      {showLevel && (
        <Field label="Agrupar região por">
          <Select
            value={filter.level ?? 'state'}
            onValueChange={(v) => onChange({ ...filter, level: v as RegionLevel })}
            options={[
              { value: 'state', label: 'Estado' },
              { value: 'city', label: 'Cidade' },
              { value: 'school', label: 'Escola' },
            ]}
          />
        </Field>
      )}

      <div className="flex items-end">
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={filter.includeAnonymous ?? true}
            onChange={(e) => onChange({ ...filter, includeAnonymous: e.target.checked })}
          />
          Incluir anônimos
        </label>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
