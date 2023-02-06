import {
	Blankslate,
	Button,
	ButtonToolbar,
	Flex,
	Form,
	IconName,
	ImageGrid,
	Modal,
	ModalBody,
	ModalFooterRight,
	Spacer,
	Spinner,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, useEffect, useState } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { VideoStillService } from '../../../shared/services/video-stills-service';
import { STILL_DIMENSIONS } from '../../collection.const';

interface CollectionStillsModalProps {
	isOpen: boolean;
	onClose: (collection: Avo.Collection.Collection) => void;
	collection: Avo.Collection.Collection;
}

const CollectionStillsModal: FunctionComponent<CollectionStillsModalProps> = ({
	onClose,
	isOpen,
	collection,
}) => {
	const { tText, tHtml } = useTranslation();

	const [videoStills, setVideoStills] = useState<string[] | null>(null);
	const [selectedCoverImages, setSelectedCoverImages] = useState<string[]>(
		collection.thumbnail_path ? [collection.thumbnail_path] : []
	);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const fetchThumbnailImages = async () => {
			try {
				setVideoStills(await VideoStillService.getThumbnailsForCollection(collection));
			} catch (err) {
				console.error(err);
				ToastService.danger(
					tHtml(
						'collection/components/modals/collection-stills-modal___het-ophalen-van-de-media-thumbnails-is-mislukt'
					)
				);
				setVideoStills([]);
			}
		};

		fetchThumbnailImages();
	}, [isOpen, collection, tText]);

	const saveCoverImage = () => {
		onClose({ ...collection, thumbnail_path: selectedCoverImages[0] });
		ToastService.success(
			tHtml(
				'collection/components/modals/collection-stills-modal___de-cover-afbeelding-is-ingesteld'
			)
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tText(
				'collection/components/modals/collection-stills-modal___stel-een-cover-afbeelding-in'
			)}
			size="large"
			onClose={() => onClose(collection)}
			scrollable
		>
			<ModalBody>
				<Spacer>
					<Form>
						{!videoStills ? (
							<Flex center orientation="horizontal">
								<Spinner size="large" />
							</Flex>
						) : !videoStills.length ? (
							<Blankslate
								body=""
								icon={IconName.search}
								title={tText(
									'collection/components/modals/collection-stills-modal___er-zijn-geen-thumbnails-beschikbaar-voor-de-fragmenten-in-de-collectie'
								)}
							/>
						) : (
							<ImageGrid
								images={videoStills}
								allowSelect
								value={selectedCoverImages}
								onChange={setSelectedCoverImages}
								{...STILL_DIMENSIONS}
							/>
						)}
					</Form>
				</Spacer>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									label={tText(
										'collection/components/modals/collection-stills-modal___annuleren'
									)}
									type="secondary"
									block
									onClick={() => {
										onClose(collection);
									}}
								/>
								<Button
									label={tText(
										'collection/components/modals/collection-stills-modal___opslaan'
									)}
									type="primary"
									block
									onClick={saveCoverImage}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default CollectionStillsModal;
