import { type ReactNode } from 'react'

import { EducationLevelId } from '../../helpers/lom';
import { tHtml } from '../../helpers/translate-html';

export const GET_EDUCATION_LEVEL_DIFFERENCE_DICT: () => Partial<
  Record<string, ReactNode>
> = () => ({
  [EducationLevelId.secundairOnderwijs]: tHtml(
    'shared/components/share-with-colleagues/share-with-colleagues___jouw-opdracht-is-gericht-naar-het-secundair-onderwijs',
  ),
  [EducationLevelId.lagerOnderwijs]: tHtml(
    'shared/components/share-with-colleagues/share-with-colleagues___jouw-opdracht-is-gericht-naar-het-lager-onderwijs',
  ),
})
