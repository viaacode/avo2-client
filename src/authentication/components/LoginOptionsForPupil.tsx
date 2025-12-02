import { Button, IconName, Spacer } from '@viaa/avo2-components'
import { noop } from 'es-toolkit'
import { type FC } from 'react'

import {
  redirectToServerLeerIDLogin,
  redirectToServerLoginPage,
  redirectToServerSmartschoolLogin,
} from '../helpers/redirects';

import './LoginOptionsForPupil.scss'
import { useLocation } from 'react-router-dom'

import { tText } from '../../shared/helpers/translate-text';

interface LoginOptionsForPupilProps {
  onOptionClicked?: () => void
  openInNewTab?: boolean
}

export const LoginOptionsForPupil: FC<LoginOptionsForPupilProps> = ({
  onOptionClicked = noop,
  openInNewTab = false,
}) => {
  const location = useLocation()

  const getButtons = () => {
    return [
      <Button
        key="login-button-leerid-pupil"
        block
        type="secondary"
        className="c-button-leerid"
        icon={IconName.leerid}
        iconType="custom"
        label={tText('authentication/components/login-options___leerling-id')}
        title={tText('authentication/components/login-options___leerling-id')}
        onClick={() => {
          onOptionClicked()
          redirectToServerLeerIDLogin(location, openInNewTab)
        }}
      />,

      <Button
        key="login-button-smartschool-pupil"
        block
        className="c-button-smartschool"
        icon={IconName.smartschool}
        label={tText(
          'authentication/components/login-options___inloggen-met-smartschool',
        )}
        title={tText(
          'authentication/components/login-options___inloggen-met-smartschool',
        )}
        onClick={() => {
          onOptionClicked()
          redirectToServerSmartschoolLogin(location, openInNewTab)
        }}
      />,

      <Button
        key="login-button-archief-pupil"
        block
        label={tText(
          'authentication/components/login-options___inloggen-met-e-mailadres',
        )}
        title={tText(
          'authentication/components/login-options___inloggen-met-e-mailadres',
        )}
        type="inline-link"
        className="c-login-with-archief c-button-mail c-login-button--pupil"
        onClick={() => {
          onOptionClicked()
          redirectToServerLoginPage(location, openInNewTab)
        }}
      />,
    ]
  }

  return getButtons()?.map((button) => (
    <Spacer
      key={`button--${button.props.className}`}
      margin={['top-small', 'bottom-small']}
    >
      {button}
    </Spacer>
  ))
}
