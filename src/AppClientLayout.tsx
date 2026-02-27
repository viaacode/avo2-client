import { type FC } from 'react';
import { Outlet, useLoaderData, useSearchParams } from 'react-router';
import { ACMIDMNudgeModal } from './shared/components/ACMIDMNudgeModal/ACMIDMNudgeModal';
import { Footer } from './shared/components/Footer/Footer';
import { Navigation } from './shared/components/Navigation/Navigation';
import { ZendeskWrapper } from './shared/components/ZendeskWrapper/ZendeskWrapper';

export const AppClientLayout: FC = () => {
  const loaderData = useLoaderData<{ url: string }>();
  const [query] = useSearchParams();

  return (
    <>
      <Navigation
        isPreviewRoute={query.get('preview') === 'true'}
        url={loaderData.url}
      />
      <Outlet />
      <Footer />
      <ACMIDMNudgeModal />
      <ZendeskWrapper />
    </>
  );
};

export default AppClientLayout;
