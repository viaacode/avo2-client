import { type AdminConfig } from '@meemoo/admin-core-ui/admin';
import { AdminConfigManager } from '@meemoo/admin-core-ui/client';
import { noop } from 'es-toolkit';
import { LoaderFunctionArgs } from 'react-router';
import { getContentPageByPath } from './admin/content-page/hooks/use-get-content-page-by-path.ts';
import { getAdminCoreConfig } from './admin/shared/helpers/get-admin-core-config.tsx';
import { CollectionService } from './collection/collection.service.ts';
import { CollectionOrBundle } from './collection/collection.types.ts';
import { checkLoginState } from './embed/hooks/useGetLoginStateForEmbed.ts';
import { loadTranslations } from './shared/translations/i18n.ts';

export async function initAppLoader() {
  try {
    // Set admin-core config with dummy navigate function during SSR
    // The config will be set again in the client after hydration
    const config: AdminConfig = getAdminCoreConfig(noop);
    AdminConfigManager.setConfig(config);

    await Promise.all([
      // Fetch login state
      checkLoginState(),
      // Wait for translations to load
      await loadTranslations(),
    ]);
  } catch (err) {
    console.error(
      'Failed to load admin-core-config or translations in react-router loader for App route',
      err,
    );
  }
}

export async function loadLoggedOutHomeContentPage() {
  try {
    // Load content page for logged out homepage
    return await getContentPageByPath('/');
  } catch (err) {
    console.error(
      'Failed to load content page in react-router loader for route LoggedOutHome',
      err,
      { path: '/' },
    );
  }
}

export async function fetchCollectionLoader(args: LoaderFunctionArgs<any>) {
  const id = args?.params?.id;
  try {
    if (id) {
      const collection =
        await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
          id,
          CollectionOrBundle.COLLECTION,
          undefined,
        );
      console.log('Collection info', id, JSON.stringify(collection));
      return {
        collection,
      };
    } else {
      throw new Error('No collection UUID provided in route params');
    }
  } catch (err) {
    console.error(
      'Failed to load collection in react-router loader for route Collection',
      err,
      { id },
    );
  }
}
