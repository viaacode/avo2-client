import { convertToHtml } from '@viaa/avo2-components';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowPlayerWrapper } from '../../../shared/components';
import { CustomiseItemForm } from '../../../shared/components/CustomiseItemForm';
import { WYSIWYG_OPTIONS_AUTHOR } from '../../../shared/constants';
import { isRichTextEmpty } from '../../../shared/helpers';
import { EditBlockProps } from '../../assignment.types';
import { useBlockDescriptionButtons } from '../../hooks';
import { CustomFieldOption } from '../../hooks/assignment-block-description-buttons';
import { AssignmentBlockMeta } from '../AssignmentBlockMeta';

export const AssignmentBlockEditItem: FC<
	EditBlockProps & { customFieldOptions: CustomFieldOption[] }
> = ({ block, setBlock, customFieldOptions }) => {
	const [t] = useTranslation();
	const getButtons = useBlockDescriptionButtons(setBlock, customFieldOptions);

	if (!block.item_meta) {
		return null;
	}

	return (
		<CustomiseItemForm
			className="u-padding-l"
			id={block.item_meta.id}
			preview={() => {
				const item = block.item_meta as ItemSchema;

				return (
					<FlowPlayerWrapper
						item={item}
						poster={item.thumbnail_path}
						external_id={item.external_id}
						duration={item.duration}
						title={item.title}
						cuePoints={{
							start: block.start_oc,
							end: block.end_oc,
						}}
					/>
				);
			}}
			buttons={getButtons(block)}
			title={{
				label: t('assignment/views/assignment-edit___titel-fragment'),
				placeholder: t('assignment/views/assignment-edit___instructies-of-omschrijving'),
				value:
					(!block.use_custom_fields
						? (block as AssignmentBlock).original_title || block.item_meta?.title
						: block.custom_title) || undefined,
				disabled: !block.use_custom_fields,
				onChange: (value) => setBlock(block, { custom_title: value }),
			}}
			description={
				!isRichTextEmpty(block.custom_description) || !block.use_custom_fields
					? {
							label: t('assignment/views/assignment-edit___beschrijving-fragment'),
							initialHtml: convertToHtml(
								!block.use_custom_fields
									? (block as AssignmentBlock).original_description ||
											block.item_meta?.description
									: block.custom_description
							),
							controls: WYSIWYG_OPTIONS_AUTHOR,
							disabled: !block.use_custom_fields,
							onChange: (value) =>
								setBlock(block, {
									custom_description: value.toHTML(),
								}),
					  }
					: undefined
			}
		>
			<AssignmentBlockMeta block={block} />
		</CustomiseItemForm>
	);
};
