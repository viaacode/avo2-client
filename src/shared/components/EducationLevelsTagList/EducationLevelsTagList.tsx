import { TagList, type TagOption } from '@viaa/avo2-components';
import { clsx } from 'clsx';
import { compact, sortBy } from 'lodash-es';
import React, { type FC, useMemo } from 'react';

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
	[EducationLevel.hogeronderwijs]: 5,
	[EducationLevel.volwassenenonderwijs]: 6,
	[EducationLevel.andere]: 7,
};

const GET_EDUCATION_LEVEL_LABELS: () => Record<EducationLevel, string> = () => ({
	[EducationLevel.kleuteronderwijs]: tText('Kleuter'),
	[EducationLevel.lageronderwijs]: tText('Lager'),
	[EducationLevel.secundaironderwijs]: tText('Secundair'),
	[EducationLevel.deeltijdskunstonderwijs]: tText('DKO'),
	[EducationLevel.hogeronderwijs]: tText('Hoger'),
	[EducationLevel.volwassenenonderwijs]: tText('Volwassenen'),
	[EducationLevel.andere]: tText('Ander'),
});

interface EducationLevelsTagListProps {
	loms: string[];
	className?: string;
}

const EducationLevelsTagList: FC<EducationLevelsTagListProps> = ({ loms, className }) => {
	const mappedLoms = useMemo(() => {
		const labels = GET_EDUCATION_LEVEL_LABELS();

		return sortBy(
			compact(
				loms?.map((lomEntry) => {
					const key = lomEntry.toLowerCase().replaceAll(' ', '');
					const label = labels[key as EducationLevel];

					return {
						label: label,
						id: key,
						className: clsx('c-education-levels-tag', `c-education-levels-tag__${key}`),
					} as TagOption;
				})
			),
			(option) => preferredOrder[option.id as EducationLevel]
		);
	}, [loms]);

	return <TagList className={className} tags={mappedLoms} closable={false} swatches={false} />;
};

export default EducationLevelsTagList;
