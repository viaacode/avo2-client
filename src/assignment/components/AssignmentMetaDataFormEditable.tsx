import {
  Alert,
  Button,
  Column,
  Container,
  Form,
  FormGroup,
  Grid,
  Image,
  Spacer,
  TextArea,
} from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { intersection } from 'es-toolkit'
import React, { type FC, useState } from 'react'

import { LomFieldsInput } from '../../shared/components/LomFieldsInput/LomFieldsInput';
import { ShortDescriptionField } from '../../shared/components/ShortDescriptionField/ShortDescriptionField';
import { ThumbnailStillsModal } from '../../shared/components/ThumbnailStillsModal/ThumbnailStillsModal';
import { getBottomLoms } from '../../shared/helpers/get-bottom-loms';
import { EducationLevelType } from '../../shared/helpers/lom';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

type AssignmentMetaDataFormEditableProps = {
  assignment: Avo.Assignment.Assignment
  setAssignment: (newAssignment: Partial<Avo.Assignment.Assignment>) => void
  onFocus?: () => void
}

export const AssignmentMetaDataFormEditable: FC<
  AssignmentMetaDataFormEditableProps
> = ({ assignment, setAssignment, onFocus }) => {
  const [isAssignmentStillsModalOpen, setIsAssignmentStillsModalOpen] =
    useState<boolean>(false)

  const mappedLoms: Avo.Lom.LomField[] = (assignment?.loms || []).map(
    (item) => ({
      ...{ label: '' }, // Fallback
      ...item?.lom,
      id: item?.id || item?.lom_id || '',
    }),
  )

  const onLomsChange = (loms: Avo.Lom.LomField[]) => {
    const mappedLoms = loms.map((lom) => ({
      id: null,
      lom_id: lom.id,
      assignment_id: assignment?.id,
      lom,
    }))

    setAssignment({
      ...assignment,
      loms: mappedLoms,
    })
  }

  const filterSubjects = (
    subject: Avo.Lom.LomField & { related?: string[] },
  ) => {
    const selectedEducationLevels = getBottomLoms(mappedLoms).filter((lom) => {
      return lom?.scheme === EducationLevelType.structuur
    })

    const inter = intersection(
      subject.related || [],
      selectedEducationLevels.map(({ id }) => id),
    )

    return inter.length > 0
  }

  return (
    <>
      <Container mode="vertical">
        <Container mode="horizontal">
          <Form>
            <Spacer margin="bottom">
              <Grid>
                <Column size="3-7" className="u-spacer-bottom">
                  <LomFieldsInput
                    loms={mappedLoms}
                    onChange={onLomsChange}
                    showThemes
                    filterSubjects={filterSubjects}
                  />

                  <ShortDescriptionField
                    value={assignment?.description || ''}
                    placeholder={tText(
                      'assignment/components/assignment-meta-data-form-editable___beschrijf-je-opdracht-in-maximum-300-tekens-dit-is-de-tekst-die-ander-gebruikers-bij-jouw-opdracht-zien-in-de-zoekresultaten-hiermee-kunnen-ze-dan-bepalen-of-deze-beantwoord-aan-wat-ze-zoeken',
                    )}
                    onChange={(value: string) => {
                      {
                        setAssignment({
                          ...assignment,
                          description: value,
                        })
                      }
                    }}
                    onFocus={onFocus}
                  />

                  <FormGroup
                    label={tText(
                      'assignment/components/assignment-meta-data-form-editable___persoonlijke-notities',
                    )}
                    labelFor="personalRemarkId"
                  >
                    <TextArea
                      name="personalRemarkId"
                      value={assignment.note || ''}
                      id="personalRemarkId"
                      height="medium"
                      placeholder={tText(
                        'assignment/components/assignment-meta-data-form-editable___geef-hier-je-eigen-opmerkingen-of-notities-in-deze-zijn-niet-zichtbaar-voor-anderen',
                      )}
                      onChange={(value: string) => {
                        {
                          setAssignment({
                            ...assignment,
                            note: value,
                          })
                        }
                      }}
                      onFocus={onFocus}
                    />
                  </FormGroup>
                </Column>

                <Column size="3-5">
                  <Alert className="u-spacer-bottom">
                    {tHtml(
                      'assignment/components/assignment-meta-data-form-editable___deze-gegevens-dienen-enkel-om-een-opdracht-te-publiceren-en-om-deze-op-te-nemen-in-de-zoek-binnen-het-archief-voor-onderwijs',
                    )}
                  </Alert>

                  <FormGroup
                    label={tText(
                      'assignment/components/assignment-meta-data-form-editable___cover-afbeelding',
                    )}
                    labelFor="coverImageId"
                  >
                    <Button
                      type="secondary"
                      label={tText(
                        'assignment/components/assignment-meta-data-form-editable___stel-een-hoofdafbeelding-in',
                      )}
                      title={tText(
                        'assignment/components/assignment-meta-data-form-editable___kies-een-afbeelding-om-te-gebruiken-als-hoofdafbeelding-van-deze-opdracht',
                      )}
                      onClick={() => setIsAssignmentStillsModalOpen(true)}
                    />

                    {assignment.thumbnail_path && (
                      <Image
                        className="u-spacer-top"
                        src={assignment.thumbnail_path}
                      />
                    )}
                  </FormGroup>
                </Column>
              </Grid>
            </Spacer>
          </Form>
        </Container>
      </Container>

      <ThumbnailStillsModal
        isOpen={isAssignmentStillsModalOpen}
        onClose={(updated) => {
          setIsAssignmentStillsModalOpen(false)

          if (assignment.thumbnail_path !== updated.thumbnail_path) {
            setAssignment({
              ...assignment,
              thumbnail_path: updated.thumbnail_path,
            })
          }
        }}
        subject={assignment}
      />
    </>
  )
}
