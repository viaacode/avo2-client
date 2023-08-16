import { noop } from 'lodash-es';
import React, { FunctionComponent, ReactNode } from 'react';

import ConfirmModal from '../../shared/components/ConfirmModal/ConfirmModal';
import useTranslation from '../../shared/hooks/useTranslation';

interface DeleteAssignmentModalProps {
	isOpen: boolean;
	onClose?: () => void;
	deleteObjectCallback: () => void;

	isContributor: boolean;
	contributorCount: number;
	hasResponses?: boolean;
	containsBuildBlocks?: boolean;
}

const DeleteAssignmentModal: FunctionComponent<DeleteAssignmentModalProps> = ({
	isOpen,
	onClose = noop,
	deleteObjectCallback,
	isContributor,
	contributorCount,
	hasResponses = false,
	containsBuildBlocks = false,
}) => {
	const { tText, tHtml } = useTranslation();

	const handleDelete = async () => {
		deleteObjectCallback();
		onClose();
	};

	const renderDeleteMessages = () => {
		const messages: ReactNode[] = [];
		if (contributorCount > 0) {
			if (contributorCount === 1) {
				messages.push(
					tHtml(
						'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-jezelf-van-deze-opdracht-wil-wissen-deze-opdracht-is-met-1-andere-persoon-gedeeld-deze-verliezen-dan-toegang'
					)
				);
			} else {
				messages.push(
					tHtml(
						'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-jezelf-van-deze-opdracht-wil-wissen-deze-opdracht-is-met-count-andere-mensen-gedeeld-deze-verliezen-dan-toegang',
						{ count: contributorCount }
					)
				);
			}
		} else if (isContributor) {
			messages.push(
				tHtml(
					'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-jezelf-van-deze-opdracht-wil-wissen'
				)
			);
		}

		if (hasResponses) {
			if (containsBuildBlocks) {
				messages.push(
					tHtml(
						'assignment/views/assignment-overview___deze-opdracht-bevat-mogelijk-collecties-die-eveneens-verwijderd-zullen-worden'
					)
				);
			} else {
				messages.push(
					tHtml(
						'assignment/views/assignment-overview___leerlingen-bekeken-deze-opdracht-reeds'
					)
				);
			}
		}

		return (
			<>
				{messages.length ? (
					messages.map((message, index) => (
						<p key={`assignment-delete-warning-${index}`}>{message}</p>
					))
				) : (
					<p>
						{tHtml(
							'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
						)}
					</p>
				)}

				<p>
					{tHtml(
						'assignment/modals/delete-assignment-modal___opgelet-deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
				</p>
			</>
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
			body={renderDeleteMessages()}
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
