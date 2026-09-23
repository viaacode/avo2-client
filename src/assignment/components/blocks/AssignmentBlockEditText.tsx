import { convertToHtml } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import { type FC } from 'react';

import {
  RICH_TEXT_EDITOR_OPTIONS_AUTHOR,
  RICH_TEXT_EDITOR_OPTIONS_DEFAULT,
} from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { TitleDescriptionForm } from '../../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { tText } from '../../../shared/helpers/translate-text';
import { useHasPermission } from '../../../shared/hooks/useHasPermission';
import { type EditBlockProps } from '../../assignment.types';

export const AssignmentBlockEditText: FC<EditBlockProps> = ({
  block,
  setBlock,
  onFocus,
}) => {
  const allowedToAddLinks = useHasPermission(
    PermissionName.ADD_HYPERLINK_ASSIGNMENTS,
  );

  return (
    <TitleDescriptionForm
      className="u-padding-l"
      id={block.id}
      title={{
        label: block.assignment_response_id
          ? tText(
              'assignment/components/blocks/assignment-block-edit-text___titel',
            )
          : tText('assignment/views/assignment-edit___titel'),
        placeholder: block.assignment_response_id
          ? tText(
              'assignment/components/blocks/assignment-block-edit-text___omschrijving',
            )
          : tText(
              'assignment/views/assignment-edit___instructies-of-omschrijving',
            ),
        value: block.custom_title || '',
        onChange: (value) => setBlock({ ...block, custom_title: value }),
        onFocus,
      }}
      description={{
        placeholder: block.assignment_response_id
          ? tText(
              'assignment/components/blocks/assignment-block-edit-text___vul-een-omschrijving-in',
            )
          : tText(
              'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee',
            ),
        value: convertToHtml(block.custom_description),
        controls: allowedToAddLinks
          ? RICH_TEXT_EDITOR_OPTIONS_AUTHOR
          : RICH_TEXT_EDITOR_OPTIONS_DEFAULT,
        enabledHeadings: ['h3', 'h4', 'normal'],
        onChange: (value) =>
          setBlock({
            ...block,
            custom_description: value,
          }),
        onFocus,
      }}
    />
  );
};
