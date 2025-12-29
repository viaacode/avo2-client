import { Button, IconName, Spacer, Tabs } from '@viaa/avo2-components'
import { noop } from 'es-toolkit'
import { type FC, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'

import { APP_PATH } from '../../constants';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { useTabs } from '../../shared/hooks/useTabs';
import { setLoginCounter } from '../helpers/login-counter-before-nudging';
import {
  getPreferredLoginOption,
  LoginOptionsTabs,
  removePreferredLoginOption,
  setPreferredLoginOption,
} from '../helpers/login-options-preferred-tab';
import { redirectToClientPage } from '../helpers/redirects/redirects';

import { LoginOptionsForPupil } from './LoginOptionsForPupil';
import { LoginOptionsForTeacher } from './LoginOptionsForTeacher';
import './LoginOptions.scss'

interface LoginOptionsProps {
  onOptionClicked?: () => void
}

export const LoginOptions: FC<LoginOptionsProps> = ({
  onOptionClicked = noop,
}) => {
  const navigateFunc = useNavigate()

  const [tab, setActiveTab, tabs] = useTabs(
    [
      {
        label: tText('authentication/components/login-options___lesgever'),
        id: LoginOptionsTabs.TEACHER,
        icon: IconName.userTeacher,
      },
      {
        label: tText('authentication/components/login-options___leerling'),
        id: LoginOptionsTabs.STUDENT,
        icon: IconName.userStudent,
      },
    ],
    getPreferredLoginOption(),
  )

  // Whenever a user sees the LoginOptions, reset their nudging
  useEffect(() => {
    removePreferredLoginOption()
  }, [])

  const handleOnLoginOptionClick = useCallback(() => {
    // Whenever a user clicks the option clicked, we assume the user has logged in, and thus we increase their login counter
    setLoginCounter()
    onOptionClicked?.()
  }, [onOptionClicked])

  const renderTitle = () => {
    switch (tab) {
      case LoginOptionsTabs.TEACHER:
        return tHtml(
          'authentication/components/login-options___log-in-als-lesgever',
        )

      case LoginOptionsTabs.STUDENT:
        return tHtml(
          'authentication/components/login-options___log-in-als-leerling',
        )

      default:
        break
    }
  }

  const getButtons = () => {
    switch (tab) {
      case LoginOptionsTabs.TEACHER:
        return (
          <LoginOptionsForTeacher
            onOptionClicked={handleOnLoginOptionClick}
            openInNewTab={false}
          />
        )

      case LoginOptionsTabs.STUDENT:
        return (
          <LoginOptionsForPupil
            onOptionClicked={handleOnLoginOptionClick}
            openInNewTab={false}
          />
        )

      default:
        break
    }
  }

  const renderFallbackTitle = () => {
    switch (tab) {
      case LoginOptionsTabs.TEACHER:
        return (
          <h3 className="c-h4 u-m-0">
            {tText(
              'authentication/components/login-options___nog-geen-account',
            )}
          </h3>
        )

      default:
        return null
    }
  }

  const renderFallbackButton = () => {
    switch (tab) {
      case LoginOptionsTabs.TEACHER:
        return (
          <Button
            block
            label={tText(
              'authentication/views/register-or-login___account-aanmaken-als-lesgever',
            )}
            type="primary"
            onClick={() => {
              onOptionClicked()
              redirectToClientPage(APP_PATH.STAMBOEK.route, navigateFunc)
            }}
          />
        )

      case LoginOptionsTabs.STUDENT:
        return (
          <Link
            to="/faq-leerling?label=Toegang%20als%20leerling"
            onClick={onOptionClicked}
          >
            {tText(
              'authentication/views/register-or-login___krijg-toegang-als-leerling',
            )}
          </Link>
        )

      default:
        break
    }
  }

  return (
    <div className="m-login-options">
      <Tabs
        tabs={tabs}
        onClick={(id) => {
          setActiveTab(id)
          setPreferredLoginOption(id)
        }}
      />

      <div className="m-login-options__wrapper">
        <Spacer margin={['bottom-large']}>
          <h2 className="c-h3 u-m-0 m-login-options__title">{renderTitle()}</h2>
        </Spacer>

        {getButtons()}

        <hr />

        {renderFallbackTitle()}

        <Spacer margin={['top-small']}>{renderFallbackButton()}</Spacer>
      </div>
    </div>
  )
}
