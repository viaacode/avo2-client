import { type Avo, LomSchemeType, type LomType } from '@viaa/avo2-types'
import { compact, groupBy } from 'es-toolkit'

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

const EDUCATION_LEVEL_IDS = Object.values(EducationLevelId)

export const groupLoms = (
  loms: Avo.Lom.LomField[] | undefined | null,
): LomFieldsByScheme => {
  const groupedLoms = groupBy(loms || [], (lom) => lom?.scheme || '')

  return {
    educationLevel: (groupedLoms[LomSchemeType.structure] || []).filter((lom) =>
      EDUCATION_LEVEL_IDS.includes(lom.id as EducationLevelId),
    ),
    educationDegree: (groupedLoms[LomSchemeType.structure] || []).filter(
      (lom) => !EDUCATION_LEVEL_IDS.includes(lom.id as EducationLevelId),
    ),
    subject: (groupedLoms[LomSchemeType.subject] as Avo.Lom.LomField[]) || [],
    theme: (groupedLoms[LomSchemeType.theme] as Avo.Lom.LomField[]) || [],
  }
}

export const groupLomLinks = (
  lomLinks: Avo.Lom.Lom[] | undefined | null,
): LomFieldsByScheme => {
  const groupedLoms = groupBy(
    compact((lomLinks || []).map((lomLink) => lomLink.lom)),
    (lom) => lom?.scheme || '',
  )

  return {
    educationLevel: (groupedLoms[LomSchemeType.structure] || []).filter(
      (lom) =>
        lom?.id && EDUCATION_LEVEL_IDS.includes(lom?.id as EducationLevelId),
    ),
    educationDegree: (groupedLoms[LomSchemeType.structure] || []).filter(
      (lom) =>
        lom?.id && !EDUCATION_LEVEL_IDS.includes(lom?.id as EducationLevelId),
    ),
    subject: groupedLoms[LomSchemeType.subject] || [],
    theme: groupedLoms[LomSchemeType.theme] || [],
  }
}

export const getGroupedLomsKeyValue = (
  loms: Avo.Lom.Lom[],
  lomKey: keyof Avo.Lom.LomField,
): Record<LomType, string[]> => {
  return Object.fromEntries(
    Object.entries(groupLoms(compact(loms.map((lom) => lom.lom)))).map(
      ([key, value]) => [key, value.map((val) => val[lomKey])],
    ),
  ) as Record<LomType, string[]>
}
