import React, { FunctionComponent } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

interface CutFragmentModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

const CutFragmentModal: FunctionComponent<CutFragmentModalProps> = ({ setIsOpen, isOpen }) => {
	const onSaveCut = () => {};

	return (
		<Modal
			isOpen={isOpen}
			title="Knip fragment"
			size="medium"
			onClose={() => setIsOpen(!isOpen)}
			scrollable={true}
		>
			<ModalBody>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<div className="c-button-toolbar">
								<Button type="secondary" label="Annuleren" onClick={() => setIsOpen(false)} />
								<Button type="primary" label="Knippen" onClick={onSaveCut} />
							</div>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default CutFragmentModal;
