import { EducationLevelId } from '../../helpers/lom';
import { tHtml } from '../../helpers/translate';

export const LevelDifferenceDict: Partial<Record<string, React.ReactNode>> = {
	[EducationLevelId.secundairOnderwijs]: tHtml(
		'shared/components/share-with-colleagues/share-with-colleagues___jouw-opdracht-is-gericht-naar-het-secundair-onderwijs'
	),
	[EducationLevelId.lagerOnderwijs]: tHtml(
		'shared/components/share-with-colleagues/share-with-colleagues___jouw-opdracht-is-gericht-naar-het-lager-onderwijs'
	),
};
