import { MultiRangeProps } from '@viaa/avo2-components/dist/components/MultiRange/MultiRange';
import { GridItem } from '@viaa/avo2-components/dist/content-blocks/BlockGrid/BlockGrid';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import {
	PAGE_OVERVIEW_CONTENT_TYPE_OPTIONS,
	PAGE_OVERVIEW_ITEM_STYLE_OPTIONS,
	PAGE_OVERVIEW_TAB_STYLE_OPTIONS,
} from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType, DefaultContentBlockState,
	PageOverviewBlockComponentStateBlockFields,
	PageOverviewBlockComponentStateFields,
} from '../../content-block.types';

import {
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FILE_FIELD,
	FORM_STATE_DEFAULTS, TAG_INPUT,
	TEXT_FIELD,
} from './defaults';
import { TagsInputProps } from '@viaa/avo2-components/dist/components/TagsInput/TagsInput';

export const INITIAL_PAGE_OVERVIEW_BLOCK_COMPONENT_STATE = (): PageOverviewBlockComponentStateFields => ({
	tabs: [],
	tabStyle: 'MENU_BAR',
	allowMultiple: false,
	contentType: 'PROJECT', // lookup options in lookup.enum_content_types
	itemStyle: 'LIST',
	showTitle: true,
	showDescription: true,
	showDate: false,
	buttonLabel: i18n.t('Lees meer'),
	itemsPerPage: 20,
});

export const INITIAL_PAGE_OVERVIEW_BLOCK_STATE = (
	position: number
): DefaultContentBlockState => {
	return {
		...FORM_STATE_DEFAULTS(
			ContentBlockBackgroundColor.White,
			ContentBlockType.PageOverview,
			position
		),
	};
};

export const PAGE_OVERVIEW_BLOCK_CONFIG = async (position: number = 0): Promise<ContentBlockConfig> => {
	const labels
	return {
		name: i18n.t('Pagina overzicht'),
			components: {
		state: INITIAL_PAGE_OVERVIEW_BLOCK_COMPONENT_STATE(),
			fields: {
			tabs: TAG_INPUT({
				label: i18n.t('Labels'),
				editorProps: { isMulti: true, options:  } as TagsInputProps,
			}),
		},
	},
		block: {
			state: INITIAL_PAGE_OVERVIEW_BLOCK_STATE(position),
				fields: {
			...CONTENT_BLOCK_FIELD_DEFAULTS(),
			},
		},
	}
};
