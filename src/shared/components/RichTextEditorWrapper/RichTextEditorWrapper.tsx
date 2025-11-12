import {
  RichTextEditor,
  type RichTextEditorMedia,
  type RichTextEditorProps,
  type RichTextEditorUploadInfo,
} from '@meemoo/react-components'
import { type Avo } from '@viaa/avo2-types'
import { isEqual } from 'es-toolkit'
import React, { type FC } from 'react'

import { CustomError } from '../../helpers/custom-error.js'
import { tHtml } from '../../helpers/translate-html.js'
import { tText } from '../../helpers/translate-text.js'
import { FileUploadService } from '../../services/file-upload-service.js'
import { ToastService } from '../../services/toast-service.js'

import { RICH_TEXT_EDITOR_OPTIONS_DEFAULT } from './RichTextEditor.consts.js'

import './RichTextEditorWrapper.scss'

export type RichTextEditorWrapperProps = RichTextEditorProps & {
  fileType?: Avo.FileUpload.AssetType // Required to enable file upload
  ownerId?: string
  className?: string
}

/**
 * Handle RichTextEditor default controls and upload function
 * @param props
 * @constructor
 */
export const RichTextEditorWrapper: FC<RichTextEditorWrapperProps> = (
  props,
) => {
  const { controls, fileType, ownerId, state, onChange, ...rest } = props

  if ((controls || []).includes('media') && !fileType) {
    console.error(
      new CustomError(
        'Trying to initialize RichTextEditorWrapper component with media without fileType',
        null,
        props,
      ),
    )
  }

  const media: RichTextEditorMedia | undefined = fileType
    ? {
        uploadFn: async (param: RichTextEditorUploadInfo) => {
          try {
            const url = await FileUploadService.uploadFile(
              param.file,
              fileType,
              ownerId || '',
            )
            param.success({
              url,
            })
          } catch (err) {
            const error = new CustomError(
              tText(
                'shared/components/wysiwyg-wrapper/wysiwyg-wrapper___het-opladen-van-de-afbeelding-is-mislukt',
              ),
              err,
              { param },
            )
            console.error(error)
            param.error(error)
          }
        },
        validateFn: (file: File) => {
          if (file.size < 1024 * 1000 * 10) {
            // MAX_FILE_SIZE: 10MB
            return true
          }
          ToastService.danger(
            tHtml(
              'shared/components/wysiwyg-wrapper/wysiwyg-wrapper___dit-bestand-is-te-groot-max-10-mb',
            ),
          )
          return false
        },
      }
    : undefined

  return (
    <RichTextEditor
      {...rest}
      controls={controls || RICH_TEXT_EDITOR_OPTIONS_DEFAULT}
      media={media}
      state={state}
      onChange={(newState) => {
        if (!!onChange && !isEqual(newState, state)) {
          onChange(newState)
        }
      }}
    />
  )
}
