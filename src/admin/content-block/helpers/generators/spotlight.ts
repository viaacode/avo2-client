import { ImageInfo } from '@viaa/avo2-components';
import { times } from 'lodash-es';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import { tText } from '../../../../shared/helpers/translate';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, FILE_FIELD, TEXT_FIELD } from './defaults';

export const INITIAL_SPOTLIGHT_COMPONENTS_STATE = (): ImageInfo[] =>
	times(
		3,
		() =>
			({
				image: undefined,
				title: '',
				buttonAction: undefined,
			} as any)
	);

export const INITIAL_SPOTLIGHT_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'top-small',
			bottom: 'bottom-extra-large',
		},
	});

export const SPOTLIGHT_BLOCK_CONFIG = (position = 0): ContentBlockConfig => ({
	position,
	name: tText('admin/content-block/helpers/generators/spotlight___in-de-kijker'),
	type: ContentBlockType.Spotlight,
	components: {
		name: tText('admin/content-block/helpers/generators/spotlight___item'),
		limits: {
			min: 3,
			max: 3,
		},
		state: INITIAL_SPOTLIGHT_COMPONENTS_STATE(),
		fields: {
			image: FILE_FIELD(
				tText(
					'admin/content-block/helpers/generators/spotlight___een-afbeelding-is-verplicht'
				),
				{
					label: tText('admin/content-block/helpers/generators/spotlight___afbeelding'),
					editorProps: {
						assetType: 'CONTENT_BLOCK_IMAGE',
						allowMulti: false,
					} as FileUploadProps,
				}
			),
			title: TEXT_FIELD('', {
				label: tText('admin/content-block/helpers/generators/spotlight___titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonAction: {
				label: tText('admin/content-block/helpers/generators/spotlight___link'),
				editorType: ContentBlockEditor.ContentPicker,
			},
		},
	},
	block: {
		state: INITIAL_SPOTLIGHT_BLOCK_STATE(),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
