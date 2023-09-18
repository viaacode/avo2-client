import { Button, ButtonProps, DefaultProps, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { FC, MouseEvent } from 'react';

import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { duplicateAssignment } from '../helpers/duplicate-assignment';

export type DuplicateAssignmentButtonProps = DefaultProps &
	Omit<ButtonProps, 'onClick'> & {
		assignment?: Avo.Assignment.Assignment;
		onClick?(event: MouseEvent<HTMLElement>, duplicated?: Avo.Assignment.Assignment): void;
	};

const DuplicateAssignmentButton: FC<DuplicateAssignmentButtonProps & UserProps> = ({
	user,
	assignment,
	...props
}) => {
	const { tText } = useTranslation();

	return (
		<Button
			altTitle={tText(
				'assignment/components/duplicate-assignment-button___dupliceer-de-opdracht'
			)}
			ariaLabel={tText(
				'assignment/components/duplicate-assignment-button___dupliceer-de-opdracht'
			)}
			label={tText('assignment/components/duplicate-assignment-button___dupliceer')}
			title={tText(
				'assignment/components/duplicate-assignment-button___dupliceer-de-opdracht'
			)}
			type="borderless"
			icon={IconName.copy}
			{...props}
			onClick={async (e) => {
				if (!user?.profile?.id) {
					ToastService.danger(
						'Je moet ingelogd zijn om een opdracht te kunnen dupliceren'
					);
					return;
				}
				const res = await duplicateAssignment(assignment, user.profile.id);
				props?.onClick && props?.onClick(e, res);
			}}
		/>
	);
};

export default withUser(DuplicateAssignmentButton) as FC<DuplicateAssignmentButtonProps>;
