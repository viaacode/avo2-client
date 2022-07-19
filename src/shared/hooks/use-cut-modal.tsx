import { Button, ButtonProps } from '@viaa/avo2-components';
import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CutFragmentModal, {
	CutFragmentModalProps,
} from '../../collection/components/modals/CutFragmentModal';

export function useCutModal(): [
	(props?: Partial<ButtonProps>) => ReactNode,
	(props?: Partial<CutFragmentModalProps>) => ReactNode
] {
	const [t] = useTranslation();

	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);

	const renderButton = (props?: Partial<ButtonProps>) => {
		return (
			<Button
				icon="scissors"
				label={t('collection/components/fragment/fragment-edit___knippen')}
				title={t(
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
