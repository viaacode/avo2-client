import { get } from 'lodash-es';
import * as queryString from 'querystring';
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
import { toastService } from '../../services';
import { AssetType, deleteFile, uploadFile } from '../../services/file-upload-service';
import i18n from '../../translations/i18n';

import './FileUpload.scss';

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export function isPhoto(url: string): boolean {
	return PHOTO_TYPES.includes(EXTENSION_TO_TYPE[url.split('.').pop() || '']);
}

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
	allowMulti?: boolean;
	assetType: AssetType;
	ownerId: string;
	urls: string[] | null;
	onChange: (urls: string[]) => void;
}

const FileUpload: FunctionComponent<FileUploadProps> = ({
	icon,
	label,
	allowedTypes = PHOTO_TYPES,
	allowMulti = true,
	assetType,
	ownerId,
	urls,
	onChange,
}) => {
	const [t] = useTranslation();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const uploadSelectedFile = async (files: File[] | null) => {
		try {
			if (files && files.length) {
				// If allowedTypes array is empty, all filetypes are allowed
				const notAllowedFiles = allowedTypes.length
					? files.filter(file => !allowedTypes.includes(file.type))
					: [];
				if (notAllowedFiles.length) {
					const allowedExtensions = allowedTypes
						.map(type => type.split('/').pop() || type)
						.join(', ');
					toastService.danger(
						t(
							'shared/components/file-upload/file-upload___een-geselecteerde-bestand-is-niet-toegelaten-allowed-extensions',
							{
								allowedExtensions,
							}
						)
					);
					return;
				}

				// Upload all files in series
				setIsProcessing(true);
				const uploadedUrls: string[] = [];
				for (let i = 0; i < (allowMulti ? files.length : 1); i += 1) {
					uploadedUrls.push(await uploadFile(files[i], assetType, ownerId));
				}
				onChange(allowMulti ? [...urls, ...uploadedUrls] : uploadedUrls);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to upload files in FileUpload component', err, { files })
			);
			if (files && files.length > 1 && allowMulti) {
				toastService.danger(
					t(
						'shared/components/file-upload/file-upload___het-uploaden-van-de-bestanden-is-mislukt'
					)
				);
			} else {
				toastService.danger(
					t(
						'shared/components/file-upload/file-upload___het-uploaden-van-het-bestand-is-mislukt'
					)
				);
			}
		}
		setIsProcessing(false);
	};

	const deleteUploadedFile = async (url: string) => {
		try {
			if (assetType === 'ZENDESK_ATTACHMENT') {
				// We don't manage zendesk attachments
				onChange([]);
				return;
			}
			setIsProcessing(true);
			if (urls) {
				const newUrls = [...urls];
				for (let i = 0; i < newUrls.length; i += 1) {
					if (newUrls[i] === url) {
						await deleteFile(url);
						newUrls.splice(i, 1);
					}
				}
				onChange(newUrls);
			} else {
				onChange([]);
			}
		} catch (err) {
			console.error(new CustomError('Failed to delete asset', err, { urls }));
			toastService.danger(
				t(
					'shared/components/file-upload/file-upload___het-verwijderen-van-het-bestand-is-mislukt'
				)
			);
		}
		setIsProcessing(false);
	};

	const renderDeleteButton = (url: string) => {
		return (
			<Button
				className="a-delete-button"
				type="danger-hover"
				icon="trash-2"
				ariaLabel={t('shared/components/file-upload/file-upload___verwijder-bestand')}
				autoHeight
				disabled={isProcessing}
				onClick={() => deleteUploadedFile(url)}
			/>
		);
	};

	const renderFilesPreview = () => {
		if (!urls) {
			return null;
		}

		return urls.map(url => {
			if (isPhoto(url)) {
				return (
					<Spacer margin="bottom-small" key={url}>
						<div
							className="a-upload-image-preview"
							style={{ backgroundImage: `url(${url})` }}
						>
							{renderDeleteButton(url)}
						</div>
					</Spacer>
				);
			}
			const queryParams = queryString.parse(url.split('?').pop() || '');
			const title: string = get(queryParams, 'name', 'bestand') as string;
			return (
				<Spacer margin="bottom-small" key={url}>
					{/* TODO drop body once it becomes optional (components repo update 1.29.0) */}
					<Blankslate title={title} body="" icon="file" className="a-upload-file-preview">
						{renderDeleteButton(url)}
					</Blankslate>
				</Spacer>
			);
		});
	};

	// Render
	return (
		<Box backgroundColor="gray" className="c-file-upload">
			<Spacer margin="large">
				{renderFilesPreview()}
				{!isProcessing ? (
					<Flex>
						{!!icon && (
							<FlexItem shrink>
								<Icon size="large" name={icon} />
							</FlexItem>
						)}
						<FlexItem className="c-file-upload-button-and-input">
							<Button
								label={
									label ||
									(allowMulti
										? i18n.t(
												'shared/components/file-upload/file-upload___selecteer-bestanden'
										  )
										: i18n.t(
												'shared/components/file-upload/file-upload___selecteer-een-bestand'
										  ))
								}
								ariaLabel={label}
								type="secondary"
								autoHeight
							/>
							<input
								type="file"
								title={t(
									'shared/components/file-upload/file-upload___kies-een-bestand'
								)}
								multiple={allowMulti}
								onChange={evt =>
									!!evt.target.files &&
									uploadSelectedFile(Array.from(evt.target.files))
								}
							/>
						</FlexItem>
					</Flex>
				) : (
					<Spinner size="large" />
				)}
			</Spacer>
		</Box>
	);
};

export default FileUpload;
