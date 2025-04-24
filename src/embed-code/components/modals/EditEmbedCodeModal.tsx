import { Modal, ModalBody } from '@viaa/avo2-components';
import React, { type FC, type ReactNode } from 'react';

import EmbedContent from '../../../embed-code/components/EmbedContent';
import { tHtml } from '../../../shared/helpers/translate-html';
import { type EmbedCode, EmbedCodeExternalWebsite } from '../../embed-code.types';

import './EditEmbedCodeModal.scss';

type EditEmbedCodeModalProps = {
	embedCode?: EmbedCode;
	isOpen: boolean;
	onClose: () => void;
};

const EditEmbedCodeModal: FC<EditEmbedCodeModalProps> = ({ embedCode, isOpen, onClose }) => {
	const renderEmbedContentDescription = (): string | ReactNode => {
		switch (embedCode?.externalWebsite) {
			case EmbedCodeExternalWebsite.SMARTSCHOOL:
				return tHtml(
					'Let op! De aanpassingen komen meteen door overal waar je dit fragment insloot in Smartschool'
				);
			case EmbedCodeExternalWebsite.BOOKWIDGETS:
				return tHtml(
					'Let op! De aanpassingen komen meteen door overal waar je dit fragment insloot in Bookwidgets'
				);
			default:
				return '';
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			size="large"
			scrollable={true}
			onClose={onClose}
			disablePageScroll={true}
			title={tHtml('Fragment bewerken')}
		>
			<ModalBody>
				<EmbedContent
					item={embedCode}
					contentDescription={renderEmbedContentDescription()}
					onClose={onClose}
					onSave={(data) => console.log(data)}
				/>
			</ModalBody>
		</Modal>
	);
};

export default EditEmbedCodeModal as FC<EditEmbedCodeModalProps>;
