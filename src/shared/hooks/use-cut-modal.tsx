import { Button, ButtonProps, IconName } from '@viaa/avo2-components';
import React, { ReactNode, useState } from 'react';

import CutFragmentModal, {
	CutFragmentModalProps,
} from '../../collection/components/modals/CutFragmentModal';
import useTranslation from '../../shared/hooks/useTranslation';

export function useCutModal(): [
	(props?: Partial<ButtonProps>) => ReactNode,
	(props?: Partial<CutFragmentModalProps>) => ReactNode,
] {
	const { tText } = useTranslation();

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
