import { Button, ButtonProps, DefaultProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

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
	const [t] = useTranslation();

	return (
		<Button
			altTitle={t(
				'assignment/components/duplicate-assignment-button___dupliceer-de-opdracht'
			)}
			ariaLabel={t(
				'assignment/components/duplicate-assignment-button___dupliceer-de-opdracht'
			)}
			label={t('assignment/components/duplicate-assignment-button___dupliceer')}
			title={t('assignment/components/duplicate-assignment-button___dupliceer-de-opdracht')}
			type="borderless"
			icon="copy"
			{...props}
			onClick={async (e) => {
				const res = await duplicateAssignment(t, assignment);
				props?.onClick && props?.onClick(e, res);
			}}
		/>
	);
};

export default DuplicateAssignmentButton;
