import { noop } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import ConfirmModal from '../../../shared/components/ConfirmModal/ConfirmModal';
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

	const renderDeleteMessageParagraph = () => {
		if (isSharedWithOthers) {
			return tText(
				'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-jezelf-van-deze-collectie-wil-wissen-deze-opdracht-is-met-count-andere-mensen-gedeeld-deze-verliezen-dan-toegang',
				{ count: contributorCount }
			);
		}

		if (isContributor) {
			return tText(
				'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-jezelf-van-deze-collectie-wil-wissen'
			);
		}

		return tText(
			'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-deze-collectie-wil-verwijderen'
		);
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
		<ConfirmModal
			isOpen={isOpen}
			title={
				isContributor
					? tHtml(
							'collection/components/modals/delete-collection-modal___verwijder-mij-van-deze-collectie'
					  )
					: tHtml(
							'collection/components/modals/delete-collection-modal___verwijder-deze-collectie'
					  )
			}
			body={renderDeleteMessage()}
			cancelLabel={tText('collection/components/modals/delete-collection-modal___annuleer')}
			confirmLabel={tText('collection/components/modals/delete-collection-modal___verwijder')}
			size="large"
			onClose={onClose}
			className="c-content"
			confirmCallback={handleDelete}
		/>
	);
};

export default DeleteCollectionModal;
