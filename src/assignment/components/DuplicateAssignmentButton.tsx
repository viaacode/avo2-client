import { Button, ButtonProps, DefaultProps, IconName } from '@viaa/avo2-components';
import React, { FC, MouseEvent } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import { Assignment_v2_With_Blocks } from '../assignment.types';
import { duplicateAssignment } from '../helpers/duplicate-assignment';
import { Avo } from '@viaa/avo2-types';

export type DuplicateAssignmentButtonProps = DefaultProps &
	Omit<ButtonProps, 'onClick'> & {
		assignment?: Assignment_v2_With_Blocks;
		onClick?(event: MouseEvent<HTMLElement>, duplicated?: Avo.Assignment.Assignment): void;
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
