import {
	Blankslate,
	Button,
	Flex,
	FlexItem,
	Icon,
	IconName,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact, isString } from 'lodash-es';
import queryString from 'query-string';
import React, { type FC, useState } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';
import { CustomError } from '../../helpers/custom-error';
import { getUrlInfo, isPhoto, isVideo, PHOTO_TYPES } from '../../helpers/files';
import { FileUploadService } from '../../services/file-upload-service';
import { ToastService } from '../../services/toast-service';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';

import './FileUpload.scss';

interface FileUploadProps {
	icon?: IconName;
	label?: string;
	allowedTypes?: string[];
	allowMulti?: boolean;
	assetType: Avo.FileUpload.AssetType;
	ownerId: string;
	urls: string[] | null;
	showDeleteButton?: boolean;
	disabled?: boolean;
	onChange: (urls: string[]) => void;
}

const FileUpload: FC<FileUploadProps> = ({
	icon,
	label,
	allowedTypes = PHOTO_TYPES,
	allowMulti = true,
	assetType,
	ownerId,
	urls,
	showDeleteButton = true,
	disabled = false,
	onChange,
}) => {
	const { tText, tHtml } = useTranslation();
	const [urlToDelete, setUrlToDelete] = useState<string | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const openDeleteModal = (url: string) => {
		setUrlToDelete(url);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setUrlToDelete(null);
		setIsDeleteModalOpen(false);
	};

	const uploadSelectedFile = async (files: File[] | null) => {
		try {
			if (files && files.length) {
				// If allowedTypes array is empty, all filetypes are allowed
				const notAllowedFiles = allowedTypes.length
					? files.filter((file) => !allowedTypes.includes(file.type))
					: [];
				if (notAllowedFiles.length) {
					ToastService.danger(
						tHtml(
							'shared/components/file-upload/file-upload___een-geselecteerde-bestand-is-niet-toegelaten'
						)
					);
					return;
				}

				// Upload all files in series
				setIsProcessing(true);
				const uploadedUrls: string[] = [];
				for (let i = 0; i < (allowMulti ? files.length : 1); i += 1) {
					uploadedUrls.push(
						await FileUploadService.uploadFile(files[i], assetType, ownerId)
					);
				}
				onChange(allowMulti ? [...(urls || []), ...uploadedUrls] : uploadedUrls);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to upload files in FileUpload component', err, { files })
			);
			if (files && files.length > 1 && allowMulti) {
				ToastService.danger(
					tHtml(
						'shared/components/file-upload/file-upload___het-uploaden-van-de-bestanden-is-mislukt'
					)
				);
			} else {
				ToastService.danger(
					tHtml(
						'shared/components/file-upload/file-upload___het-uploaden-van-het-bestand-is-mislukt'
					)
				);
			}
		}
		setIsProcessing(false);
	};

	const deleteUploadedFile = async (url: string) => {
		if (!url) {
			closeDeleteModal();
			return;
		}

		try {
			if (assetType === 'ZENDESK_ATTACHMENT') {
				// We don't manage zendesk attachments
				onChange([]);
				return;
			}
			setIsProcessing(true);
			if (urls) {
				const newUrls = [...urls];
				for (let i = newUrls.length - 1; i >= 0; i -= 1) {
					if (newUrls[i] === url) {
						const { AssetsService } = await import(
							'@meemoo/admin-core-ui/dist/admin.mjs'
						);
						await AssetsService.deleteFile(url);
						newUrls.splice(i, 1);
					}
				}
				onChange(newUrls);
			} else {
				onChange([]);
			}
		} catch (err) {
			console.error(new CustomError('Failed to delete asset', err, { urls }));
			ToastService.danger(
				tHtml(
					'shared/components/file-upload/file-upload___het-verwijderen-van-het-bestand-is-mislukt'
				)
			);
		}

		setIsProcessing(false);
		closeDeleteModal();
	};

	const renderDeleteButton = (url: string) => {
		if (disabled || !showDeleteButton) {
			return null;
		}
		return (
			<Button
				className="a-delete-button"
				type="danger-hover"
				icon={IconName.delete}
				ariaLabel={tText('shared/components/file-upload/file-upload___verwijder-bestand')}
				title={tText('shared/components/file-upload/file-upload___verwijder-bestand')}
				autoHeight
				disabled={isProcessing}
				onClick={() => openDeleteModal(url)}
			/>
		);
	};

	const renderFilesPreview = () => {
		if (!urls) {
			return null;
		}

		return compact(urls).map((url) => {
			if (isPhoto(url)) {
				return (
					<Spacer margin="bottom-small" key={url}>
						<div
							className="a-upload-media-preview"
							style={{ backgroundImage: `url(${url})` }}
						>
							{renderDeleteButton(url)}
						</div>
					</Spacer>
				);
			}
			if (isVideo(url)) {
				return (
					<Spacer margin="bottom-small" key={url}>
						<div className="a-upload-media-preview">
							<video src={url} controls />
							{renderDeleteButton(url)}
						</div>
					</Spacer>
				);
			}
			let fileName: string | undefined;
			if (url.includes('?')) {
				const queryParams = queryString.parse(url.split('?').pop() || '');
				if (queryParams && queryParams.name && isString(queryParams.name)) {
					fileName = queryParams.name as string;
				}
			}
			if (!fileName && url) {
				const urlInfo = getUrlInfo(url.split('?')[0]);
				fileName = `${urlInfo.fileName.substring(
					0,
					urlInfo.fileName.length - '-00000000-0000-0000-0000-000000000000'.length
				)}.${urlInfo.extension}`;
			}

			return (
				<Spacer margin="bottom-small" key={url}>
					<Blankslate
						title={fileName || ''}
						icon={IconName.file}
						className="a-upload-file-preview"
					>
						{renderDeleteButton(url)}
					</Blankslate>
				</Spacer>
			);
		});
	};

	// Render
	return (
		<div className="c-file-upload">
			{renderFilesPreview()}
			{!disabled &&
				(!isProcessing ? (
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
										? tText(
												'shared/components/file-upload/file-upload___selecteer-bestanden'
										  )
										: tText(
												'shared/components/file-upload/file-upload___selecteer-een-bestand'
										  ))
								}
								ariaLabel={label}
								type="secondary"
								autoHeight
							/>
							<input
								type="file"
								title={tText(
									'shared/components/file-upload/file-upload___kies-een-bestand'
								)}
								multiple={allowMulti}
								onChange={(evt) =>
									!!evt.target.files &&
									uploadSelectedFile(Array.from(evt.target.files))
								}
							/>
						</FlexItem>
					</Flex>
				) : (
					<Spinner size="large" />
				))}
			<ConfirmModal
				title={tHtml(
					'shared/components/file-upload/file-upload___ben-je-zeker-dat-je-dit-bestand-wil-verwijderen'
				)}
				body={tHtml(
					'shared/components/file-upload/file-upload___opgelet-deze-actie-kan-niet-ongedaan-gemaakt-worden'
				)}
				isOpen={isDeleteModalOpen}
				onClose={closeDeleteModal}
				confirmCallback={async () => {
					try {
						await deleteUploadedFile(urlToDelete || '');
					} catch (err) {
						console.error(
							new CustomError('Failed to delete uploaded file', err, { urlToDelete })
						);
						ToastService.danger(
							tHtml(
								'shared/components/file-upload/file-upload___het-verwijderen-van-het-bestand-is-mislukt'
							)
						);
					}
				}}
			/>
		</div>
	);
};

export default FileUpload;
