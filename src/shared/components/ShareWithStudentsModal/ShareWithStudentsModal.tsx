import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BlockHeading, FormGroup, Modal, ModalBody } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { renderContentLayoutOptionsButtons } from '../../helpers/render-content-layout-options-buttons';
import renderContentLink from '../../helpers/render-content-link';
import withUser, { UserProps } from '../../hocs/withUser';

import './ShareWithStudentsModal.scss';

// Typings

interface SharedUrl {
	content_layout?: AssignmentLayout;
}

interface ShareWithStudentsModalProps {
	modalTitle: string;
	isOpen: boolean;
	content?: Avo.Assignment.Content;
	content_label?: AssignmentContentLabel;
	onClose: () => void;
}

// State

const defaultSharedUrlState: SharedUrl = {
	content_layout: AssignmentLayout.PlayerAndText,
};

// Helpers

// Component

const ShareWithStudentsModal: FunctionComponent<ShareWithStudentsModalProps & UserProps> = ({
	modalTitle,
	isOpen,
	content,
	content_label,
	onClose,
	user,
}) => {
	const [t] = useTranslation();
	const [sharedUrl, setSharedUrl] = useState<SharedUrl>(defaultSharedUrlState);

	return (
		<Modal
			className="m-share-with-students-modal"
			title={modalTitle}
			size="medium"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			{user && content ? (
				<ModalBody>
					<pre>{JSON.stringify(sharedUrl)}</pre>
					<hr />

					<FormGroup
						label={t(
							'shared/components/share-with-students-modal/share-with-students-modal___inhoud'
						)}
					>
						{content_label &&
							renderContentLink(
								{
									content_label,
									content_id: content.id.toString(),
								},
								content,
								user
							)}
					</FormGroup>

					<FormGroup
						label={t(
							'shared/components/share-with-students-modal/share-with-students-modal___weergave-voor-leerlingen'
						)}
					>
						{renderContentLayoutOptionsButtons(sharedUrl, (value: string) => {
							setSharedUrl({
								...sharedUrl,
								content_layout: (value as unknown) as AssignmentLayout, // TS2353
							});
						})}
					</FormGroup>

					<BlockHeading type="h4">
						{t(
							'shared/components/share-with-students-modal/share-with-students-modal___titel'
						)}
					</BlockHeading>
				</ModalBody>
			) : (
				<ModalBody>
					{t(
						'shared/components/share-with-students-modal/share-with-students-modal___er-ging-iets-mis'
					)}
				</ModalBody>
			)}
		</Modal>
	);
};

export default withUser(ShareWithStudentsModal) as FunctionComponent<ShareWithStudentsModalProps>;
