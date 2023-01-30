import { Button, ButtonProps } from '@viaa/avo2-components';
import React, { FC } from 'react';

import useTranslation from '../../../../shared/hooks/useTranslation';

export const Back: FC<ButtonProps> = (props) => {
	const { tText } = useTranslation();

	return (
		<Button
			className="c-top-bar__back"
			icon="chevron-left"
			ariaLabel={tText('admin/shared/components/back/back___ga-terug-naar-het-vorig-scherm')}
			title={tText('admin/shared/components/back/back___ga-terug-naar-het-vorig-scherm')}
			type="borderless"
			{...props}
		/>
	);
};
