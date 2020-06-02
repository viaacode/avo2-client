import { GridItem } from '@viaa/avo2-components';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	ImageGridBlockComponentStateFields,
} from '../../../shared/types';
import { BlockGridWrapperProps } from '../../components/wrappers/ImageGridWrapper/ImageGridWrapper';
import {
	GET_ALIGN_OPTIONS,
	GET_BUTTON_TYPE_OPTIONS,
	GET_FILL_OPTIONS,
	GET_IMAGE_GRID_FORMAT_OPTIONS,
} from '../../content-block.const';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, FILE_FIELD, TEXT_FIELD } from './defaults';

export const INITIAL_IMAGE_GRID_COMPONENTS_STATE = (): ImageGridBlockComponentStateFields[] => [
	{
		source: undefined,
		title: '',
		text: '',
		buttonLabel: '',
		buttonType: 'primary',
		buttonTitle: '',
		action: undefined,
	} as any,
];

export const INITIAL_IMAGE_GRID_BLOCK_STATE = (
	position: number
): BlockGridWrapperProps & DefaultContentBlockState => {
	return {
		...BLOCK_STATE_DEFAULTS({
			position,
			blockType: ContentBlockType.ImageGrid,
			padding: {
				top: 'top-large',
				bottom: 'bottom',
			},
		}),
		elements: [] as GridItem[],
		format: 'squareLarge',
		fill: 'cover',
		textAlign: 'center',
	};
};

export const IMAGE_GRID_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/image-grid___afbeeldingen-grid'),
	type: ContentBlockType.ImageGrid,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/image-grid___item'),
		state: INITIAL_IMAGE_GRID_COMPONENTS_STATE(),
		fields: {
			source: FILE_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/image-grid___een-afbeelding-is-verplicht'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/image-grid___afbeelding'),
					editorProps: {
						assetType: 'CONTENT_PAGE_IMAGE',
						allowMulti: false,
					} as FileUploadProps,
				}
			),
			title: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			text: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonLabel: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___knop-tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonTitle: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___knop-tooltip'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonType: {
				label: i18n.t(
					'admin/content-block/helpers/generators/image-grid___knop-type-kleur'
				),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_BUTTON_TYPE_OPTIONS(),
				},
			},
			action: {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___link'),
				editorType: ContentBlockEditor.ContentPicker,
			},
		},
	},
	block: {
		state: INITIAL_IMAGE_GRID_BLOCK_STATE(position),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
			format: {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___formaat'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_IMAGE_GRID_FORMAT_OPTIONS(),
				},
			},
			fill: {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___zoom'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_FILL_OPTIONS(),
				},
			},
			textAlign: {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___text-alignatie'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_ALIGN_OPTIONS(),
				},
			},
		},
	},
});
