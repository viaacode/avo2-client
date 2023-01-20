import { Button, ButtonProps } from '@viaa/avo2-components';
import React, { FC } from 'react';

import useTranslation from '../../../../shared/hooks/useTranslation';

export const Back: FC<ButtonProps> = (props) => {
	const [t] = useTranslation();

	return (
		<Button
			className="c-top-bar__back"
			icon="chevron-left"
			ariaLabel={t('Ga terug naar het vorig scherm')}
			title={t('Ga terug naar het vorig scherm')}
			type="borderless"
			{...props}
		/>
	);
};
