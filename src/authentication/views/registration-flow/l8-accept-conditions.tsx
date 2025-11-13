import {
  type ContentPageInfo,
  ContentPageRenderer,
  ContentPageService,
  convertDbContentPagesToContentPageInfos,
} from '@meemoo/admin-core-ui/client'
import {
  Button,
  Spacer,
  Spinner,
  Toolbar,
  ToolbarCenter,
} from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { useAtomValue, useSetAtom } from 'jotai'
import { compact } from 'es-toolkit'
import React, { type FC, useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router'
import { useLocation } from 'react-router-dom'

import { SpecialUserGroupId } from '../../../admin/user-groups/user-group.const';
import { GENERATE_SITE_TITLE } from '../../../constants';
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../../../shared/helpers/custom-error';
import { renderWrongUserRoleError } from '../../../shared/helpers/render-wrong-user-role-error';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { NotificationService } from '../../../shared/services/notification-service';
import { ToastService } from '../../../shared/services/toast-service';
import { Locale } from '../../../shared/translations/translations.types';
import {
  acceptConditionsAtom,
  commonUserAtom,
  loginAtom,
} from '../../authentication.store';
import { redirectToClientPage } from '../../helpers/redirects/redirect-to-client-page';

import { AcceptElementaryPupilConditions } from './accept-elementary-pupil-conditions';

const ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS =
  'ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS'

export const AcceptConditions: FC = () => {
  const navigateFunc = useNavigate()
  const location = useLocation()

  // The term of use and the privacy conditions
  const [pages, setPages] = useState<(ContentPageInfo | null)[]>([])
  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  })
  const [acceptInProgress, setAcceptInProgress] = useState<boolean>(false)
  const loginState = useAtomValue(loginAtom)
  const loggedInLoginState = loginState.data as Avo.Auth.LoginResponseLoggedIn
  const commonUser = useAtomValue(commonUserAtom)
  const acceptConditions = useSetAtom(acceptConditionsAtom)
  const isElementaryPupil =
    commonUser?.userGroup?.id === SpecialUserGroupId.PupilElementary
  const dataObject = isElementaryPupil ? {} : pages[0]

  const fetchContentPage = useCallback(async () => {
    if (isElementaryPupil) {
      setLoadingInfo({ state: 'loaded' })
      return
    }

    try {
      const dbContentPages = compact(
        await Promise.all([
          ContentPageService.getContentPageByLanguageAndPath(
            Locale.Nl as any,
            '/gebruikersvoorwaarden',
          ),
          ContentPageService.getContentPageByLanguageAndPath(
            Locale.Nl as any,
            '/privacy-voorwaarden',
          ),
        ]),
      )
      setPages(convertDbContentPagesToContentPageInfos(dbContentPages) || [])
    } catch (err) {
      setLoadingInfo({
        state: 'error',
        message: tHtml(
          'authentication/views/registration-flow/l-8-accept-conditions___het-ophalen-van-de-gebruikers-en-privacy-voorwaarden-is-mislukt',
        ),
      })
    }
  }, [isElementaryPupil])

  useEffect(() => {
    fetchContentPage()
  }, [fetchContentPage])

  useEffect(() => {
    if (pages && pages.length === 2) {
      if (pages[0] && pages[1]) {
        setLoadingInfo({ state: 'loaded' })
      } else {
        setLoadingInfo({
          state: 'error',
          message: tHtml(
            'authentication/views/registration-flow/l-8-accept-conditions___het-ophalen-van-de-gebruikers-en-privacy-voorwaarden-is-mislukt',
          ),
        })
      }
    }
  }, [pages])

  useEffect(() => {
    if (loggedInLoginState?.acceptedConditions) {
      const fromRoute = (location?.state as any)?.from?.pathname
      if (!fromRoute) {
        throw new CustomError(
          'Failed to navigate to previously requested route because location.state.from is not set',
          null,
          { location },
        )
      }
      redirectToClientPage(fromRoute, navigateFunc)
    }
  }, [
    loginState,
    location,
    navigateFunc,
    loggedInLoginState?.acceptedConditions,
  ])

  const handleAcceptConditions = async () => {
    try {
      setAcceptInProgress(true)
      await NotificationService.setNotification(
        ACCEPTED_TERMS_OF_USE_AND_PRIVACY_CONDITIONS,
        commonUser?.profileId || '',
        true,
        true,
      )

      acceptConditions()
    } catch (err) {
      console.error(
        new CustomError(
          'Failed to set accept conditions notification in the database',
          err,
          { commonUser },
        ),
      )
      ToastService.danger(
        tHtml(
          'authentication/views/registration-flow/l-8-accept-conditions___het-opslaan-van-de-accepteer-condities-is-mislukt',
        ),
      )
      setAcceptInProgress(false) // Disable on on error, if success => we redirect to other route
    }
  }

  const renderAcceptConditionsPage = () => {
    return (
      <>
        <Spacer margin="bottom-large">
          {/* terms of use */}
          {!!pages[0] && (
            <ContentPageRenderer
              contentPageInfo={pages[0] as ContentPageInfo}
              commonUser={commonUser}
              renderNoAccessError={renderWrongUserRoleError}
            />
          )}
          {/* privacy conditions */}
          {!!pages[1] && (
            <ContentPageRenderer
              contentPageInfo={pages[1] as ContentPageInfo}
              commonUser={commonUser}
              renderNoAccessError={renderWrongUserRoleError}
            />
          )}
        </Spacer>
        <Spacer margin="large">
          <Toolbar>
            <ToolbarCenter>
              {acceptInProgress ? (
                <Spinner size={'large'} />
              ) : (
                <Button
                  label={tText(
                    'authentication/views/registration-flow/l-8-accept-conditions___accepteer-voorwaarden',
                  )}
                  title={tText(
                    'authentication/views/registration-flow/l-8-accept-conditions___accepteer-de-gebruiks-en-privacy-voorwaarden',
                  )}
                  type="primary"
                  onClick={handleAcceptConditions}
                />
              )}
            </ToolbarCenter>
          </Toolbar>
        </Spacer>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>
          {GENERATE_SITE_TITLE(
            tText(
              'authentication/views/registration-flow/l-8-accept-conditions___voorwaarden-pagina-titel',
            ),
          )}
        </title>
        <meta
          name="description"
          content={tText(
            'authentication/views/registration-flow/l-8-accept-conditions___voorwaarden-pagina-beschrijving',
          )}
        />
      </Helmet>
      <LoadingErrorLoadedComponent
        loadingInfo={loadingInfo}
        dataObject={dataObject}
        render={
          isElementaryPupil
            ? () => <AcceptElementaryPupilConditions />
            : renderAcceptConditionsPage
        }
      />
    </>
  )
}

export default AcceptConditions
