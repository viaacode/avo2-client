import {
  Button,
  Form,
  FormGroup,
  Icon,
  IconName,
  Panel,
  PanelBody,
  PanelHeader,
  Spacer,
  TextInput,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@viaa/avo2-components'
import { isEqual } from 'es-toolkit'
import React, { type FC } from 'react'

import { RICH_TEXT_EDITOR_OPTIONS_FULL } from '../../../shared/components/RichTextEditorWrapper/RichTextEditor.consts';
import { RichTextEditorWrapper } from '../../../shared/components/RichTextEditorWrapper/RichTextEditorWrapper';
import { stripHtml } from '../../../shared/helpers/formatters/strip-html';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { type InteractiveTourAction } from '../helpers/reducers/index';
import {
  type EditableStep,
  InteractiveTourEditActionType,
} from '../interactive-tour.types';

import './InteractiveTourEdit.scss'

interface InteractiveTourEditStepProps {
  step: EditableStep
  index: number
  numberOfSteps: number
  stepErrors: { title?: string; content?: string } | undefined
  changeInteractiveTourState: (action: InteractiveTourAction) => void
}

export const InteractiveTourEditStep: FC<InteractiveTourEditStepProps> = ({
  step,
  index,
  numberOfSteps,
  stepErrors,
  changeInteractiveTourState,
}) => {
  const renderReorderButton = (
    index: number,
    direction: 'up' | 'down',
    disabled: boolean,
  ) => (
    <Button
      type="secondary"
      icon={`chevron-${direction}` as IconName}
      title={
        direction === 'up'
          ? tText(
              'admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-boven',
            )
          : tText(
              'admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-onder',
            )
      }
      ariaLabel={
        direction === 'up'
          ? tText(
              'admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-boven',
            )
          : tText(
              'admin/interactive-tour/views/interactive-tour-edit___verplaats-naar-onder',
            )
      }
      onClick={() => {
        changeInteractiveTourState({
          direction,
          index,
          type: InteractiveTourEditActionType.SWAP_STEPS,
        })
      }}
      disabled={disabled}
    />
  )

  if (!step) {
    return null
  }

  return (
    <Panel>
      <PanelHeader>
        <Toolbar>
          <ToolbarLeft>
            <ToolbarItem>
              <div className="c-button-toolbar">
                {renderReorderButton(index, 'up', index === 0)}
                {renderReorderButton(
                  index,
                  'down',
                  index === numberOfSteps - 1,
                )}
              </div>
            </ToolbarItem>
          </ToolbarLeft>
          <ToolbarRight>
            <ToolbarItem>
              <Button
                icon={IconName.delete}
                type="danger"
                onClick={() => {
                  changeInteractiveTourState({
                    index,
                    type: InteractiveTourEditActionType.REMOVE_STEP,
                  })
                }}
                ariaLabel={tText(
                  'admin/interactive-tour/views/interactive-tour-edit___verwijder-stap',
                )}
                title={tText(
                  'admin/interactive-tour/views/interactive-tour-edit___verwijder-stap',
                )}
              />
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </PanelHeader>
      <PanelBody>
        <Form>
          <FormGroup
            label={tText(
              'admin/interactive-tour/views/interactive-tour-edit___titel',
            )}
            error={stepErrors?.title}
          >
            <TextInput
              value={(step.title || '').toString()}
              onChange={(newTitle) => {
                changeInteractiveTourState({
                  type: InteractiveTourEditActionType.UPDATE_STEP_PROP,
                  stepIndex: index,
                  stepProp: 'title',
                  stepPropValue: newTitle,
                })
              }}
            />
            <Spacer margin="top-small">{step.title.length} / 28</Spacer>
          </FormGroup>
          <FormGroup
            label={tText(
              'admin/interactive-tour/views/interactive-tour-edit___tekst',
            )}
            error={stepErrors?.content}
          >
            <RichTextEditorWrapper
              initialHtml={(step.content || '').toString()}
              state={step.contentState}
              onChange={(newContentState) => {
                if (!isEqual(newContentState, step.contentState)) {
                  changeInteractiveTourState({
                    type: InteractiveTourEditActionType.UPDATE_STEP_PROP,
                    stepIndex: index,
                    stepProp: 'contentState',
                    stepPropValue: newContentState,
                  })
                }
              }}
              controls={RICH_TEXT_EDITOR_OPTIONS_FULL}
              fileType="INTERACTIVE_TOUR_IMAGE"
              id={`content_editor_${index}`}
              placeholder={tText(
                'admin/interactive-tour/views/interactive-tour-edit___vul-een-stap-tekst-in',
              )}
            />
            <Spacer margin="top-small">
              {
                (step.contentState
                  ? stripHtml(step.contentState.toHTML())
                  : step.content || ''
                ).length
              }{' '}
              / 200
            </Spacer>
          </FormGroup>

          <FormGroup
            label={tText(
              'admin/interactive-tour/views/interactive-tour-edit___element-css-selector',
            )}
          >
            <TextInput
              value={(step.target || '').toString()}
              onChange={(newTarget) => {
                changeInteractiveTourState({
                  type: InteractiveTourEditActionType.UPDATE_STEP_PROP,
                  stepIndex: index,
                  stepProp: 'target',
                  stepPropValue: newTarget,
                })
              }}
              className="c-text-input__selector"
            />
            <Tooltip position="top">
              <TooltipTrigger>
                <span>
                  <Icon
                    className="a-info-icon"
                    name={IconName.info}
                    size="small"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <Spacer padding="small">
                  {tHtml(
                    'admin/interactive-tour/views/interactive-tour-edit___hoe-kopieer-je-een-css-selector',
                  )}
                </Spacer>
              </TooltipContent>
            </Tooltip>
          </FormGroup>
        </Form>
      </PanelBody>
    </Panel>
  )
}

export default React.memo(InteractiveTourEditStep)
