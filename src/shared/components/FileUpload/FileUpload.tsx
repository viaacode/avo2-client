import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

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

import './FileUpload.scss';

interface FileUploadProps {
	icon?: IconName;
	label: string;
	allowedTypes?: string[];
	assetType: AssetType;
	ownerId: string;
	url: string | null;
	onChange: (url: string | null) => void;
}

const FileUpload: FunctionComponent<FileUploadProps> = ({
	icon,
	label,
	allowedTypes = PHOTO_TYPES,
	assetType,
	ownerId,
	url,
	onChange,
}) => {
	const [t] = useTranslation();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const uploadSelectedFile = async (file: File | null) => {
		if (file) {
			if (allowedTypes.includes(file.type)) {
				setIsProcessing(true);
				const url = await uploadFile(file, assetType, ownerId);
				onChange(url);
				setIsProcessing(false);
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
								<FlexItem>
									<Button label={label} ariaLabel={label} type="secondary" autoHeight />
								</FlexItem>
							</Flex>
							<input
								type="file"
								onChange={evt => !!evt.target.files && uploadSelectedFile(evt.target.files[0])}
							/>
						</>
					) : (
						<Spinner size="large" />
					)}
				</Spacer>
			) : (
				<>
					{url.endsWith('jpg') || url.endsWith('png') || url.endsWith('gif') ? (
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
