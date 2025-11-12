import {
  Blankslate,
  Button,
  ButtonToolbar,
  Flex,
  Form,
  IconName,
  ImageGrid,
  Modal,
  ModalBody,
  ModalFooterRight,
  Spacer,
  Spinner,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { compact, uniq } from 'es-toolkit'
import React, { type FC, useEffect, useState } from 'react'

import { STILL_DIMENSIONS } from '../../constants/index.js'
import { tHtml } from '../../helpers/translate-html.js'
import { tText } from '../../helpers/translate-text.js'
import { ToastService } from '../../services/toast-service.js'
import { VideoStillService } from '../../services/video-stills-service.js'

interface ThumbnailStillsModalProps {
  isOpen: boolean
  onClose: (
    collection: Avo.Collection.Collection | Avo.Assignment.Assignment,
  ) => void
  subject: Avo.Collection.Collection | Avo.Assignment.Assignment
}

export const ThumbnailStillsModal: FC<ThumbnailStillsModalProps> = ({
  onClose,
  isOpen,
  subject,
}) => {
  const [videoStills, setVideoStills] = useState<string[] | null>(null)
  const [selectedCoverImages, setSelectedCoverImages] = useState<string[]>(
    subject.thumbnail_path ? [subject.thumbnail_path] : [],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const fetchThumbnailImages = async () => {
      try {
        setVideoStills(
          uniq(
            compact([
              ...((
                subject as Avo.Collection.Collection
              ).collection_fragments?.map(
                (fragment) => fragment.thumbnail_path,
              ) || []),
              ...((subject as Avo.Assignment.Assignment).blocks?.map(
                (block) =>
                  block.item_meta?.thumbnail_path || block.thumbnail_path,
              ) || []),
              ...(await VideoStillService.getThumbnailsForSubject(subject)),
            ]),
          ),
        )
      } catch (err) {
        console.error(err)
        ToastService.danger(
          tHtml(
            'shared/components/thumbnail-stills-modal/thumbnail-stills-modal___het-ophalen-van-de-media-afbeeldingen-is-mislukt',
          ),
        )
        setVideoStills([])
      }
    }

    fetchThumbnailImages()
  }, [isOpen, subject])

  const saveCoverImage = () => {
    onClose({ ...subject, thumbnail_path: selectedCoverImages[0] })
    ToastService.success(
      tHtml(
        'shared/components/thumbnail-stills-modal/thumbnail-stills-modal___de-hoofdafbeelding-is-ingesteld',
      ),
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'shared/components/thumbnail-stills-modal/thumbnail-stills-modal___stel-een-hoofdafbeelding-in',
      )}
      size="large"
      onClose={() => onClose(subject)}
      scrollable
    >
      <ModalBody>
        <Spacer>
          <Form>
            {!videoStills ? (
              <Flex center orientation="horizontal">
                <Spinner size="large" />
              </Flex>
            ) : !videoStills.length ? (
              <Blankslate
                body=""
                icon={IconName.search}
                title={tHtml(
                  'shared/components/thumbnail-stills-modal/thumbnail-stills-modal___er-zijn-geen-video-afbeeldingen-beschikbaar-voor-de-blokken',
                )}
              />
            ) : (
              <ImageGrid
                images={videoStills}
                allowSelect
                value={selectedCoverImages}
                onChange={setSelectedCoverImages}
                {...STILL_DIMENSIONS}
              />
            )}
          </Form>
        </Spacer>
      </ModalBody>
      <ModalFooterRight>
        <Toolbar spaced>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                <Button
                  label={tText(
                    'shared/components/thumbnail-stills-modal/thumbnail-stills-modal___annuleren',
                  )}
                  type="secondary"
                  block
                  onClick={() => {
                    onClose(subject)
                  }}
                />
                <Button
                  label={tText(
                    'shared/components/thumbnail-stills-modal/thumbnail-stills-modal___opslaan',
                  )}
                  type="primary"
                  block
                  onClick={saveCoverImage}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalFooterRight>
    </Modal>
  )
}
