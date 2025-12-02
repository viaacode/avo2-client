import { TagList, type TagOption } from '@viaa/avo2-components';
import { clsx } from 'clsx';
import { compact, sortBy } from 'es-toolkit';
import { type FC, useMemo } from 'react';

import { tText } from '../../helpers/translate-text';
import './EducationLevelsTagList.scss';

enum EducationLevel {
  kleuteronderwijs = 'kleuteronderwijs',
  lageronderwijs = 'lageronderwijs',
  secundaironderwijs = 'secundaironderwijs',
  deeltijdskunstonderwijs = 'deeltijdskunstonderwijs',
  hogeronderwijs = 'hogeronderwijs',
  volwassenenonderwijs = 'volwassenenonderwijs',
  andere = 'andere',
}
const preferredOrder: Record<EducationLevel, number> = {
  [EducationLevel.kleuteronderwijs]: 1,
  [EducationLevel.lageronderwijs]: 2,
  [EducationLevel.secundaironderwijs]: 3,
  [EducationLevel.deeltijdskunstonderwijs]: 4,
  [EducationLevel.volwassenenonderwijs]: 5,
  [EducationLevel.hogeronderwijs]: 6,
  [EducationLevel.andere]: 7,
};

const GET_EDUCATION_LEVEL_LABELS: () => Record<EducationLevel, string> =
  () => ({
    [EducationLevel.kleuteronderwijs]: tText(
      'shared/components/education-levels-tag-list/education-levels-tag-list___kleuter',
    ),
    [EducationLevel.lageronderwijs]: tText(
      'shared/components/education-levels-tag-list/education-levels-tag-list___lager',
    ),
    [EducationLevel.secundaironderwijs]: tText(
      'shared/components/education-levels-tag-list/education-levels-tag-list___secundair',
    ),
    [EducationLevel.deeltijdskunstonderwijs]: tText(
      'shared/components/education-levels-tag-list/education-levels-tag-list___dko',
    ),
    [EducationLevel.hogeronderwijs]: tText(
      'shared/components/education-levels-tag-list/education-levels-tag-list___hoger',
    ),
    [EducationLevel.volwassenenonderwijs]: tText(
      'shared/components/education-levels-tag-list/education-levels-tag-list___volwassenen',
    ),
    [EducationLevel.andere]: tText(
      'shared/components/education-levels-tag-list/education-levels-tag-list___ander',
    ),
  });

interface EducationLevelsTagListProps {
  loms: string[];
  className?: string;
}

const EducationLevelsTagList: FC<EducationLevelsTagListProps> = ({
  loms,
  className,
}) => {
  const mappedLoms = useMemo(() => {
    const labels = GET_EDUCATION_LEVEL_LABELS();

    const tagOptions = compact(
      loms?.map((lomEntry): TagOption => {
        const key = lomEntry.toLowerCase().replaceAll(' ', '');
        const label = labels[key as EducationLevel];

        return {
          label: label,
          id: key,
          className: clsx(
            'c-education-levels-tag',
            `c-education-levels-tag__${key}`,
          ),
        } as TagOption;
      }),
    );
    return sortBy(tagOptions, [
      (option) => preferredOrder[option.id as EducationLevel],
    ]);
  }, [loms]);

  return (
    <TagList
      className={className}
      tags={mappedLoms}
      closable={false}
      swatches={false}
    />
  );
};

export default EducationLevelsTagList;
