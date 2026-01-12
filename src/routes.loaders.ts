import { type AdminConfig } from '@meemoo/admin-core-ui/admin';
import { AdminConfigManager } from '@meemoo/admin-core-ui/client';
import { noop } from 'es-toolkit';
import { LoaderFunctionArgs } from 'react-router';
import { getContentPageByPath } from './admin/content-page/hooks/use-get-content-page-by-path.ts';
import { ItemsService } from './admin/items/items.service.ts';
import { getAdminCoreConfig } from './admin/shared/helpers/get-admin-core-config.tsx';
import { AssignmentService } from './assignment/assignment.service.ts';
import { CollectionService } from './collection/collection.service.ts';
import { CollectionOrBundle } from './collection/collection.types.ts';
import { checkLoginState } from './embed/hooks/useGetLoginStateForEmbed.ts';
import { ROUTE_PARTS } from './shared/constants/routes.ts';
import { loadTranslations } from './shared/translations/i18n.ts';

export async function initAppLoader() {
  try {
    // Set admin-core config with dummy navigate function during SSR
    // The config will be set again in the client after hydration
    if (!AdminConfigManager.isConfigSet()) {
      const config: AdminConfig = getAdminCoreConfig(noop, null);
      AdminConfigManager.setConfig(config);
    }

    await Promise.all([
      // Fetch login state
      checkLoginState(),
      // Wait for translations to load
      loadTranslations(),
    ]);
  } catch (err) {
    console.error(
      'Failed to load admin-core-config or translations in react-router loader for App route',
      err,
    );
  }
}

export async function fetchContentPageLoader(args: LoaderFunctionArgs<any>) {
  try {
    // Load content page for the requested path
    const path = new URL(args.request.url).pathname;
    const cookieHeader = args.request.headers.get('cookie');
    const contentPage = await getContentPageByPath(
      path,
      cookieHeader ? { cookie: cookieHeader } : undefined,
    );
    return {
      contentPage,
      url: args.request.url,
    };
  } catch (err) {
    console.error(
      'Failed to load content page in react-router loader for route',
      err,
      { url: args.request.url },
    );
    return {
      contentPage: null,
      url: args.request.url,
    };
  }
}

export async function fetchItemLoader(args: LoaderFunctionArgs<any>) {
  const id = args?.params?.id;
  try {
    if (id) {
      const cookieHeader = args.request.headers.get('cookie');
      const item = await ItemsService.fetchItemByExternalId(
        id,
        cookieHeader ? { cookie: cookieHeader } : undefined,
      );
      console.log('loader fetched item:', item);
      return {
        item,
        url: args.request.url,
      };
    }
  } catch (err) {
    console.error(
      'Failed to load item in react-router loader for route item detail',
      err,
      { id },
    );
    return {
      item: null,
      url: args.request.url,
    };
  }
}

export async function fetchCollectionLoader(args: LoaderFunctionArgs<any>) {
  const id = args?.params?.id;
  const isCollection = args.request?.url.includes(
    `/${ROUTE_PARTS.collections}/`,
  );

  try {
    if (id) {
      const cookieHeader = args.request.headers.get('cookie');
      const collection =
        await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
          id,
          isCollection
            ? CollectionOrBundle.COLLECTION
            : CollectionOrBundle.BUNDLE,
          undefined,
          cookieHeader ? { cookie: cookieHeader } : undefined,
        );
      return {
        collection,
        url: args.request.url,
      };
    } else {
      throw new Error('No collection UUID provided in route params');
    }
  } catch (err) {
    console.error(
      'Failed to load collection in react-router loader for route Collection or Bundle detail',
      err,
      { id },
    );
    return {
      collection: null,
      url: args.request.url,
    };
  }
}

export async function fetchAssignmentLoader(args: LoaderFunctionArgs<any>) {
  const url = args?.request?.url;
  const id = args?.params?.id;
  try {
    if (id) {
      const cookieHeader = args.request.headers.get('cookie');
      const assignment = await AssignmentService.fetchAssignmentById(
        id,
        undefined,
        cookieHeader ? { cookie: cookieHeader } : undefined,
      );
      return {
        assignment,
        url,
      };
    } else {
      throw new Error('No assignment UUID provided in route params');
    }
  } catch (err) {
    console.error(
      'Failed to load assignment in react-router loader for route Assignment detail',
      err,
      { id, url },
    );
    return {
      assignment: null,
      url,
    };
  }
}

export async function passUrlLoader(args: LoaderFunctionArgs<any>) {
  return {
    url: args.request.url,
  };
}
