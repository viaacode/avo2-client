import { ContentPageInfo } from '@meemoo/admin-core-ui/admin';
import { ContentPageRenderer } from '@meemoo/admin-core-ui/client';
import { useQueryClient } from '@tanstack/react-query';
import { IconName } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import { type FC, useEffect } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useGetContentPageByPath } from '../../admin/content-page/hooks/use-get-content-page-by-path';
import { commonUserAtom, loginAtom, } from '../../authentication/authentication.store';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { QUERY_KEYS } from '../../shared/constants/query-keys.ts';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error';
import { tText } from '../../shared/helpers/translate-text';

export const LoggedOutHome: FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigateFunc = useNavigate();
  const loginState = useAtomValue(loginAtom);
  const commonUser = useAtomValue(commonUserAtom);
  const contentPageInfoFromRoute = useLoaderData<{
    contentPage: ContentPageInfo | null;
    url: string;
  }>();

  const queryClient = useQueryClient();
  queryClient.setQueryData(
    [QUERY_KEYS.GET_CONTENT_PAGE_BY_PATH],
    contentPageInfoFromRoute.contentPage,
  );

  const {
    data: contentPageInfo,
    error: contentPageError,
    isLoading: contentPageLoading,
  } = useGetContentPageByPath('/', {
    initialData: contentPageInfoFromRoute.contentPage,
  });

  useEffect(() => {
    if (location.pathname === '/' && !!commonUser) {
      // Redirect the logged out homepage to the logged in homepage is the user is logged in
      navigateFunc('/start', { replace: true });
      return;
    }
  }, [commonUser, location.pathname, navigateFunc]);

  if (loginState.loading || contentPageLoading) {
    return <FullPageSpinner locationId="logged-out-home--loading" />;
  }
  if (contentPageError) {
    console.error(
      'Error loading content page for logged out home:',
      contentPageError,
    );
    return (
      <ErrorView
        locationId="logged-out-home--error"
        message={tText(
          'home/views/logged-out-home___het-laden-van-deze-pagina-is-mislukt-pagina-kon-niet-worden-opgehaald-van-de-server',
        )}
        actionButtons={['home', 'helpdesk']}
        icon={IconName.alertTriangle}
      />
    );
  }

  return (
    <>
      <SeoMetadata
        title={GENERATE_SITE_TITLE(
          tText('home/views/logged-out-home___uitgelogde-start-pagina-titel'),
        )}
        description={tText(
          'home/views/logged-out-home___uitgelogde-start-pagina-beschrijving',
        )}
        image={contentPageInfoFromRoute.contentPage?.seo_image_path}
        url={contentPageInfoFromRoute.url}
        organisationName="meemoo"
        updatedAt={contentPageInfoFromRoute.contentPage?.updatedAt}
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
            userGroupId={searchParams.get('userGroupId')}
          />
        </>
      )}
    </>
  );
};

export default LoggedOutHome;
