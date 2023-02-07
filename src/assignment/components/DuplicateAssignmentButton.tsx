import { Button, ButtonProps, DefaultProps, IconName } from '@viaa/avo2-components';
import React, { FC, MouseEvent } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import { Assignment_v2 } from '../assignment.types';
import { duplicateAssignment } from '../helpers/duplicate-assignment';

export type DuplicateAssignmentButtonProps = DefaultProps &
	Omit<ButtonProps, 'onClick'> & {
		assignment?: Assignment_v2;
		onClick?(event: MouseEvent<HTMLElement>, duplicated?: Assignment_v2): void;
	};

const DuplicateAssignmentButton: FC<DuplicateAssignmentButtonProps> = ({
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
				const res = await duplicateAssignment(assignment);
				props?.onClick && props?.onClick(e, res);
			}}
		/>
	);
};

export default DuplicateAssignmentButton;
