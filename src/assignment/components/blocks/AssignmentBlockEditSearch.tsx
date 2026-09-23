import { convertToHtml } from '@viaa/avo2-components';
import { type FC } from 'react';

import {
  RICH_TEXT_EDITOR_OPTIONS_AUTHOR,
  RICH_TEXT_EDITOR_OPTIONS_DEFAULT,
} from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { TitleDescriptionForm } from '../../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { type EditBlockProps } from '../../assignment.types';
import { AssignmentBlockToggle } from '../AssignmentBlockToggle';

import './AssignmentBlockEditSearch.scss';
import { AvoCoreBlockItemType, PermissionName } from '@viaa/avo2-types';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { useHasPermission } from '../../../shared/hooks/useHasPermission';

export const AssignmentBlockEditSearch: FC<EditBlockProps> = ({
  block,
  setBlock,
}) => {
  const allowedToAddLinks = useHasPermission(
    PermissionName.ADD_HYPERLINK_ASSIGNMENTS,
  );

  return (
    <>
      <TitleDescriptionForm
        className="u-padding-l c-assignment-block-edit__search__title-description"
        id={block.id}
        title={undefined}
        description={{
          label: tText('assignment/hooks/assignment-blocks___omschrijving'),
          placeholder: tText(
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
        }}
      />

      <AssignmentBlockToggle
        heading={tText(
          'assignment/hooks/assignment-blocks___leerlingencollecties-toevoegen',
        )}
        description={tHtml(
          'assignment/hooks/assignment-blocks___met-leerlingencollecties-kunnen-de-leerlingen-hun-zoekresultaten-verzamelen-in-een-collectie-die-jij-als-leerkracht-nadien-kan-inkijken-en-verbeteren',
        )}
        checked={block.type === AvoCoreBlockItemType.BOUW}
        onChange={() => {
          setBlock({
            ...block,
            type:
              block.type === AvoCoreBlockItemType.ZOEK
                ? AvoCoreBlockItemType.BOUW
                : AvoCoreBlockItemType.ZOEK,
          });
        }}
      />
    </>
  );
};
