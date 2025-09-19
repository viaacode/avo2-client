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

export const getManageAssignmentLabelsTranslations = (
	type: ManageLabelsAndClassesProps['type']
): ManageLabelsClassesTranslations => {
	return type === 'LABEL'
		? {
				modal: {
					title: tText(
						'assignment/components/modals/manage-assignment-labels___beheer-labels'
					),
				},
				buttons: {
					addLabel: tText(
						'assignment/components/modals/manage-assignment-labels___voeg-een-label-toe'
					),
				},
				columns: {
					color: tText(
						'assignment/components/modals/manage-assignment-labels___label-kleur'
					),
					type: tText('assignment/components/modals/manage-assignment-labels___label'),
				},
				emptyState: tText(
					'assignment/components/modals/manage-assignment-labels___er-zijn-nog-geen-labels-aangemaakt'
				),
		  }
		: {
				modal: {
					title: tText(
						'assignment/components/modals/manage-assignment-labels___beheer-klassen'
					),
				},
				buttons: {
					addLabel: tText(
						'assignment/components/modals/manage-assignment-labels___voeg-een-klas-toe'
					),
				},
				columns: {
					color: tText(
						'assignment/components/modals/manage-assignment-labels___klas-kleur'
					),
					type: tText('assignment/components/modals/manage-assignment-labels___klas'),
				},
				emptyState: tText(
					'assignment/components/modals/manage-assignment-labels___er-zijn-nog-geen-klassen-aangemaakt'
				),
		  };
};
