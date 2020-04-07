import { isEmpty, isNil, without } from 'lodash-es';

import { SelectOption, WYSIWYGProps } from '@viaa/avo2-components';

import { WYSIWYG_OPTIONS_ALIGN, WYSIWYG_OPTIONS_FULL } from '../../../../shared/constants';
import i18n from '../../../../shared/translations/i18n';
import { UserGroupSelectProps } from '../../../shared/components';
import {
	Color,
	ContentBlockEditor,
	ContentBlockField,
	ContentBlockType,
	DefaultContentBlockState,
	PaddingFieldState,
} from '../../../shared/types';

import {
	GET_ALIGN_OPTIONS,
	GET_BACKGROUND_COLOR_OPTIONS,
	GET_FOREGROUND_COLOR_OPTIONS,
} from '../../content-block.const';

// Block config defaults
export const BLOCK_STATE_DEFAULTS = (
	blockType: ContentBlockType,
	position: number,
	backgroundColor: Color = Color.White,
	headerBackgroundColor: Color = Color.Transparent,
	headerHeight: string = '0', // Currently we only need 2 block background colors for the PageOverviewBlock component
	padding: PaddingFieldState = {
		top: 'top',
		bottom: 'bottom',
	},
	userGroupIds: number[] = [] // empty list means everybody with access to the page can see this content block
): DefaultContentBlockState => ({
	blockType,
	position,
	backgroundColor,
	headerBackgroundColor,
	headerHeight,
	padding,
	userGroupIds,
});

export const BLOCK_FIELD_DEFAULTS = () => ({
	backgroundColor: BACKGROUND_COLOR_FIELD(),
	headerBackgroundColor: BACKGROUND_COLOR_FIELD(i18n.t('Titelbalk achtergrondkleur'), {
		label: i18n.t('Transparant'),
		value: Color.Transparent,
	}),
	padding: PADDING_FIELD(),
	userGroupIds: USER_GROUP_SELECT(),
});

// Recurring fields
export const FOREGROUND_COLOR_FIELD = (
	label: string = i18n.t('Tekst kleur'),
	defaultValue?: SelectOption<Color>
): ContentBlockField => ({
	label,
	editorType: ContentBlockEditor.ColorSelect,
	editorProps: {
		options: GET_FOREGROUND_COLOR_OPTIONS(),
		defaultValue: defaultValue || GET_FOREGROUND_COLOR_OPTIONS()[0],
	},
});

export const BACKGROUND_COLOR_FIELD = (
	label: string = i18n.t('admin/content-block/helpers/generators/defaults___achtergrondkleur'),
	defaultValue?: SelectOption<Color>
): ContentBlockField => ({
	label,
	editorType: ContentBlockEditor.ColorSelect,
	editorProps: {
		options: GET_BACKGROUND_COLOR_OPTIONS(),
		defaultValue: defaultValue || GET_BACKGROUND_COLOR_OPTIONS()[0],
	},
});

export const PADDING_FIELD = (
	label = i18n.t('admin/content-block/helpers/generators/defaults___padding')
): ContentBlockField => ({
	label,
	editorType: ContentBlockEditor.PaddingSelect,
});

export const USER_GROUP_SELECT = (label = i18n.t('Zichtbaar voor')): ContentBlockField => ({
	label,
	editorType: ContentBlockEditor.UserGroupSelect,
	editorProps: {
		placeholder: i18n.t('Iedereen met toegang tot de pagina'),
	} as UserGroupSelectProps,
});

export const ALIGN_FIELD = (
	label: string = i18n.t('admin/content-block/helpers/generators/defaults___uitlijning')
): ContentBlockField => ({
	label,
	editorType: ContentBlockEditor.AlignSelect,
	editorProps: {
		options: GET_ALIGN_OPTIONS(),
	},
});

export const TEXT_FIELD = (
	emptyFieldValidatorMessage = i18n.t(
		'admin/content-block/helpers/generators/defaults___tekst-is-verplicht'
	),
	propOverride?: Partial<ContentBlockField>
): ContentBlockField => ({
	label: i18n.t('admin/content-block/helpers/generators/defaults___tekst'),
	editorType: ContentBlockEditor.WYSIWYG,
	validator: (value: string) => {
		const errorArray: string[] = [];

		if (isNil(value) || isEmpty(value)) {
			errorArray.push(emptyFieldValidatorMessage);
		}

		return errorArray;
	},
	editorProps: {
		btns: without(WYSIWYG_OPTIONS_FULL, WYSIWYG_OPTIONS_ALIGN),
		plugins: {
			table: {
				styler: 'c-table--styled',
			},
		},
	} as Partial<WYSIWYGProps>,
	...propOverride,
});

export const FILE_FIELD = (
	emptyFieldValidatorMessage = i18n.t(
		'admin/content-block/helpers/generators/defaults___een-bestand-is-verplicht'
	),
	propOverride?: Partial<ContentBlockField>
): ContentBlockField => ({
	label: i18n.t('admin/content-block/helpers/generators/defaults___bestand'),
	editorType: ContentBlockEditor.FileUpload,
	validator: (value: string) => {
		const errorArray: string[] = [];

		if (isNil(value) || isEmpty(value)) {
			errorArray.push(emptyFieldValidatorMessage);
		}

		return errorArray;
	},
	editorProps: { type: 'CONTENT_PAGE_IMAGE' },
	...propOverride,
});

export const CONTENT_TYPE_AND_LABELS_INPUT = (
	propOverride?: Partial<ContentBlockField>
): ContentBlockField => ({
	label: i18n.t('admin/content-block/helpers/generators/defaults___type-en-labels'),
	editorType: ContentBlockEditor.ContentTypeAndLabelsPicker,
	validator: () => [],
	...propOverride,
});
