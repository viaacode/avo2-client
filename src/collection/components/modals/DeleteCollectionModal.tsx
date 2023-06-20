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

import useTranslation from '../../../shared/hooks/useTranslation';

interface DeleteCollectionModalProps {
	isOpen: boolean;
	onClose?: () => void;
	deleteObjectCallback: () => void;
	isContributor: boolean;
	isSharedWithOthers: boolean;
	contributorCount: number;
}

const DeleteCollectionModal: FunctionComponent<DeleteCollectionModalProps> = ({
	isOpen,
	onClose = noop,
	deleteObjectCallback,
	isContributor,
	isSharedWithOthers,
	contributorCount,
}) => {
	const { tText, tHtml } = useTranslation();

	const handleDelete = async () => {
		deleteObjectCallback();
		onClose();
	};

	const renderConfirmButtons = () => {
		return (
			<Toolbar spaced>
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={tText(
									'collection/components/modals/delete-collection-modal___annuleer'
								)}
								onClick={onClose}
							/>
							<Button
								type="danger"
								label={tText(
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

	const renderDeleteMessageParagraph = () => {
		if (isSharedWithOthers) {
			return tText(
				'Ben je zeker dat je jezelf van deze collectie wil wissen? Deze opdracht is met {{count}} andere mensen gedeeld. Deze verliezen dan toegang.',
				{ count: contributorCount }
			);
		}

		if (isContributor) {
			return tText('Ben je zeker dat je jezelf van deze collectie wil wissen?');
		}

		return tText('Ben je zeker dat je deze collectie wil verwijderen');
	};

	const renderDeleteMessage = () => {
		return (
			<p>
				{renderDeleteMessageParagraph()}
				<br />
				{tText(
					'collection/components/modals/delete-collection-modal___deze-operatie-kan-niet-meer-ongedaan-gemaakt-worden'
				)}
			</p>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={
				isContributor
					? tHtml('Verwijder mij van deze collectie')
					: tHtml(
							'collection/components/modals/delete-collection-modal___verwijder-deze-collectie'
					  )
			}
			size="large"
			onClose={onClose}
			scrollable
			className="c-content"
		>
			<ModalBody>
				{renderDeleteMessage()}
				{renderConfirmButtons()}
			</ModalBody>
		</Modal>
	);
};

export default DeleteCollectionModal;
