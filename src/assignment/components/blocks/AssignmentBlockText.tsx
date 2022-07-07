import { convertToHtml } from '@viaa/avo2-components';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TitleDescriptionForm } from '../../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { WYSIWYG_OPTIONS_AUTHOR } from '../../../shared/constants';
import { EditBlockProps } from '../../assignment.types';

export const AssignmentBlockText: FC<EditBlockProps> = ({ block, setBlock }) => {
	const [t] = useTranslation();

	return (
		<TitleDescriptionForm
			className="u-padding-l"
			id={block.id}
			title={{
				label: t('assignment/views/assignment-edit___titel'),
				placeholder: t('assignment/views/assignment-edit___instructies-of-omschrijving'),
				value: block.custom_title || '',
				onChange: (value) => setBlock(block, { custom_title: value }),
			}}
			description={{
				placeholder: t(
					'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee'
				),
				initialHtml: convertToHtml(block.custom_description),
				controls: WYSIWYG_OPTIONS_AUTHOR,
				onChange: (value) =>
					setBlock(block, {
						custom_description: value.toHTML(),
					}),
			}}
		/>
	);
};
