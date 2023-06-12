import React, { FunctionComponent } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';
import { StickyBar } from '../StickyBar/StickyBar';

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
		<StickyBar
			title={tHtml('assignment/views/assignment-edit___wijzigingen-opslaan')}
			isVisible={isVisible}
			actionButtonProps={{
				label: tText('assignment/views/assignment-edit___opslaan'),
				onClick: onSave,
				type: 'tertiary',
			}}
			cancelButtonProps={{
				label: tText('assignment/views/assignment-edit___annuleer'),
				onClick: onCancel,
			}}
		/>
	);
};
