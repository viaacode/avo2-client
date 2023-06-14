import { Button, ButtonProps, DefaultProps, IconName } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { FC, MouseEvent } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import { duplicateAssignment } from '../helpers/duplicate-assignment';

export type DuplicateAssignmentButtonProps = DefaultProps &
	Omit<ButtonProps, 'onClick'> & {
		assignment?: Avo.Assignment.Assignment;
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
