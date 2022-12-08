import { tText } from '../../../../shared/helpers/translate';
import {
	AnchorLinksBlockComponentState,
	AnchorLinksBlockState,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
} from '../../../shared/types';
import { GET_UNDERLINED_LINK_BUTTON_TYPE_OPTIONS } from '../../content-block.const';

import { ALIGN_FIELD, BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_ANCHOR_LINKS_COMPONENTS_STATE = (): AnchorLinksBlockComponentState[] => [
	{
		label: '',
		type: 'underlined-link',
	},
];

export const INITIAL_ANCHOR_LINKS_BLOCK_STATE = (): AnchorLinksBlockState => ({
	...BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'top',
			bottom: 'bottom',
		},
	}),
	align: 'center',
	hasDividers: true,
});

export const ANCHOR_LINKS_BLOCK_CONFIG = (position = 0): ContentBlockConfig => ({
	position,
	name: tText('admin/content-block/helpers/generators/anchor-links___links'),
	type: ContentBlockType.AnchorLinks,
	components: {
		name: tText('admin/content-block/helpers/generators/anchor-links___link'),
		state: INITIAL_ANCHOR_LINKS_COMPONENTS_STATE(),
		fields: {
			label: TEXT_FIELD(
				tText('admin/content-block/helpers/generators/buttons___knoptekst-is-verplicht'),
				{
					label: tText('admin/content-block/helpers/generators/buttons___tekst'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			type: {
				label: tText('admin/content-block/helpers/generators/anchor-links___kleur'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_UNDERLINED_LINK_BUTTON_TYPE_OPTIONS(),
				},
			},
			buttonAction: {
				label: tText('admin/content-block/helpers/generators/anchor-links___link'),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: ['ANCHOR_LINK'],
					hideTargetSwitch: true,
					hideTypeDropdown: true,
				},
			},
		},
	},
	block: {
		state: INITIAL_ANCHOR_LINKS_BLOCK_STATE(),
		fields: {
			align: ALIGN_FIELD(),
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
