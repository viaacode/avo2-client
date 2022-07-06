import { Button, StickyEdgeBar } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import './StickySaveBar.scss';

export interface StickySaveBarProps {
	isVisible: boolean;
	onSave: () => void;
	onCancel: () => void;
}

export const StickySaveBar: FunctionComponent<StickySaveBarProps> = ({
	isVisible,
	onSave,
	onCancel,
}) => {
	const [t] = useTranslation();

	if (!isVisible) {
		return null;
	}
	return (
		<StickyEdgeBar className="c-sticky-save-bar">
			<p>
				<strong>{t('assignment/views/assignment-edit___wijzigingen-opslaan')}</strong>
			</p>

			<Button label={t('assignment/views/assignment-edit___annuleer')} onClick={onCancel} />

			<Button
				type="tertiary"
				label={t('assignment/views/assignment-edit___opslaan')}
				onClick={onSave}
			/>
		</StickyEdgeBar>
	);
};
