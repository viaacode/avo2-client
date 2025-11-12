import {
  Alert,
  Column,
  Container,
  DatePicker,
  type DefaultProps,
  Form,
  FormGroup,
  Grid,
  Spacer,
  TextInput,
} from '@viaa/avo2-components'
import { clsx } from 'clsx'
import { isAfter, isPast } from 'date-fns'
import { useAtomValue } from 'jotai'
import React, { type FC, useCallback } from 'react'

import { commonUserAtom } from '../../authentication/authentication.store.js'
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { tHtml } from '../../shared/helpers/translate-html.js'
import { tText } from '../../shared/helpers/translate-text.js'
import { ToastService } from '../../shared/services/toast-service.js'
import { endOfAcademicYear } from '../helpers/academic-year.js'
import { isDeadlineBeforeAvailableAt } from '../helpers/is-deadline-before-available-at.js'
import { mergeWithOtherLabels } from '../helpers/merge-with-other-labels.js'
import { type AssignmentFields } from '../hooks/assignment-form.js'

import { AssignmentLabels } from './AssignmentLabels.js'

import './AssignmentDetailsForm.scss'
import { Avo } from '@viaa/avo2-types'

const AssignmentDetailsFormIds = {
  classrooms: 'c-assignment-details-form__classrooms', // labels with type 'CLASS'
  labels: 'c-assignment-details-form__labels', // labels with type 'LABEL'
  available_at: 'c-assignment-details-form__available_at',
  deadline_at: 'c-assignment-details-form__deadline_at',
  answer_url: 'c-assignment-details-form__answer_url',
}

interface AssignmentDetailsFormEditableProps {
  assignment: Partial<AssignmentFields>
  setAssignment: (newAssignmentFields: Partial<AssignmentFields>) => void
  onFocus?: () => void
}

export const AssignmentDetailsFormEditable: FC<
  AssignmentDetailsFormEditableProps & DefaultProps
> = ({ assignment, setAssignment, className, style, onFocus }) => {
  const commonUser = useAtomValue(commonUserAtom)

  const getId = useCallback(
    (key: string | number) => `${assignment.id}--${key}`,
    [assignment.id],
  )

  // Render

  if (!commonUser) {
    return <FullPageSpinner />
  }

  const deadline = assignment.deadline_at
    ? new Date(assignment.deadline_at)
    : null
  const availableAt = assignment.available_at
    ? new Date(assignment.available_at)
    : new Date()
  return (
    <div className={clsx('c-assignment-details-form', className)} style={style}>
      <Container mode="vertical">
        <Container mode="horizontal">
          <Form>
            <Spacer margin="bottom">
              <Grid>
                <Column size="3-7" className="u-spacer-bottom">
                  <FormGroup
                    label={tText('assignment/assignment___klas')}
                    labelFor={getId(AssignmentDetailsFormIds.classrooms)}
                  >
                    <AssignmentLabels
                      type={Avo.Assignment.LabelType.CLASS}
                      id={getId(AssignmentDetailsFormIds.classrooms)}
                      labels={(assignment.labels || []).filter(
                        (item) =>
                          item.assignment_label.type ===
                          Avo.Assignment.LabelType.CLASS,
                      )}
                      dictionary={{
                        placeholder: tText(
                          'assignment/components/assignment-details-form-editable___voeg-een-klas-toe',
                        ),
                        empty: tText(
                          'assignment/components/assignment-details-form-editable___geen-klassen-beschikbaar',
                        ),
                      }}
                      onChange={(changed) => {
                        let target = changed

                        if (changed.length > 1) {
                          ToastService.danger(
                            tHtml(
                              'assignment/components/assignment-details-form-editable___opgepast-je-kan-maar-1-klas-instellen-per-opdracht',
                            ),
                          )
                          target = [changed[0]]
                        }

                        const newLabels = mergeWithOtherLabels(
                          assignment.labels || [],
                          target,
                          Avo.Assignment.LabelType.CLASS,
                        )

                        setAssignment({
                          ...assignment,
                          labels: newLabels,
                        })
                      }}
                    />
                  </FormGroup>

                  <FormGroup
                    label={`${tText('assignment/assignment___label')} (${tText(
                      'assignment/assignment___optioneel',
                    )})`}
                    labelFor={getId(AssignmentDetailsFormIds.labels)}
                  >
                    <AssignmentLabels
                      type={Avo.Assignment.LabelType.LABEL}
                      id={getId(AssignmentDetailsFormIds.labels)}
                      labels={(assignment.labels || []).filter(
                        (item) => item.assignment_label.type === 'LABEL',
                      )}
                      dictionary={{
                        placeholder: tText(
                          'assignment/components/assignment-details-form-editable___voeg-een-label-toe',
                        ),
                        empty: tText(
                          'assignment/components/assignment-details-form-editable___geen-labels-beschikbaar',
                        ),
                      }}
                      onChange={(changed) => {
                        setAssignment({
                          ...assignment,
                          labels: mergeWithOtherLabels(
                            assignment.labels || [],
                            changed,
                            Avo.Assignment.LabelType.LABEL,
                          ),
                        })
                      }}
                    />
                  </FormGroup>

                  <FormGroup
                    label={tText('assignment/assignment___beschikbaar-vanaf')}
                    labelFor={getId(AssignmentDetailsFormIds.available_at)}
                    required
                  >
                    <DatePicker
                      value={availableAt}
                      showTimeInput
                      minDate={new Date()}
                      maxDate={endOfAcademicYear()}
                      onChange={(value: Date | null) => {
                        setAssignment({
                          ...assignment,
                          available_at: value ? value.toISOString() : null,
                        })
                      }}
                    />
                  </FormGroup>

                  <FormGroup
                    label={tText('assignment/assignment___deadline')}
                    labelFor={getId(AssignmentDetailsFormIds.deadline_at)}
                    required
                  >
                    <DatePicker
                      value={deadline}
                      showTimeInput
                      minDate={new Date()}
                      maxDate={endOfAcademicYear()}
                      onChange={(value) => {
                        setAssignment({
                          ...assignment,
                          deadline_at: value ? value.toISOString() : null,
                        })
                      }}
                      defaultTime="23:59"
                    />
                    <p className="c-form-help-text">
                      {tHtml(
                        'assignment/assignment___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen',
                      )}
                    </p>
                    {deadline && isPast(deadline) && (
                      <p className="c-form-help-text--error">
                        {tHtml(
                          'assignment/components/assignment-details-form-editable___de-deadline-mag-niet-in-het-verleden-liggen',
                        )}
                      </p>
                    )}
                    {isDeadlineBeforeAvailableAt(availableAt, deadline) && (
                      <p className="c-form-help-text--error">
                        {tHtml(
                          'assignment/components/assignment-details-form-editable___de-beschikbaar-vanaf-datum-moet-voor-de-deadline-liggen-anders-zullen-je-leerlingen-geen-toegang-hebben-tot-deze-opdracht',
                        )}
                      </p>
                    )}
                    {deadline && isAfter(deadline, endOfAcademicYear()) && (
                      <p className="c-form-help-text--error">
                        {tHtml(
                          'assignment/components/assignment-details-form-editable___de-deadline-moet-voor-31-augustus-liggen',
                        )}
                      </p>
                    )}
                  </FormGroup>

                  <FormGroup
                    label={`${tHtml('assignment/assignment___link')} (${tHtml(
                      'assignment/assignment___optioneel',
                    )})`}
                    labelFor={getId(AssignmentDetailsFormIds.answer_url)}
                  >
                    <TextInput
                      id={getId(AssignmentDetailsFormIds.answer_url)}
                      onChange={(answerUrl) => {
                        setAssignment({
                          ...assignment,
                          answer_url: answerUrl,
                        } as AssignmentFields)
                      }}
                      value={assignment.answer_url || undefined}
                      onFocus={onFocus}
                    />
                    <p className="c-form-help-text">
                      {tText(
                        'assignment/assignment___wil-je-je-leerling-een-taak-laten-maken-voeg-dan-hier-een-hyperlink-toe-naar-een-eigen-antwoordformulier-of-invuloefening',
                      )}
                    </p>
                  </FormGroup>
                </Column>

                <Column size="3-5">
                  <Alert className="u-spacer-bottom">
                    {tHtml(
                      'assignment/components/assignment-details-form-editable___hier-stel-je-als-leerkracht-de-onderverdeling-van-je-opdracht-in-en-gegevens-die-leerlingen-te-zien-krijgen-bij-de-opdracht',
                    )}
                  </Alert>
                </Column>
              </Grid>
            </Spacer>
          </Form>
        </Container>
      </Container>
    </div>
  )
}
