// Metadados dos 17 ODS (cor oficial da ONU + nome curto + descrição), para uso visual.
export interface OdsMeta {
  number: number;
  name: string;
  color: string;
  description: string;
}

export const ODS: Record<number, OdsMeta> = {
  1: {
    number: 1,
    name: 'Erradicação da Pobreza',
    color: '#E5243B',
    description: 'Acabar com a pobreza em todas as suas formas, em todos os lugares.',
  },
  2: {
    number: 2,
    name: 'Fome Zero',
    color: '#DDA63A',
    description:
      'Acabar com a fome, alcançar a segurança alimentar e promover a agricultura sustentável.',
  },
  3: {
    number: 3,
    name: 'Saúde e Bem-Estar',
    color: '#4C9F38',
    description: 'Assegurar uma vida saudável e o bem-estar para todos, em todas as idades.',
  },
  4: {
    number: 4,
    name: 'Educação de Qualidade',
    color: '#C5192D',
    description: 'Garantir educação inclusiva, equitativa e de qualidade para todos.',
  },
  5: {
    number: 5,
    name: 'Igualdade de Gênero',
    color: '#FF3A21',
    description: 'Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas.',
  },
  6: {
    number: 6,
    name: 'Água Potável e Saneamento',
    color: '#26BDE2',
    description: 'Garantir a gestão sustentável da água e do saneamento para todos.',
  },
  7: {
    number: 7,
    name: 'Energia Limpa e Acessível',
    color: '#FCC30B',
    description: 'Assegurar acesso a energia confiável, sustentável e renovável para todos.',
  },
  8: {
    number: 8,
    name: 'Trabalho Decente',
    color: '#A21942',
    description: 'Promover o crescimento econômico sustentável e o trabalho decente para todos.',
  },
  9: {
    number: 9,
    name: 'Indústria e Inovação',
    color: '#FD6925',
    description:
      'Construir infraestrutura resiliente e promover a industrialização e a inovação.',
  },
  10: {
    number: 10,
    name: 'Redução das Desigualdades',
    color: '#DD1367',
    description: 'Reduzir as desigualdades dentro dos países e entre eles.',
  },
  11: {
    number: 11,
    name: 'Cidades Sustentáveis',
    color: '#FD9D24',
    description: 'Tornar as cidades inclusivas, seguras, resilientes e sustentáveis.',
  },
  12: {
    number: 12,
    name: 'Consumo Responsável',
    color: '#BF8B2E',
    description: 'Assegurar padrões de produção e consumo sustentáveis.',
  },
  13: {
    number: 13,
    name: 'Ação Climática',
    color: '#3F7E44',
    description: 'Tomar medidas urgentes para combater a mudança climática e seus impactos.',
  },
  14: {
    number: 14,
    name: 'Vida na Água',
    color: '#0A97D9',
    description: 'Conservar e usar de forma sustentável os oceanos, mares e recursos marinhos.',
  },
  15: {
    number: 15,
    name: 'Vida Terrestre',
    color: '#56C02B',
    description:
      'Proteger os ecossistemas terrestres e conter a perda de biodiversidade.',
  },
  16: {
    number: 16,
    name: 'Paz e Justiça',
    color: '#00689D',
    description: 'Promover sociedades pacíficas, justiça e instituições eficazes para todos.',
  },
  17: {
    number: 17,
    name: 'Parcerias',
    color: '#19486A',
    description: 'Fortalecer os meios de implementação e revitalizar a parceria global.',
  },
};

/** Cor do ODS (fallback cinza quando desconhecido). */
export function odsColor(n: number): string {
  return ODS[n]?.color ?? '#64748b';
}

/** Nome do ODS. */
export function odsName(n: number): string {
  return ODS[n]?.name ?? `ODS ${n}`;
}
