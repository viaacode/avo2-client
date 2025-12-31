// eslint-disable-next-line import/no-unresolved

import { Column, Grid, IconName, Spacer, Tabs } from '@viaa/avo2-components';
import { type FC } from 'react';
import AvoLogoSrc from '../../assets/images/avo-logo-centered.svg';

import { LoginOptionsForPupil } from '../../authentication/components/LoginOptionsForPupil';
import { LoginOptionsForTeacher } from '../../authentication/components/LoginOptionsForTeacher';
import { LoginOptionsTabs } from '../../authentication/helpers/login-options-preferred-tab';
import { getEnv } from '../../shared/helpers/env';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { useTabs } from '../../shared/hooks/useTabs';

import './RegisterOrLogin.scss';

export const RegisterOrLogin: FC = () => {
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
    LoginOptionsTabs.STUDENT,
  );

  const renderTitle = () => {
    switch (tab) {
      case LoginOptionsTabs.TEACHER:
        return tHtml(
          'authentication/components/login-options___log-in-als-lesgever',
        );

      case LoginOptionsTabs.STUDENT:
        return tHtml(
          'authentication/components/login-options___log-in-als-leerling',
        );

      default:
        break;
    }
  };

  const getButtons = () => {
    switch (tab) {
      case LoginOptionsTabs.TEACHER:
        return <LoginOptionsForTeacher openInNewTab={true} />;

      case LoginOptionsTabs.STUDENT:
        return <LoginOptionsForPupil openInNewTab={true} />;

      default:
        break;
    }
  };

  return (
    <div className="c-register-login-view">
      <Spacer className="m-register-login__tabs-wrapper" margin={'bottom'}>
        <Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />
      </Spacer>
      <Grid className="u-bg-gray-100 u-spacer-bottom" noWrap>
        <Column size="3-6" className="u-text-center">
          <img
            className="avo-logo"
            alt="Archief voor Onderwijs logo"
            src={AvoLogoSrc}
          />
          {tab === LoginOptionsTabs.TEACHER && (
            <span className="account-creation">
              <Spacer margin={['bottom-small']}>
                <h2 className="c-h3 u-m-0 u-padding-top-l">
                  {tHtml(
                    'embed/components/register-or-login___nog-geen-account',
                  )}
                </h2>
              </Spacer>
              <a
                href={getEnv('REGISTER_URL')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tHtml(
                  'embed/components/register-or-login___account-aanmaken-als-lesgever',
                )}
              </a>
            </span>
          )}
        </Column>
        <Column size="3-6" className="u-bg-white">
          <div className="m-login-options__wrapper">
            <Spacer margin={['bottom-small']}>
              <h2 className="c-h3 u-m-0 m-login-options__title">
                {renderTitle()}
              </h2>
            </Spacer>
            {getButtons()}
          </div>
        </Column>
      </Grid>
    </div>
  );
};
