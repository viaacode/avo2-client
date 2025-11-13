import { convertToHtml } from '@viaa/avo2-components'
import React, { type FC } from 'react'

import { RICH_TEXT_EDITOR_OPTIONS_AUTHOR } from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { TitleDescriptionForm } from '../../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { type EditBlockProps } from '../../assignment.types';
import { AssignmentBlockToggle } from '../AssignmentBlockToggle';

import './AssignmentBlockEditSearch.scss'
import { tText } from '../../../shared/helpers/translate-text';
import { tHtml } from '../../../shared/helpers/translate-html';
import { Avo } from '@viaa/avo2-types'

export const AssignmentBlockEditSearch: FC<EditBlockProps> = ({
  block,
  setBlock,
}) => {
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
          initialHtml: convertToHtml(block.custom_description),
          controls: RICH_TEXT_EDITOR_OPTIONS_AUTHOR,
          enabledHeadings: ['h3', 'h4', 'normal'],
          onChange: (value) =>
            setBlock({
              ...block,
              custom_description: value.toHTML(),
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
        checked={block.type === Avo.Core.BlockItemType.BOUW}
        onChange={() => {
          setBlock({
            ...block,
            type:
              block.type === Avo.Core.BlockItemType.ZOEK
                ? Avo.Core.BlockItemType.BOUW
                : Avo.Core.BlockItemType.ZOEK,
          })
        }}
      />
    </>
  )
}
