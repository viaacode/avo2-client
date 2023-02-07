import { Button, StickyEdgeBar } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';

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
	const { tText, tHtml } = useTranslation();

	if (!isVisible) {
		return null;
	}
	return (
		<StickyEdgeBar className="c-sticky-save-bar">
			<strong className="c-sticky-save-bar__cta">
				{tHtml('assignment/views/assignment-edit___wijzigingen-opslaan')}
			</strong>

			<Button
				className="u-spacer-right-s"
				label={tText('assignment/views/assignment-edit___annuleer')}
				onClick={onCancel}
			/>

			<Button
				type="tertiary"
				label={tText('assignment/views/assignment-edit___opslaan')}
				onClick={onSave}
			/>
		</StickyEdgeBar>
	);
};
