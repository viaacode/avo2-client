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

import { STILL_DIMENSIONS } from '../../constants';
import useTranslation from '../../hooks/useTranslation';
import { ToastService } from '../../services/toast-service';
import { VideoStillService } from '../../services/video-stills-service';

interface ThumbnailStillsModalProps {
	isOpen: boolean;
	onClose: (collection: Avo.Collection.Collection | Avo.Assignment.Assignment) => void;
	subject: Avo.Collection.Collection | Avo.Assignment.Assignment;
}

const ThumbnailStillsModal: FunctionComponent<ThumbnailStillsModalProps> = ({
	onClose,
	isOpen,
	subject,
}) => {
	const { tText, tHtml } = useTranslation();

	const [videoStills, setVideoStills] = useState<string[] | null>(null);
	const [selectedCoverImages, setSelectedCoverImages] = useState<string[]>(
		subject.thumbnail_path ? [subject.thumbnail_path] : []
	);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const fetchThumbnailImages = async () => {
			try {
				setVideoStills(await VideoStillService.getThumbnailsForSubject(subject));
			} catch (err) {
				console.error(err);
				ToastService.danger(tHtml('Het ophalen van de media-afbeeldingen is mislukt.'));
				setVideoStills([]);
			}
		};

		fetchThumbnailImages();
	}, [isOpen, subject, tText]);

	const saveCoverImage = () => {
		onClose({ ...subject, thumbnail_path: selectedCoverImages[0] });
		ToastService.success(tHtml('De hoofdafbeelding is ingesteld.'));
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tHtml('Stel een hoofdafbeelding in')}
			size="large"
			onClose={() => onClose(subject)}
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
								title={tHtml(
									'Er zijn geen video-afbeeldingen beschikbaar voor de blokken.'
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
									label={tText('annuleren')}
									type="secondary"
									block
									onClick={() => {
										onClose(subject);
									}}
								/>
								<Button
									label={tText('opslaan')}
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

export default ThumbnailStillsModal;
