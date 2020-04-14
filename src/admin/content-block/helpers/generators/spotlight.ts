import { times } from 'lodash-es';

import { ImageInfo } from '@viaa/avo2-components';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';

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

export const INITIAL_SPOTLIGHT_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.Spotlight, position);

export const SPOTLIGHT_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/spotlight___in-de-kijker'),
	type: ContentBlockType.Spotlight,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/spotlight___item'),
		limits: {
			min: 3,
			max: 3,
		},
		state: INITIAL_SPOTLIGHT_COMPONENTS_STATE(),
		fields: {
			image: FILE_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/spotlight___een-afbeelding-is-verplicht'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/spotlight___afbeelding'),
					editorProps: {
						assetType: 'CONTENT_PAGE_IMAGE',
						allowMulti: false,
					} as FileUploadProps,
				}
			),
			title: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/spotlight___titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			}),
			buttonAction: {
				label: i18n.t('admin/content-block/helpers/generators/spotlight___link'),
				editorType: ContentBlockEditor.ContentPicker,
			},
		},
	},
	block: {
		state: INITIAL_SPOTLIGHT_BLOCK_STATE(position),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
