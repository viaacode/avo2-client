import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

interface ConfirmImportToAssignmentWithResponsesModalProps {
	isOpen: boolean;
	onClose?: () => void;
	confirmCallback: () => void;
}

const ConfirmImportToAssignmentWithResponsesModal: FunctionComponent<ConfirmImportToAssignmentWithResponsesModalProps> = ({
	isOpen,
	onClose,
	confirmCallback,
}) => {
	const [t] = useTranslation();

	const renderConfirmButtons = () => {
		return (
			<Toolbar spaced>
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={t('assignment/modals/create-assignment-modal___annuleer')}
								onClick={onClose}
							/>
							<Button
								type="primary"
								label={t('assignment/modals/create-assignment-modal___importeer')}
								onClick={confirmCallback}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	const renderModalBody = () => {
		return (
			<>
				<p>
					<strong>
						{t(
							'assignment/modals/confirm-import-to-assignment-with-responses-modal___opgelet'
						)}
					</strong>
					{t(
						'assignment/modals/confirm-import-to-assignment-with-responses-modal___leerlingen-hebben-deze-opdracht-reeds-bekeken'
					)}
				</p>
				<p>
					{t(
						'assignment/modals/confirm-import-to-assignment-with-responses-modal___ben-je-zeker-dat-je-de-collectie-wil-importeren-tot-deze-opdracht'
					)}
				</p>
				{renderConfirmButtons()}
			</>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'assignment/modals/confirm-import-to-assignment-with-responses-modal___collectie-importeren'
			)}
			size="medium"
			onClose={onClose}
			scrollable
			className="c-content"
		>
			<ModalBody>{renderModalBody()}</ModalBody>
		</Modal>
	);
};

export default ConfirmImportToAssignmentWithResponsesModal;
