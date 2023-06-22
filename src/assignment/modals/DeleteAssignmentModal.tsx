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

import useTranslation from '../../shared/hooks/useTranslation';

interface DeleteAssignmentModalProps {
	isOpen: boolean;
	onClose?: () => void;
	deleteObjectCallback: () => void;
	isContributor: boolean;
	isSharedWithOthers: boolean;
	contributorCount: number;
}

const DeleteAssignmentModal: FunctionComponent<DeleteAssignmentModalProps> = ({
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
							<Button type="secondary" label={tText('Annuleer')} onClick={onClose} />
							<Button
								type="danger"
								label={tText('verwijder')}
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
				'Ben je zeker dat je jezelf van deze opdracht wil wissen? Deze opdracht is met {{count}} andere mensen gedeeld. Deze verliezen dan toegang.',
				{ count: contributorCount }
			);
		}

		if (isContributor) {
			return tText('Ben je zeker dat je jezelf van deze opdracht wil wissen?');
		}

		return tText('Ben je zeker dat je deze opdracht wil verwijderen?');
	};

	const renderDeleteMessage = () => {
		return (
			<p>
				{renderDeleteMessageParagraph()}
				<br />
				{tText('Opgelet! Deze actie kan niet ongedaan gemaakt worden.')}
			</p>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={
				isContributor
					? tHtml('Verwijder mij van deze opdracht')
					: tHtml('Verwijder deze opdracht')
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

export default DeleteAssignmentModal;
