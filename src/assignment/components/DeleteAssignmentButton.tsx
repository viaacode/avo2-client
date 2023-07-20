import { Button, ButtonProps, DefaultProps, IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, useState } from 'react';
import { compose } from 'redux';

import { DeleteObjectModal } from '../../shared/components';
import { ConfirmModalProps } from '../../shared/components/ConfirmModal/ConfirmModal';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { deleteAssignment, deleteAssignmentWarning } from '../helpers/delete-assignment';

export type DeleteAssignmentButtonProps = DefaultProps &
	Partial<UserProps> & {
		assignment?: Avo.Assignment.Assignment;
		button?: Partial<ButtonProps>;
		modal?: Partial<ConfirmModalProps>;
	};

const DeleteAssignmentButton: FC<DeleteAssignmentButtonProps> = ({
	assignment,
	button,
	modal,
	user,
}) => {
	const { tText } = useTranslation();

	const [isOpen, setOpen] = useState<boolean>(false);

	const isOwner =
		!!assignment?.owner_profile_id && assignment?.owner_profile_id === user?.profile?.id;

	return (
		<>
			<Button
				altTitle={tText(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				ariaLabel={tText(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				icon={IconName.delete}
				label={
					isOwner
						? tText('collection/views/collection-detail___verwijder')
						: tText(
								'assignment/components/delete-assignment-button___verwijder-mij-van-deze-opdracht'
						  )
				}
				title={tText(
					'assignment/components/delete-assignment-button___verwijder-de-opdracht'
				)}
				type="borderless"
				{...button}
				onClick={(e) => {
					setOpen(true);
					button?.onClick && button.onClick(e);
				}}
			/>
			<DeleteObjectModal
				title={tText(
					'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
				)}
				body={deleteAssignmentWarning(assignment, user?.profile?.id)}
				{...modal}
				isOpen={isOpen}
				onClose={() => {
					setOpen(false);
					modal?.onClose && modal.onClose();
				}}
				confirmCallback={async () => {
					await deleteAssignment(assignment?.id, user);

					setOpen(false);
					modal?.confirmCallback && modal.confirmCallback();
				}}
			/>
		</>
	);
};

export default compose(withUser)(DeleteAssignmentButton) as FC<DeleteAssignmentButtonProps>;
