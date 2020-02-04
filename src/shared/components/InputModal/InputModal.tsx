import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	ButtonToolbar,
	FormGroup,
	Modal,
	ModalBody,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

import toastService from '../../services/toast-service';
import i18n from '../../translations/i18n';

interface InputModalProps {
	title?: string;
	inputLabel?: string;
	cancelLabel?: string;
	confirmLabel?: string;
	inputValue?: string;
	inputPlaceholder?: string;
	isOpen: boolean;
	onClose?: () => void;
	inputCallback: (input: string) => void;
	emptyMessage?: string;
}

const InputModal: FunctionComponent<InputModalProps> = ({
	inputValue,
	inputCallback,
	isOpen,
	title = i18n.t('Vul in'),
	inputLabel = '',
	inputPlaceholder = '',
	cancelLabel = i18n.t('Annuleer'),
	confirmLabel = i18n.t('Opslaan'),
	onClose = () => {},
	emptyMessage = i18n.t('Gelieve een waarde in te vullen.'),
}) => {
	const [input, setInput] = useState<string>(inputValue || '');

	// Listeners
	const onClickClose = () => {
		onClose();
		setInput(inputValue || '');
	};

	const onClickConfirm = () => {
		if (!input) {
			toastService.danger(emptyMessage);
			return null;
		}

		onClose();
		inputCallback(input);
	};

	// Render
	return (
		<Modal isOpen={isOpen} title={title} size="small" onClose={onClickClose} scrollable>
			<ModalBody>
				<Spacer margin="bottom-large">
					<FormGroup label={inputLabel} labelFor="collectionNameId">
						<TextInput
							type="text"
							value={input}
							onChange={setInput}
							placeholder={inputPlaceholder}
						/>
					</FormGroup>
				</Spacer>
				<Toolbar>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button type="secondary" label={cancelLabel} onClick={onClickClose} />
								<Button type="primary" label={confirmLabel} onClick={onClickConfirm} />
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default InputModal;
