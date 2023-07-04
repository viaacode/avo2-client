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
	responses?: boolean;
	buildType?: boolean;
}

const DeleteAssignmentModal: FunctionComponent<DeleteAssignmentModalProps> = ({
	isOpen,
	onClose = noop,
	deleteObjectCallback,
	isContributor,
	isSharedWithOthers,
	contributorCount,
	responses = false,
	buildType = false,
}) => {
	const { tText, tHtml } = useTranslation();

	const handleDelete = async () => {
		deleteObjectCallback();
		onClose();
	};

	const renderDeleteMessageParagraph = () => {
		if (isSharedWithOthers) {
			if (contributorCount === 1) {
				return tHtml(
					'Ben je zeker dat je jezelf van deze opdracht wil wissen? Deze opdracht is met 1 andere persoon gedeeld. Deze verliezen dan toegang.'
				);
			}
			return tHtml(
				'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-jezelf-van-deze-opdracht-wil-wissen-deze-opdracht-is-met-count-andere-mensen-gedeeld-deze-verliezen-dan-toegang',
				{ count: contributorCount }
			);
		}

		if (isContributor) {
			return tHtml(
				'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-jezelf-van-deze-opdracht-wil-wissen'
			);
		}

		if (buildType) {
			return tHtml(
				'assignment/views/assignment-overview___deze-opdracht-bevat-mogelijk-collecties-die-eveneens-verwijderd-zullen-worden'
			);
		}

		if (responses) {
			return tHtml(
				'assignment/views/assignment-overview___leerlingen-bekeken-deze-opdracht-reeds'
			);
		}

		return tHtml(
			'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
		);
	};

	const renderDeleteMessage = () => {
		return (
			<p>
				{renderDeleteMessageParagraph()}
				<br />
				{tHtml(
					'assignment/modals/delete-assignment-modal___opgelet-deze-actie-kan-niet-ongedaan-gemaakt-worden'
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
							'assignment/modals/delete-assignment-modal___verwijder-mij-van-deze-opdracht'
					  )
					: tHtml('assignment/modals/delete-assignment-modal___verwijder-deze-opdracht')
			}
			body={renderDeleteMessage()}
			cancelLabel={tText('assignment/modals/delete-assignment-modal___annuleer')}
			confirmLabel={tText('assignment/modals/delete-assignment-modal___verwijder')}
			size="large"
			onClose={onClose}
			className="c-content"
			confirmCallback={handleDelete}
		/>
	);
};

export default DeleteAssignmentModal;
