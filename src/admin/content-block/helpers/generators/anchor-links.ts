import i18n from '../../../../shared/translations/i18n';
import { ContentPickerProps } from '../../../shared/components/ContentPicker/ContentPicker';
import {
	AnchorLinksBlockComponentState,
	AnchorLinksBlockState,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
} from '../../../shared/types';

import { ALIGN_FIELD, BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_ANCHOR_LINKS_COMPONENTS_STATE = (): AnchorLinksBlockComponentState[] => [
	{
		label: '',
		type: 'underlined-link',
	},
];

export const INITIAL_ANCHOR_LINKS_BLOCK_STATE = (position: number): AnchorLinksBlockState => ({
	...BLOCK_STATE_DEFAULTS(ContentBlockType.AnchorLinks, position),
	align: 'center',
	hasDividers: true,
});

export const ANCHOR_LINKS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/anchor-links___links'),
	type: ContentBlockType.AnchorLinks,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/anchor-links___link'),
		state: INITIAL_ANCHOR_LINKS_COMPONENTS_STATE(),
		fields: {
			label: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/buttons___knoptekst-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/buttons___tekst'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			buttonAction: {
				label: i18n.t('admin/content-block/helpers/generators/buttons___knop-actie'),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: ['ANCHOR_LINK'],
					hideTargetSwitch: true,
					hideTypeDropdown: true,
				} as ContentPickerProps,
			},
		},
	},
	block: {
		state: INITIAL_ANCHOR_LINKS_BLOCK_STATE(position),
		fields: {
			align: ALIGN_FIELD(),
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
