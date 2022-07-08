import { BlockHeading, Button, Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { InteractiveTour } from '../../shared/components';
import AlertBar from '../../shared/components/AlertBar/AlertBar';
import BlockList from '../../shared/components/BlockList/BlockList';
import { isMobileWidth } from '../../shared/helpers';

import AssignmentHeading from './AssignmentHeading';

export type PupilCollectionForTeacherPreviewProps = {
	onClose: () => void;
	assignmentResponse: Avo.Assignment.Response_v2;
	metadata: ReactNode;
};

export const PupilCollectionForTeacherPreview: FC<PupilCollectionForTeacherPreviewProps> = ({
	onClose,
	assignmentResponse,
	metadata,
}) => {
	const [t] = useTranslation();

	const closeButton = (
		<Button
			icon="close"
			label={isMobileWidth() ? undefined : t('Sluit preview')}
			ariaLabel={t('Sluit preview')}
			type="borderless-i"
			onClick={onClose}
		/>
	);
	const collectionTitle = (
		<BlockHeading className="u-spacer-left" type="h2">
			{assignmentResponse?.collection_title || ''}
		</BlockHeading>
	);
	return (
		<>
			<AlertBar
				icon="alert-circle"
				textLeft={t('Je bent aan het kijken als lesgever')}
				contentRight={closeButton}
			/>
			<AssignmentHeading
				title={collectionTitle}
				info={metadata}
				tour={<InteractiveTour showButton />}
			/>
			<Container mode="horizontal">
				<BlockList
					blocks={
						(assignmentResponse?.pupil_collection_blocks ||
							[]) as Avo.Core.BlockItemBase[]
					}
				/>
			</Container>
		</>
	);
};
