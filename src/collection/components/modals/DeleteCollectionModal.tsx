import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteCollectionModalProps {
	isOpen: boolean;
	onClose?: () => void;
	deleteObjectCallback: () => void;
}

const DeleteCollectionModal: FunctionComponent<DeleteCollectionModalProps> = ({
	isOpen,
	onClose,
	deleteObjectCallback,
}) => {
	const [t] = useTranslation();

	const handleDelete = async () => {
		deleteObjectCallback();
		(onClose || noop)();
	};

	const renderConfirmButtons = () => {
		return (
			<Toolbar spaced>
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={t(
									'collection/components/modals/delete-collection-modal___annuleer'
								)}
								onClick={onClose}
							/>
							<Button
								type="danger"
								label={t(
									'collection/components/modals/delete-collection-modal___verwijder'
								)}
								onClick={handleDelete}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'collection/components/modals/delete-collection-modal___verwijder-deze-collectie'
			)}
			size="large"
			onClose={onClose}
			scrollable
			className="c-content"
		>
			<ModalBody>
				<p>
					{t(
						'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-deze-collectie-wil-verwijderen'
					)}
					<br />
					{t(
						'collection/components/modals/delete-collection-modal___deze-operatie-kan-niet-meer-ongedaan-gemaakt-worden'
					)}
				</p>
				{renderConfirmButtons()}
			</ModalBody>
		</Modal>
	);
};

export default DeleteCollectionModal;
