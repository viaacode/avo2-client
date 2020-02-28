import { times } from 'lodash-es';

import { ImageInfo } from '@viaa/avo2-components';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';

import { DEFAULT_ALLOWED_TYPES } from '../../../shared/components/ContentPicker/ContentPicker.const';
import {
	BackgroundColorOption,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../../shared/types';

import {
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FILE_FIELD,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_PROJECTS_SPOTLIGHT_BLOCK_COMPONENT_STATES = (): ImageInfo[] =>
	times(
		3,
		() =>
			({
				image: undefined,
				title: '',
				buttonAction: undefined,
			} as any)
	);

export const INITIAL_PROJECTS_SPOTLIGHT_BLOCK_STATE = (
	position: number
): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(BackgroundColorOption.White, ContentBlockType.ProjectsSpotlight, position);

export const PROJECTS_SPOTLIGHT_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t(
		'admin/content-block/helpers/generators/projects-spotlight___projecten-in-de-kijker'
	),
	type: ContentBlockType.ProjectsSpotlight,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/projects-spotlight___project'),
		limits: {
			min: 3,
			max: 3,
		},
		state: INITIAL_PROJECTS_SPOTLIGHT_BLOCK_COMPONENT_STATES(),
		fields: {
			image: FILE_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/projects-spotlight___een-afbeelding-is-verplicht'
				),
				{
					label: i18n.t(
						'admin/content-block/helpers/generators/projects-spotlight___afbeelding'
					),
					editorProps: {
						assetType: 'CONTENT_PAGE_IMAGE',
						allowMulti: false,
					} as FileUploadProps,
				}
			),
			title: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/projects-spotlight___titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			}),
			buttonAction: {
				label: i18n.t('admin/content-block/helpers/generators/projects-spotlight___link'),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: DEFAULT_ALLOWED_TYPES,
				},
			},
		},
	},
	block: {
		state: INITIAL_PROJECTS_SPOTLIGHT_BLOCK_STATE(position),
		fields: {
			...CONTENT_BLOCK_FIELD_DEFAULTS(),
		},
	},
});
