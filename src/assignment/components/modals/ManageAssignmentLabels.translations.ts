import { TFunction } from 'i18next';

import { ManageAssignmentLabelsProps } from './ManageAssignmentLabels';

export interface ManageAssignmentLabelsTranslations {
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
	t: TFunction,
	type: ManageAssignmentLabelsProps['type']
) => {
	return type === 'LABEL'
		? {
				modal: {
					title: t(
						'assignment/components/modals/manage-assignment-labels___beheer-labels'
					),
				},
				buttons: {
					addLabel: t(
						'assignment/components/modals/manage-assignment-labels___voeg-een-label-toe'
					),
				},
				columns: {
					color: t('assignment/components/modals/manage-assignment-labels___label-kleur'),
					type: t('assignment/components/modals/manage-assignment-labels___label'),
				},
				emptyState: t(
					'assignment/components/modals/manage-assignment-labels___er-zijn-nog-geen-labels-aangemaakt'
				),
		  }
		: {
				modal: {
					title: t(
						'assignment/components/modals/manage-assignment-labels___beheer-klassen'
					),
				},
				buttons: {
					addLabel: t(
						'assignment/components/modals/manage-assignment-labels___voeg-een-klas-toe'
					),
				},
				columns: {
					color: t('assignment/components/modals/manage-assignment-labels___klas-kleur'),
					type: t('assignment/components/modals/manage-assignment-labels___klas'),
				},
				emptyState: t(
					'assignment/components/modals/manage-assignment-labels___er-zijn-nog-geen-klassen-aangemaakt'
				),
		  };
};
