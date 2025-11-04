import { Button, type ButtonProps, IconName } from '@viaa/avo2-components';
import React, { type ReactNode, useState } from 'react';

import {
	CutFragmentModal,
	type CutFragmentModalProps,
} from '../../collection/components/modals/CutFragmentModal';
import { tText } from '../helpers/translate-text';

export function useCutModal(): [
	(props?: Partial<ButtonProps>) => ReactNode,
	(props?: Partial<CutFragmentModalProps>) => ReactNode,
] {
	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);

	const renderButton = (props?: Partial<ButtonProps>) => {
		return (
			<Button
				icon={IconName.scissors}
				label={tText('collection/components/fragment/fragment-edit___knippen')}
				title={tText(
					'collection/components/fragment/fragment-edit___knip-een-fragment-uit-dit-video-audio-fragment'
				)}
				type="secondary"
				{...props}
				onClick={(e) => {
					props?.onClick && props.onClick(e);
					setIsCutModalOpen(true);
				}}
			/>
		);
	};

	const renderModal = (props?: Partial<CutFragmentModalProps>) => {
		return (
			props?.itemMetaData && (
				<CutFragmentModal
					{...(props as CutFragmentModalProps)}
					isOpen={isCutModalOpen}
					onClose={() => {
						props?.onClose && props.onClose();
						setIsCutModalOpen(false);
					}}
				/>
			)
		);
	};

	return [renderButton, renderModal];
}
