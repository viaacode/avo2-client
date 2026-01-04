import { ContentPageInfo } from '@meemoo/admin-core-ui/admin';
import { ContentPageRenderer } from '@meemoo/admin-core-ui/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { type FC } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { useGetContentPageByPath } from '../../admin/content-page/hooks/use-get-content-page-by-path';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionGuard } from '../../authentication/components/PermissionGuard';
import { APP_PATH } from '../../constants';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { QUERY_KEYS } from '../../shared/constants/query-keys.ts';
import { ROUTE_PARTS } from '../../shared/constants/routes';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error';
import { tText } from '../../shared/helpers/translate-text';

export const LoggedInHome: FC = () => {
  const navigateFunc = useNavigate();
  const commonUser = useAtomValue(commonUserAtom);
  const contentPageInfoFromRoute = useLoaderData<{
    contentPage: ContentPageInfo | null;
    url: string;
  }>();

  const queryClient = useQueryClient();
  queryClient.setQueryData(
    [QUERY_KEYS.GET_CONTENT_PAGE_BY_PATH],
    contentPageInfoFromRoute?.contentPage,
  );

  const { data: contentPageInfo } = useGetContentPageByPath(
    `/${ROUTE_PARTS.loggedInHome}`,
    {
      initialData: contentPageInfoFromRoute?.contentPage,
    },
  );
  const isPupil = [
    SpecialUserGroupId.PupilSecondary,
    SpecialUserGroupId.PupilElementary,
  ]
    .map(String)
    .includes(String(commonUser?.userGroup?.id));

  // /start when user is a pupil => should be redirected to /werkruimte/opdrachten
  if (isPupil) {
    navigateFunc(APP_PATH.WORKSPACE_ASSIGNMENTS.route);
    return null;
  }
  return (
    <>
      <PermissionGuard hasToBeLoggedIn={true}>
        <SeoMetadata
          title={tText('home/views/home___ingelogde-start-pagina-titel')}
          description={tText(
            'home/views/home___ingelogde-start-pagina-beschrijving',
          )}
          image={contentPageInfoFromRoute?.contentPage?.seo_image_path}
          url={contentPageInfoFromRoute?.url}
          organisationName="meemoo"
          updatedAt={contentPageInfoFromRoute?.contentPage?.updatedAt}
          createdAt={contentPageInfoFromRoute?.contentPage?.createdAt}
          publishedAt={contentPageInfoFromRoute?.contentPage?.publishedAt}
        />
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
  );
};

export default LoggedInHome;
