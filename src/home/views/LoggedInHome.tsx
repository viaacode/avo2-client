import { ContentPageRenderer } from '@meemoo/admin-core-ui/client'
import { useAtomValue } from 'jotai'
import React, { type FC } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router'

import { useGetContentPageByPath } from '../../admin/content-page/hooks/use-get-content-page-by-path';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionGuard } from '../../authentication/components/PermissionGuard';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import { ROUTE_PARTS } from '../../shared/constants/index';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error';
import { tText } from '../../shared/helpers/translate-text';

export const LoggedInHome: FC = () => {
  const navigateFunc = useNavigate()
  const commonUser = useAtomValue(commonUserAtom)

  const { data: contentPageInfo } = useGetContentPageByPath(
    `/${ROUTE_PARTS.loggedInHome}`,
  )
  const isPupil = [
    SpecialUserGroupId.PupilSecondary,
    SpecialUserGroupId.PupilElementary,
  ]
    .map(String)
    .includes(String(commonUser?.userGroup?.id))

  // /start when user is a pupil => should be redirected to /werkruimte/opdrachten
  if (isPupil) {
    navigateFunc(APP_PATH.WORKSPACE_ASSIGNMENTS.route)
    return null
  }
  return (
    <>
      <PermissionGuard hasToBeLoggedIn={true}>
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              tText('home/views/home___ingelogde-start-pagina-titel'),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'home/views/home___ingelogde-start-pagina-beschrijving',
            )}
          />
        </Helmet>
        {contentPageInfo && (
          <>
            <InteractiveTour showButton={false} />
            <ContentPageRenderer
              contentPageInfo={contentPageInfo}
              commonUser={commonUser}
              renderNoAccessError={renderWrongUserRoleError}
            />
          </>
        )}
      </PermissionGuard>
    </>
  )
}

export default LoggedInHome
