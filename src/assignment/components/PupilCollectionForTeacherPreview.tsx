import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { Button, Container, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, type ReactNode } from 'react';

import { AlertBar } from '../../shared/components/AlertBar/AlertBar';
import { BlockList } from '../../shared/components/BlockList/BlockList';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { useTranslation } from '../../shared/hooks/useTranslation';

import { AssignmentHeading } from './AssignmentHeading';

type PupilCollectionForTeacherPreviewProps = {
	onClose: () => void;
	assignmentResponse: Omit<Avo.Assignment.Response, 'assignment'>;
	metadata: ReactNode;
};

export const PupilCollectionForTeacherPreview: FC<PupilCollectionForTeacherPreviewProps> = ({
	onClose,
	assignmentResponse,
	metadata,
}) => {
	const { tText, tHtml } = useTranslation();

	const closeButton = (
		<Button
			icon={IconName.close}
			label={
				isMobileWidth()
					? undefined
					: tText(
							'assignment/components/pupil-collection-for-teacher-preview___sluit-preview'
					  )
			}
			ariaLabel={tText(
				'assignment/components/pupil-collection-for-teacher-preview___sluit-preview'
			)}
			type="borderless-i"
			onClick={onClose}
		/>
	);
	const collectionTitle = (
		<BlockHeading type="h2">{assignmentResponse?.collection_title || ''}</BlockHeading>
	);
	return (
		<div className="c-assignment-response-page c-assignment-response-page--edit">
			<AlertBar
				icon={IconName.alertCircle}
				textLeft={tHtml(
					'assignment/components/pupil-collection-for-teacher-preview___je-bent-aan-het-kijken-als-lesgever'
				)}
				contentRight={closeButton}
			/>
			<AssignmentHeading title={collectionTitle} info={metadata} tour={null} />
			<Container mode="horizontal">
				<BlockList
					blocks={
						(assignmentResponse?.pupil_collection_blocks ||
							[]) as Avo.Core.BlockItemBase[]
					}
					config={{
						ITEM: {
							canOpenOriginal: true,
						},
					}}
				/>
			</Container>
		</div>
	);
};
