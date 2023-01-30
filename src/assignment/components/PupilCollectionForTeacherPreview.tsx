import { BlockHeading } from '@meemoo/admin-core-ui';
import { Button, Container } from '@viaa/avo2-components';
import React, { FC, ReactNode } from 'react';

import AlertBar from '../../shared/components/AlertBar/AlertBar';
import BlockList from '../../shared/components/BlockList/BlockList';
import { isMobileWidth } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { AssignmentResponseInfo, BaseBlockWithMeta } from '../assignment.types';

import AssignmentHeading from './AssignmentHeading';

export type PupilCollectionForTeacherPreviewProps = {
	onClose: () => void;
	assignmentResponse: Omit<AssignmentResponseInfo, 'assignment'>;
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
			icon="close"
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
				icon="alert-circle"
				textLeft={tHtml(
					'assignment/components/pupil-collection-for-teacher-preview___je-bent-aan-het-kijken-als-lesgever'
				)}
				contentRight={closeButton}
			/>
			<AssignmentHeading title={collectionTitle} info={metadata} tour={null} />
			<Container mode="horizontal">
				<BlockList
					blocks={
						(assignmentResponse?.pupil_collection_blocks || []) as BaseBlockWithMeta[]
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
