import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	QuoteBlockComponentState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, FILE_FIELD, TEXT_FIELD } from './defaults';

export const INITIAL_QUOTE_COMPONENTS_STATE = (): QuoteBlockComponentState => ({
	quote: '',
	authorName: '',
	authorInitials: '',
});

export const INITIAL_QUOTE_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'top-small',
			bottom: 'bottom-small',
		},
	});

export const QUOTE_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	position,
	name: i18n.t('admin/content-block/helpers/generators/quote___quote'),
	type: ContentBlockType.Intro,
	components: {
		state: INITIAL_QUOTE_COMPONENTS_STATE(),
		fields: {
			quote: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/quote___quote-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/quote___quote'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			authorName: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/quote___auteur-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/quote___auteur'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			authorInitials: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/quote___initialen-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/quote___initialen'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			authorImage: FILE_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/image___een-afbeelding-is-verplicht'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/image___afbeelding'),
					editorProps: { assetType: 'CONTENT_BLOCK_IMAGE' } as FileUploadProps,
				}
			),
		},
	},
	block: {
		state: INITIAL_QUOTE_BLOCK_STATE(),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
