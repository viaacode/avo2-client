import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { WYSIWYG2, WYSIWYG2Media, WYSIWYG2Props, WYSIWYG2UploadInfo } from '@viaa/avo2-components';

import { WYSIWYG2_OPTIONS_DEFAULT } from '../../constants';
import { CustomError } from '../../helpers';
import { ToastService } from '../../services';
import { FileUploadService } from '../../services/file-upload-service';

// TODO replace by type from typings v2.18.0
export type AssetType =
	| 'BUNDLE_COVER'
	| 'COLLECTION_COVER'
	| 'CONTENT_PAGE_COVER'
	| 'CONTENT_BLOCK_IMAGE'
	| 'CONTENT_PAGE_DESCRIPTION_IMAGE'
	| 'ASSIGNMENT_DESCRIPTION_IMAGE'
	| 'PROFILE_AVATAR'
	| 'ITEM_SUBTITLE'
	| 'ITEM_NOTE_IMAGE'
	| 'INTERACTIVE_TOUR_IMAGE'
	| 'ZENDESK_ATTACHMENT';

export type WYSIWYG2WrapperProps = WYSIWYG2Props & {
	// TODO replace by type from typings v2.18.0
	fileType?: AssetType; // Required to enable file upload
	ownerId?: string;
};

/**
 * Handle WYSIWYG default controls and upload function
 * @param props
 * @constructor
 */
const WYSIWYG2Wrapper: FunctionComponent<WYSIWYG2WrapperProps> = props => {
	const [t] = useTranslation();

	const { controls, fileType, ownerId, ...rest } = props;

	if ((controls || []).includes('media') && !fileType) {
		console.error(
			new CustomError(
				'Trying to initialize WYSIWYG2Wrapper component with media without fileType',
				null,
				props
			)
		);
	}

	const media: WYSIWYG2Media | undefined = fileType
		? {
				uploadFn: async (param: WYSIWYG2UploadInfo) => {
					try {
						const url = await FileUploadService.uploadFile(
							param.file,
							fileType,
							ownerId || ''
						);
						param.success({
							url,
						});
					} catch (err) {
						const error = new CustomError(
							t(
								'shared/components/wysiwyg-wrapper/wysiwyg-wrapper___het-opladen-van-de-afbeelding-is-mislukt'
							),
							err,
							{ param }
						);
						console.error(error);
						param.error(error);
					}
				},
				validateFn: (file: File) => {
					if (file.size < 1024 * 1000 * 10) {
						// MAX_FILE_SIZE: 10MB
						return true;
					}
					ToastService.danger(
						t(
							'shared/components/wysiwyg-wrapper/wysiwyg-wrapper___dit-bestand-is-te-groot-max-10-mb'
						)
					);
					return false;
				},
		  }
		: undefined;

	return <WYSIWYG2 {...rest} controls={controls || WYSIWYG2_OPTIONS_DEFAULT} media={media} />;
};

export default WYSIWYG2Wrapper;
