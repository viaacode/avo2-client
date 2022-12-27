import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import { GET_ADMIN_ICON_OPTIONS } from '../../../shared/constants';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	ImageTitleTextButtonBlockComponentState,
} from '../../../shared/types';
import {
	GET_ALIGN_OPTIONS,
	GET_BUTTON_TYPE_OPTIONS,
	GET_HEADING_TYPE_OPTIONS,
} from '../../content-block.const';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, FILE_FIELD, TEXT_FIELD } from './defaults';

export const INITIAL_IMAGE_TITLE_TEXT_BUTTON_COMPONENTS_STATE =
	(): ImageTitleTextButtonBlockComponentState => ({
		buttonLabel: '',
		buttonType: 'secondary',
		content: '',
		headingTitle: '',
		headingType: 'h2',
		imagePosition: 'left',
	});

export const INITIAL_IMAGE_TITLE_TEXT_BUTTON_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS();

export const IMAGE_TITLE_TEXT_BUTTON_BLOCK_CONFIG = (position = 0): ContentBlockConfig => ({
	position,
	name: i18n.t(
		'admin/content-block/helpers/generators/image-title-text-button___afbeelding-met-titel-tekst-en-knop'
	),
	type: ContentBlockType.ImageTitleTextButton,
	components: {
		state: INITIAL_IMAGE_TITLE_TEXT_BUTTON_COMPONENTS_STATE(),
		fields: {
			imageSource: FILE_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/image___een-afbeelding-is-verplicht'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/image___afbeelding'),
					editorProps: { assetType: 'CONTENT_BLOCK_IMAGE' } as FileUploadProps,
				}
			),
			imageAction: {
				label: i18n.t('Link achter de afbeelding'),
				editorType: ContentBlockEditor.ContentPicker,
			},
			imageAlt: TEXT_FIELD('', {
				label: i18n.t(
					'admin/content-block/helpers/generators/image-title-text-button___alt-tekst-voor-de-afbeelding'
				),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			imagePosition: {
				label: i18n.t(
					'admin/content-block/helpers/generators/image-title-text-button___positie-van-de-afbeelding'
				),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_ALIGN_OPTIONS().filter((option) =>
						['left', 'right'].includes(option.value)
					),
				},
			},
			headingTitle: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/heading___titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			headingType: {
				label: i18n.t('admin/content-block/helpers/generators/heading___stijl'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_HEADING_TYPE_OPTIONS(),
				},
			},
			content: TEXT_FIELD(),
			buttonType: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___knop-type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_BUTTON_TYPE_OPTIONS(),
				},
			},
			buttonLabel: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___knop-tekst'),
				editorType: ContentBlockEditor.TextInput,
			},
			buttonAltTitle: TEXT_FIELD('', {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player-title-text-button___alt-title-text'
				),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonIcon: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___knop-icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: GET_ADMIN_ICON_OPTIONS(),
				},
			},
			buttonAction: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player-title-text-button___knop-actie'
				),
				editorType: ContentBlockEditor.ContentPicker,
			},
		},
	},
	block: {
		state: INITIAL_IMAGE_TITLE_TEXT_BUTTON_BLOCK_STATE(),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
