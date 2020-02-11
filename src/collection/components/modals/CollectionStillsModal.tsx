import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Blankslate,
	Button,
	ButtonToolbar,
	Flex,
	Form,
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
import { Avo } from '@viaa/avo2-types';

import { getThumbnailsForCollection } from '../../../shared/services/stills-service';
import toastService from '../../../shared/services/toast-service';
import { STILL_DIMENSIONS } from '../../collection.const';

interface CollectionStillsModalProps {
	isOpen: boolean;
	onClose: () => void;
	collection: Avo.Collection.Collection;
}

const CollectionStillsModal: FunctionComponent<CollectionStillsModalProps> = ({
	onClose,
	isOpen,
	collection,
}) => {
	const [t] = useTranslation();

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
				setVideoStills(await getThumbnailsForCollection(collection));
			} catch (err) {
				console.error(err);
				toastService.danger('Het ophalen van de media thumbnails is mislukt.');
				setVideoStills([]);
			}
		};

		fetchThumbnailImages();
	}, [isOpen, collection]);

	const saveCoverImage = () => {
		collection.thumbnail_path = selectedCoverImages[0];
		onClose();
		toastService.success('De cover afbeelding is ingesteld.');
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t(
				'collection/components/modals/collection-stills-modal___stel-een-cover-afbeelding-in'
			)}
			size="large"
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<Spacer margin="medium">
					<Form>
						{!videoStills ? (
							<Flex center orientation="horizontal">
								<Spinner size="large" />
							</Flex>
						) : !videoStills.length ? (
							<Blankslate
								body=""
								icon="search"
								title={t(
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
									label={t('collection/components/modals/collection-stills-modal___annuleren')}
									type="secondary"
									block
									onClick={onClose}
								/>
								<Button
									label={t('collection/components/modals/collection-stills-modal___opslaan')}
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
