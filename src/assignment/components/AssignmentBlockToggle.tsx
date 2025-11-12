import {
  Flex,
  FlexItem,
  FormGroup,
  Spacer,
  Toggle,
  type ToggleProps,
} from '@viaa/avo2-components'
import React, { type FC, type ReactNode } from 'react'

import './AssignmentBlockToggle.scss'

type AssignmentBlockToggleProps = ToggleProps & {
  heading?: string
  description?: ReactNode
}

export const AssignmentBlockToggle: FC<AssignmentBlockToggleProps> = (
  props,
) => {
  return (
    <Spacer
      className="c-assignment-block-toggle o-form-group-layout--standard"
      margin="none"
      padding="large"
    >
      <FormGroup label={props.heading} labelFor={props.id}>
        <Flex center justify={undefined}>
          <FlexItem shrink>
            <Toggle {...props} />
          </FlexItem>

          {props.description && (
            <FlexItem className="c-assignment-block-toggle__description">
              <Spacer margin="left">{props.description}</Spacer>
            </FlexItem>
          )}
        </Flex>
      </FormGroup>
    </Spacer>
  )
}
