import { tText } from '../../../shared/helpers/translate-text';

import { type ManageLabelsAndClassesProps } from './ManageLabelsClasses';

export interface ManageLabelsClassesTranslations {
	modal: {
		title: string;
	};
	buttons: {
		addLabel: string;
	};
	columns: {
		color: string;
		type: string;
	};
	emptyState: string;
}

export const getManageLabelsTranslations = (
	type: ManageLabelsAndClassesProps['type']
): ManageLabelsClassesTranslations => {
	return type === 'LABEL'
		? {
				modal: {
					title: tText('Beheer labels'),
				},
				buttons: {
					addLabel: tText('Voeg een label toe'),
				},
				columns: {
					color: tText('Label kleur'),
					type: tText('Label'),
				},
				emptyState: tText('Er zijn nog geen labels aangemaakt'),
		  }
		: {
				modal: {
					title: tText('Beheer klassen'),
				},
				buttons: {
					addLabel: tText('Voeg een klas toe'),
				},
				columns: {
					color: tText('Klas kleur'),
					type: tText('Klas'),
				},
				emptyState: tText('Er zijn nog geen klassen aangemaakt'),
		  };
};
