import { MultiRangeProps } from '@viaa/avo2-components/dist/components/MultiRange/MultiRange';
import { GridItem } from '@viaa/avo2-components/dist/content-blocks/BlockGrid/BlockGrid';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import { IMAGE_GRID_FILL_OPTIONS, IMAGE_GRID_TEXT_ALIGN_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	ImageGridBlockComponentStateBlockFields,
	ImageGridBlockComponentStateFields,
} from '../../content-block.types';

import {
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FILE_FIELD,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATES = (): ImageGridBlockComponentStateFields[] => [
	{
		source: undefined,
		title: '',
		text: '',
		action: undefined,
	},
];

export const INITIAL_IMAGE_GRID_BLOCK_STATE = (
	position: number
): ImageGridBlockComponentStateBlockFields => {
	return {
		...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.ImageGrid, position),
		elements: [] as GridItem[],
		imageWidth: 200,
		imageHeight: 200,
		itemWidth: 200,
		fill: 'cover',
		textAlign: 'center',
	};
};

export const IMAGE_GRID_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Afbeeldingen grid'),
	components: {
		name: i18n.t('Item'),
		state: INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATES(),
		fields: {
			source: FILE_FIELD(i18n.t('Een afbeelding is verplicht'), {
				label: i18n.t('Afbeelding'),
				editorProps: { assetType: 'CONTENT_PAGE_IMAGE', allowMulti: false } as FileUploadProps,
			}),
			title: TEXT_FIELD('', {
				label: i18n.t('Titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			}),
			text: TEXT_FIELD('', {
				label: i18n.t('Tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			}),
			// action: // TODO add content picker to select what has to happen when the user clicks an element in the grid
		},
	},
	block: {
		state: INITIAL_IMAGE_GRID_BLOCK_STATE(position),
		fields: {
			...CONTENT_BLOCK_FIELD_DEFAULTS(),
			imageWidth: {
				label: i18n.t('Afbeelding breedte'),
				editorType: ContentBlockEditor.MultiRange,
				validator: () => [],
				editorProps: {
					min: 0,
					max: 800,
					step: 1,
					values: [200],
				} as MultiRangeProps,
			},
			imageHeight: {
				label: i18n.t('Afbeelding hoogte'),
				editorType: ContentBlockEditor.MultiRange,
				validator: () => [],
				editorProps: {
					min: 0,
					max: 800,
					step: 1,
					values: [200],
				} as MultiRangeProps,
			},
			itemWidth: {
				label: i18n.t('Item Breedte'),
				editorType: ContentBlockEditor.MultiRange,
				validator: () => [],
				editorProps: {
					min: 0,
					max: 800,
					step: 1,
					values: [200],
				} as MultiRangeProps,
			},
			fill: {
				label: i18n.t('Zoom'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: IMAGE_GRID_FILL_OPTIONS,
				},
			},
			textAlign: {
				label: i18n.t('Text alignatie'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: IMAGE_GRID_TEXT_ALIGN_OPTIONS,
				},
			},
		},
	},
});
