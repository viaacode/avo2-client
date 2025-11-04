import { noop } from 'lodash-es';
import React, { type FC, type ReactNode } from 'react';

import { ConfirmModal } from '../../shared/components/ConfirmModal/ConfirmModal';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

interface DeleteAssignmentModalProps {
	isOpen: boolean;
	onClose?: () => void;
	deleteAssignmentCallback: () => void;
	deleteSelfFromAssignmentCallback: () => void;
	contributorCount: number;
	hasPupilResponses: boolean;
	hasPupilResponseCollections: boolean;
	/**
	 * true: should delete the current user from the contributors of the assignment
	 * false: should delete the assignment itself
	 */
	shouldDeleteSelfFromAssignment: boolean;
}

export const DeleteAssignmentModal: FC<DeleteAssignmentModalProps> = ({
	isOpen,
	onClose = noop,
	deleteAssignmentCallback,
	deleteSelfFromAssignmentCallback,
	contributorCount,
	hasPupilResponses,
	hasPupilResponseCollections,
	shouldDeleteSelfFromAssignment,
}) => {
	const handleDelete = async () => {
		if (shouldDeleteSelfFromAssignment) {
			deleteSelfFromAssignmentCallback();
		} else {
			deleteAssignmentCallback();
		}
		onClose();
	};

	const renderDeleteMessages = () => {
		const messages: ReactNode[] = [];
		if (shouldDeleteSelfFromAssignment) {
			messages.push(
				tHtml(
					'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-jezelf-van-deze-collectie-wil-wissen'
				)
			);
		} else {
			if (contributorCount === 1) {
				messages.push(
					tHtml(
						'assignment/modals/delete-assignment-modal___deze-opdracht-is-met-1-andere-persoon-gedeeld-deze-verliezen-dan-toegang'
					)
				);
			} else if (contributorCount > 1) {
				messages.push(
					tHtml(
						'assignment/modals/delete-assignment-modal___deze-opdracht-is-met-count-andere-mensen-gedeeld-deze-verliezen-dan-toegang',
						{ count: contributorCount }
					)
				);
			}

			if (hasPupilResponses) {
				if (hasPupilResponseCollections) {
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

			messages.push(
				tHtml(
					'assignment/modals/delete-assignment-modal___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
				)
			);
		}

		messages.push(
			tHtml(
				'assignment/modals/delete-assignment-modal___opgelet-deze-actie-kan-niet-ongedaan-gemaakt-worden'
			)
		);

		return (
			<>
				{messages.map((message, index) => (
					<p key={`assignment-delete-warning-${index}`}>{message}</p>
				))}
			</>
		);
	};

	return (
		<ConfirmModal
			isOpen={isOpen}
			title={
				shouldDeleteSelfFromAssignment
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
