import { noop } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import ConfirmModal from '../../shared/components/ConfirmModal/ConfirmModal';
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
		<ConfirmModal
			isOpen={isOpen}
			title={
				isContributor
					? tHtml('Verwijder mij van deze opdracht')
					: tHtml('Verwijder deze opdracht')
			}
			body={renderDeleteMessage()}
			cancelLabel={tText('Annuleer')}
			confirmLabel={tText('verwijder')}
			size="large"
			onClose={onClose}
			className="c-content"
			confirmCallback={handleDelete}
		/>
	);
};

export default DeleteAssignmentModal;
