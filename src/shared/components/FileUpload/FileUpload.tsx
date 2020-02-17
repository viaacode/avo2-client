import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Blankslate,
	Box,
	Button,
	Flex,
	FlexItem,
	Icon,
	IconName,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { CustomError } from '../../helpers';
import { AssetType, deleteFile, uploadFile } from '../../services/file-upload-service';
import toastService from '../../services/toast-service';
import i18n from '../../translations/i18n';

import './FileUpload.scss';

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export const EXTENSION_TO_TYPE: { [extension: string]: string } = {
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
};

export interface FileUploadProps {
	icon?: IconName;
	label?: string;
	allowedTypes?: string[];
	assetType: AssetType;
	ownerId: string;
	url: string | null;
	onChange: (url: string | null) => void;
}

const FileUpload: FunctionComponent<FileUploadProps> = ({
	icon,
	label = i18n.t('Selecteer een bestand'),
	allowedTypes = PHOTO_TYPES,
	assetType,
	ownerId,
	url,
	onChange,
}) => {
	const [t] = useTranslation();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const uploadSelectedFile = async (file: File | null) => {
		try {
			if (file) {
				if (allowedTypes.includes(file.type)) {
					setIsProcessing(true);
					const url = await uploadFile(file, assetType, ownerId);
					onChange(url);
				} else {
					const allowedExtensions = allowedTypes
						.map(type => type.split('/').pop() || type)
						.join(', ');
					toastService.danger(
						t('Het geselecteerde bestand is niet toegelaten, ({{allowedExtensions}})', {
							allowedExtensions,
						})
					);
				}
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to upload file in FileUpload component', err, { file })
			);
			toastService.danger(t('Het uploaden van het bestand is mislukt'));
		}
		setIsProcessing(false);
	};

	const deleteUploadedFile = async () => {
		try {
			setIsProcessing(true);
			if (url) {
				await deleteFile(url);
				onChange(null);
			}
		} catch (err) {
			console.error(new CustomError('Failed to delete asset', err, { url }));
			toastService.danger(t('Het verwijderen van het bestand is mislukt'));
		}
		setIsProcessing(false);
	};

	// Render
	return (
		<Box backgroundColor="gray" className="c-file-upload">
			{!url ? (
				<Spacer margin="large">
					{!isProcessing ? (
						<>
							<Flex>
								{!!icon && (
									<FlexItem shrink>
										<Icon size="large" name={icon} />
									</FlexItem>
								)}
								<FlexItem className="c-file-upload-button-and-input">
									<Button label={label} ariaLabel={label} type="secondary" autoHeight />
									<input
										type="file"
										title={t('Kies een bestand')}
										onChange={evt => !!evt.target.files && uploadSelectedFile(evt.target.files[0])}
									/>
								</FlexItem>
							</Flex>
						</>
					) : (
						<Spinner size="large" />
					)}
				</Spacer>
			) : (
				<>
					{allowedTypes.includes(EXTENSION_TO_TYPE[url.split('.').pop() || '']) ? (
						<div className="a-upload-image-preview" style={{ backgroundImage: `url(${url})` }} />
					) : (
						<Blankslate title={url.split('/').pop() || ''} body="" icon="file" />
					)}
					<Spacer margin="top-large">
						<Button
							type="danger"
							icon="trash-2"
							ariaLabel={t('Verwijder afbeelding')}
							autoHeight
							disabled={isProcessing}
							onClick={() => deleteUploadedFile()}
						/>
					</Spacer>
				</>
			)}
		</Box>
	);
};

export default FileUpload;
