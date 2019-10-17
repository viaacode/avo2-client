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
}

const InputModal: FunctionComponent<InputModalProps> = ({
	title = 'Vul in',
	inputLabel = '',
	inputValue,
	inputPlaceholder = '',
	cancelLabel = 'Annuleer',
	confirmLabel = 'Opslaan',
	onClose = () => {},
	isOpen,
	inputCallback,
}) => {
	const [input, setInput] = useState<string>(inputValue || '');

	const handleConfirm = () => {
		onClose();
		inputCallback(input);
	};

	return (
		<Modal isOpen={isOpen} title={title} size="small" onClose={onClose} scrollable={true}>
			<ModalBody>
				<>
					<Spacer margin="bottom-large">
						<FormGroup label={inputLabel} labelFor="collectionNameId">
							<TextInput
								type="text"
								value={input || inputValue}
								onChange={setInput}
								placeholder={inputPlaceholder}
							/>
						</FormGroup>
					</Spacer>
					<Toolbar>
						<ToolbarRight>
							<ToolbarItem>
								<ButtonToolbar>
									<Button type="secondary" label={cancelLabel} onClick={onClose} />
									<Button type="primary" label={confirmLabel} onClick={handleConfirm} />
								</ButtonToolbar>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</>
			</ModalBody>
		</Modal>
	);
};

export default InputModal;
