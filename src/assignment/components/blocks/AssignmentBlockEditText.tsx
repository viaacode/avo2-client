import { convertToHtml } from '@viaa/avo2-components';
import React, { type FC } from 'react';

import { RICH_TEXT_EDITOR_OPTIONS_AUTHOR } from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { TitleDescriptionForm } from '../../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { tText } from '../../../shared/helpers/translate-text';
import { type EditBlockProps } from '../../assignment.types';

export const AssignmentBlockEditText: FC<EditBlockProps> = ({ block, setBlock, onFocus }) => {
	return (
		<TitleDescriptionForm
			className="u-padding-l"
			id={block.id}
			title={{
				label: block.assignment_response_id
					? tText('assignment/components/blocks/assignment-block-edit-text___titel')
					: tText('assignment/views/assignment-edit___titel'),
				placeholder: block.assignment_response_id
					? tText(
							'assignment/components/blocks/assignment-block-edit-text___omschrijving'
					  )
					: tText('assignment/views/assignment-edit___instructies-of-omschrijving'),
				value: block.custom_title || '',
				onChange: (value) => setBlock({ ...block, custom_title: value }),
				onFocus,
			}}
			description={{
				placeholder: block.assignment_response_id
					? tText(
							'assignment/components/blocks/assignment-block-edit-text___vul-een-omschrijving-in'
					  )
					: tText(
							'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee'
					  ),
				initialHtml: convertToHtml(block.custom_description),
				controls: RICH_TEXT_EDITOR_OPTIONS_AUTHOR,
				enabledHeadings: ['h3', 'h4', 'normal'],
				onChange: (value) =>
					setBlock({
						...block,
						custom_description: value.toHTML(),
					}),
				onFocus,
			}}
		/>
	);
};
