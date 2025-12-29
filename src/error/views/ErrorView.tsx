import {
  Blankslate,
  Button,
  ButtonToolbar,
  Container,
  IconName,
  Toolbar,
  ToolbarCenter,
} from '@viaa/avo2-components';

import { compact, isNil, isString, omit, uniq } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import queryString from 'query-string';
import { type FC, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { commonUserAtom } from '../../authentication/authentication.store';
import { redirectToHelp } from '../../authentication/helpers/redirects/redirect-help';
import { redirectToLoggedInHome } from '../../authentication/helpers/redirects/redirect-logged-in-home';
import { redirectToPupils } from '../../authentication/helpers/redirects/redirect-pupils';
import { redirectToLoggedOutHome } from '../../authentication/helpers/redirects/redirect-to-logged-out-home';
import { redirectToServerLogoutPage } from '../../authentication/helpers/redirects/redirects';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { CustomError } from '../../shared/helpers/custom-error';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { tText } from '../../shared/helpers/translate-text';
import { getPageNotFoundError } from '../../shared/translations/page-not-found';

import './ErrorView.scss';
import { AvoAuthErrorActionButton } from '@viaa/avo2-types';

type ErrorActionButton = AvoAuthErrorActionButton | 'help' | 'pupils';

export interface ErrorViewQueryParams {
  message?: string | ReactNode;
  icon?: IconName;
  actionButtons?: ErrorActionButton[];
}

interface ErrorViewProps {
  message?: string | ReactNode;
  icon?: IconName;
  actionButtons?: ErrorActionButton[];
  children?: ReactNode;
  locationId: string;
}

export const ErrorView: FC<ErrorViewProps> = ({
  message,
  icon,
  children = null,
  actionButtons = [],
  locationId,
}) => {
  const location = useLocation();
  const commonUser = useAtomValue(commonUserAtom);

  const queryParams = queryString.parse((location.search || '').substring(1));

  if (queryParams.logout === 'true') {
    // redirect to log-out route and afterward redirect back to the error page
    redirectToServerLogoutPage(
      location,
      `/error?${queryString.stringify(omit(queryParams, ['logout']))}`,
    );
    return <FullPageSpinner locationId={locationId} />;
  }

  const messageText: string | ReactNode =
    (queryParams.message as string) || message || '';
  const errorMessage: string | ReactNode = isNil(messageText)
    ? getPageNotFoundError(!!commonUser)
    : messageText;
  const errorIcon: IconName =
    (queryParams.icon as IconName | undefined) || icon || IconName.search;
  const buttons = uniq([
    ...actionButtons,
    ...(Array.isArray(queryParams.actionButtons)
      ? queryParams.actionButtons
      : []),
    ...(isString(queryParams.actionButtons)
      ? queryParams.actionButtons
          .split(',')
          .map((button) => button.trim())
          .filter((button) => !!button)
      : []),
  ]);

  if (!(queryParams.message || message)) {
    console.error(
      new CustomError('Error view without error message', null, {
        queryParams,
        message,
        icon,
        actionButtons,
      }),
    );
  }

  const goToHome = () => {
    if (commonUser) {
      redirectToLoggedInHome(location);
    } else {
      redirectToLoggedOutHome(location);
    }
  };

  const renderButtons = (btns: string[]) => {
    if (btns.length === 0) {
      return null;
    }
    const buttons = (
      <>
        {btns.includes('home') && (
          <Button
            onClick={goToHome}
            label={tText(
              'error/views/error-view___ga-terug-naar-de-homepagina',
            )}
          />
        )}
        {btns.includes('help') && (
          <Button
            onClick={() => redirectToHelp(location)}
            label={tText('error/views/error-view___ga-naar-de-hulppagina')}
          />
        )}
        {btns.includes('pupils') && (
          <Button
            onClick={() => redirectToPupils(location)}
            label={tText('error/views/error-view___ga-naar-de-startpagina')}
          />
        )}
        {btns.includes('helpdesk') && (
          <Button
            type="danger"
            onClick={() => window.zE('webWidget', 'toggle')}
            label={tText('error/views/error-view___contacteer-de-helpdesk')}
          />
        )}
      </>
    );

    if (isMobileWidth()) {
      return <div className="c-error-buttons__mobile">{buttons}</div>;
    }
    return (
      <Toolbar>
        <ToolbarCenter>
          <ButtonToolbar>{buttons}</ButtonToolbar>
        </ToolbarCenter>
      </Toolbar>
    );
  };

  return (
    <Container mode="vertical" background="alt" className="m-error-view">
      <Container size="medium" mode="horizontal">
        <Blankslate
          body=""
          icon={errorIcon}
          title={errorMessage}
          className="c-content"
          data-location-id={locationId}
        >
          {children}
          {renderButtons(compact(buttons))}
        </Blankslate>
      </Container>
    </Container>
  );
};

export default ErrorView;
