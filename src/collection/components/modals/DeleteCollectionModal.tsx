import { noop } from 'lodash-es';
import React, { type FC } from 'react';

import ConfirmModal from '../../../shared/components/ConfirmModal/ConfirmModal';
import useTranslation from '../../../shared/hooks/useTranslation';

interface DeleteCollectionModalProps {
	isOpen: boolean;
	onClose?: () => void;
	deleteCollectionCallback: () => void;
	deleteSelfFromCollectionCallback: () => void;
	contributorCount: number;
	/**
	 * true: should delete the current user from the contributors of the collection
	 * false: should delete the collection/bundle itself
	 */
	shouldDeleteSelfFromCollection: boolean;
}

const DeleteCollectionModal: FC<DeleteCollectionModalProps> = ({
	isOpen,
	onClose = noop,
	deleteCollectionCallback,
	deleteSelfFromCollectionCallback,
	contributorCount,
	shouldDeleteSelfFromCollection,
}) => {
	const { tText, tHtml } = useTranslation();

	const handleDelete = async () => {
		if (shouldDeleteSelfFromCollection) {
			deleteSelfFromCollectionCallback();
		} else {
			deleteCollectionCallback();
		}
		onClose();
	};

	const renderDeleteMessageParagraph = () => {
		if (shouldDeleteSelfFromCollection) {
			return tHtml(
				'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-jezelf-van-deze-collectie-wil-wissen'
			);
		} else {
			let warning = null;
			if (contributorCount === 1) {
				warning = tHtml(
					'collection/components/modals/delete-collection-modal___deze-opdracht-is-met-1-andere-persoon-gedeeld-deze-verliest-dan-toegang'
				);
			} else if (contributorCount > 1) {
				warning = tHtml(
					'collection/components/modals/delete-collection-modal___deze-opdracht-is-met-count-andere-mensen-gedeeld-deze-verliezen-dan-toegang',
					{ count: contributorCount }
				);
			}

			return (
				<>
					{warning}
					{warning && <br />}
					{tHtml(
						'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-deze-collectie-wil-verwijderen'
					)}
				</>
			);
		}
	};

	const renderDeleteMessage = () => {
		return (
			<p>
				{renderDeleteMessageParagraph()}
				<br />
				{tHtml(
					'collection/components/modals/delete-collection-modal___deze-operatie-kan-niet-meer-ongedaan-gemaakt-worden'
				)}
			</p>
		);
	};

	return (
		<ConfirmModal
			isOpen={isOpen}
			title={
				shouldDeleteSelfFromCollection
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
