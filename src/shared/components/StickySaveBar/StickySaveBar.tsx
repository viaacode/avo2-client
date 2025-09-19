import React, { type FC } from 'react';

import { useTranslation } from '../../../shared/hooks/useTranslation';
import { StickyBar } from '../StickyBar/StickyBar';

interface StickySaveBarProps {
	isVisible: boolean;
	isSaving: boolean;
	onSave: () => void;
	onCancel: () => void;
}

export const StickySaveBar: FC<StickySaveBarProps> = ({
	isVisible,
	isSaving,
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
				label: isSaving
					? tText('shared/components/sticky-save-bar/sticky-save-bar___bezig')
					: tText('assignment/views/assignment-edit___opslaan'),
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
