import { AvoAssignmentLabelType } from '@viaa/avo2-types';
import { tText } from '../../../shared/helpers/translate-text';
import { type ManageAssignmentLabelsProps } from './ManageAssignmentLabels';

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
  type: ManageAssignmentLabelsProps['type'],
): ManageAssignmentLabelsTranslations => {
  return type === AvoAssignmentLabelType.LABEL
    ? {
        modal: {
          title: tText(
            'assignment/components/modals/manage-assignment-labels___beheer-labels',
          ),
        },
        buttons: {
          addLabel: tText(
            'assignment/components/modals/manage-assignment-labels___voeg-een-label-toe',
          ),
        },
        columns: {
          color: tText(
            'assignment/components/modals/manage-assignment-labels___label-kleur',
          ),
          type: tText(
            'assignment/components/modals/manage-assignment-labels___label',
          ),
        },
        emptyState: tText(
          'assignment/components/modals/manage-assignment-labels___er-zijn-nog-geen-labels-aangemaakt',
        ),
      }
    : {
        modal: {
          title: tText(
            'assignment/components/modals/manage-assignment-labels___beheer-klassen',
          ),
        },
        buttons: {
          addLabel: tText(
            'assignment/components/modals/manage-assignment-labels___voeg-een-klas-toe',
          ),
        },
        columns: {
          color: tText(
            'assignment/components/modals/manage-assignment-labels___klas-kleur',
          ),
          type: tText(
            'assignment/components/modals/manage-assignment-labels___klas',
          ),
        },
        emptyState: tText(
          'assignment/components/modals/manage-assignment-labels___er-zijn-nog-geen-klassen-aangemaakt',
        ),
      };
};
