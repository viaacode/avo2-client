import { convertToHtml } from '@viaa/avo2-components';
import React, { FC } from 'react';

import { TitleDescriptionForm } from '../../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { WYSIWYG_OPTIONS_AUTHOR } from '../../../shared/constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { EditBlockProps } from '../../assignment.types';

export const AssignmentBlockEditText: FC<EditBlockProps> = ({ block, setBlock }) => {
	const { tText } = useTranslation();

	return (
		<TitleDescriptionForm
			className="u-padding-l"
			id={block.id}
			title={{
				label: tText('assignment/views/assignment-edit___titel'),
				placeholder: tText(
					'assignment/views/assignment-edit___instructies-of-omschrijving'
				),
				value: block.custom_title || '',
				onChange: (value) => setBlock({ ...block, custom_title: value }),
			}}
			description={{
				placeholder: tText(
					'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee'
				),
				initialHtml: convertToHtml(block.custom_description),
				controls: WYSIWYG_OPTIONS_AUTHOR,
				enabledHeadings: ['h3', 'h4', 'normal'],
				onChange: (value) =>
					setBlock({
						...block,
						custom_description: value.toHTML(),
					}),
			}}
		/>
	);
};
