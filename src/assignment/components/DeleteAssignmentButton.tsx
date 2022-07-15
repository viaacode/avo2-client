import { Button, ButtonProps, DefaultProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { compose } from 'redux';

import { DeleteObjectModal } from '../../shared/components';
import { ConfirmModalProps } from '../../shared/components/ConfirmModal/ConfirmModal';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { deleteAssignment, deleteAssignmentWarning } from '../helpers/delete-assignment';

export type DeleteAssignmentButtonProps = DefaultProps &
	Partial<UserProps> & {
		assignment?: Avo.Assignment.Assignment_v2;
		button?: Partial<ButtonProps>;
		modal?: Partial<ConfirmModalProps>;
	};

const DeleteAssignmentButton: FC<DeleteAssignmentButtonProps> = ({
	assignment,
	button,
	modal,
	user,
}) => {
	const [t] = useTranslation();

	const [isOpen, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button
				altTitle={t(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				ariaLabel={t(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				icon="delete"
				label={t('assignment/components/delete-assignment-button___verwijder')}
				title={t('assignment/components/delete-assignment-button___verwijder-de-opdracht')}
				type="borderless"
				{...button}
				onClick={(e) => {
					setOpen(true);
					button?.onClick && button.onClick(e);
				}}
			/>
			<DeleteObjectModal
				title={t(
					'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
				)}
				body={deleteAssignmentWarning(t, assignment)}
				{...modal}
				isOpen={isOpen}
				onClose={() => {
					setOpen(false);
					modal?.onClose && modal.onClose();
				}}
				deleteObjectCallback={async () => {
					await deleteAssignment(t, assignment?.id, user);

					setOpen(false);
					modal?.deleteObjectCallback && modal.deleteObjectCallback();
				}}
			/>
		</>
	);
};

export default compose(withUser)(DeleteAssignmentButton) as FC<DeleteAssignmentButtonProps>;
