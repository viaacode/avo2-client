import { AvoLomLom, AvoLomLomField, AvoLomLomSchemeType, type AvoLomLomType, } from '@viaa/avo2-types';
import { compact, groupBy } from 'es-toolkit';

import { type LomFieldsByScheme } from '../types/lom';

export enum EducationLevelId {
  kleuteronderwijs = 'https://w3id.org/onderwijs-vlaanderen/id/structuur/kleuteronderwijs',
  lagerOnderwijs = 'https://w3id.org/onderwijs-vlaanderen/id/structuur/lager-onderwijs',
  deeltijdsKunstonderwijs = 'https://w3id.org/onderwijs-vlaanderen/id/structuur/deeltijds-kunstonderwijs',
  secundairOnderwijs = 'https://w3id.org/onderwijs-vlaanderen/id/structuur/secundair-onderwijs',
  hogerOnderwijs = 'https://w3id.org/onderwijs-vlaanderen/id/structuur/hoger-onderwijs',
  volwassenenOnderwijs = 'https://w3id.org/onderwijs-vlaanderen/id/structuur/volwassenenonderwijs',
  andere = 'andere',
}

export enum EducationLevelType {
  structuur = 'https://w3id.org/onderwijs-vlaanderen/id/structuur',
  thema = 'https://data.hetarchief.be/id/onderwijs/thema',
  vak = 'https://w3id.org/onderwijs-vlaanderen/id/vak',
}

const EDUCATION_LEVEL_IDS = Object.values(EducationLevelId);

export const groupLoms = (
  loms: AvoLomLomField[] | undefined | null,
): LomFieldsByScheme => {
  const groupedLoms = groupBy(loms || [], (lom) => lom?.scheme || '');

  return {
    educationLevel: (groupedLoms[AvoLomLomSchemeType.structure] || []).filter(
      (lom) => EDUCATION_LEVEL_IDS.includes(lom.id as EducationLevelId),
    ),
    educationDegree: (groupedLoms[AvoLomLomSchemeType.structure] || []).filter(
      (lom) => !EDUCATION_LEVEL_IDS.includes(lom.id as EducationLevelId),
    ),
    subject:
      (groupedLoms[AvoLomLomSchemeType.subject] as AvoLomLomField[]) || [],
    theme: (groupedLoms[AvoLomLomSchemeType.theme] as AvoLomLomField[]) || [],
  };
};

export const groupLomLinks = (
  lomLinks: AvoLomLom[] | undefined | null,
): LomFieldsByScheme => {
  const groupedLoms = groupBy(
    compact((lomLinks || []).map((lomLink) => lomLink.lom)),
    (lom) => lom?.scheme || '',
  );

  return {
    educationLevel: (groupedLoms[AvoLomLomSchemeType.structure] || []).filter(
      (lom) =>
        lom?.id && EDUCATION_LEVEL_IDS.includes(lom?.id as EducationLevelId),
    ),
    educationDegree: (groupedLoms[AvoLomLomSchemeType.structure] || []).filter(
      (lom) =>
        lom?.id && !EDUCATION_LEVEL_IDS.includes(lom?.id as EducationLevelId),
    ),
    subject: groupedLoms[AvoLomLomSchemeType.subject] || [],
    theme: groupedLoms[AvoLomLomSchemeType.theme] || [],
  };
};

export const getGroupedLomsKeyValue = (
  loms: AvoLomLom[],
  lomKey: keyof AvoLomLomField,
): Record<AvoLomLomType, string[]> => {
  return Object.fromEntries(
    Object.entries(groupLoms(compact(loms.map((lom) => lom.lom)))).map(
      ([key, value]) => [key, value.map((val) => val[lomKey])],
    ),
  ) as Record<AvoLomLomType, string[]>;
};
