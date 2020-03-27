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

export const INITIAL_QUOTE_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.Quote, position);

export const QUOTE_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Quote'),
	type: ContentBlockType.Intro,
	components: {
		state: INITIAL_QUOTE_COMPONENTS_STATE(),
		fields: {
			quote: TEXT_FIELD(i18n.t('Quote is verplicht'), {
				label: i18n.t('Quote'),
				editorType: ContentBlockEditor.TextInput,
			}),
			authorName: TEXT_FIELD(i18n.t('Auteur is verplicht'), {
				label: i18n.t('Auteur'),
				editorType: ContentBlockEditor.TextInput,
			}),
			authorInitials: TEXT_FIELD(i18n.t('Initialen is verplicht'), {
				label: i18n.t('Initialen'),
				editorType: ContentBlockEditor.TextInput,
			}),
			authorImage: FILE_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/image___een-afbeelding-is-verplicht'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/image___afbeelding'),
					editorProps: { assetType: 'CONTENT_PAGE_IMAGE' } as FileUploadProps,
				}
			),
		},
	},
	block: {
		state: INITIAL_QUOTE_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
