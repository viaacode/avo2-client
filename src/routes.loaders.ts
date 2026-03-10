import { type AdminConfig } from '@meemoo/admin-core-ui/admin';
import { AdminConfigManager } from '@meemoo/admin-core-ui/client';
import { noop } from 'es-toolkit';
import { LoaderFunctionArgs } from 'react-router';
import { ContentPageService } from './admin/content-page/services/content-page.service.ts';
import { ItemsService } from './admin/items/items.service.ts';
import { getAdminCoreConfig } from './admin/shared/helpers/get-admin-core-config.tsx';
import { AssignmentService } from './assignment/assignment.service.ts';
import { getLoginResponse } from './authentication/authentication.store.actions.tsx';
import { loginAtom } from './authentication/authentication.store.ts';
import { CollectionService } from './collection/collection.service.ts';
import { CollectionOrBundle } from './collection/collection.types.ts';
import { ROUTE_PARTS } from './shared/constants/routes.ts';
import { store } from './shared/store/ui.store.ts';
import { loadTranslations } from './shared/translations/i18n.ts';

export async function initAppLoader() {
  try {
    // Set admin-core config with dummy navigate function initially
    // App.tsx will update it synchronously with the real navigateFunc during render
    if (!AdminConfigManager.isConfigSet()) {
      const config: AdminConfig = getAdminCoreConfig(noop, null);
      AdminConfigManager.setConfig(config);
    }

    const [loginResponse] = await Promise.all([
      // Fetch login state
      getLoginResponse(false, []),
      // Wait for translations to load
      loadTranslations(),
    ]);
    store.set(loginAtom, {
      loading: false,
      error: false,
      data: loginResponse,
    });
  } catch (err) {
    console.error(
      'Failed to load admin-core-config or translations in react-router loader for App route',
      err,
    );
  }
  // Must return something for React Router to include in hydrationData
  return null;
}

export async function fetchContentPageLoader(args: LoaderFunctionArgs<any>) {
  try {
    // Load content page for the requested path
    const path = new URL(args.request.url).pathname;
    const cookieHeader = args.request.headers.get('cookie');
    const contentPage =
      await ContentPageService.getContentPageByLanguageAndPath(
        path,
        cookieHeader ? { cookie: cookieHeader } : undefined,
      );
    return {
      contentPage,
      url: args.request.url,
    };
  } catch (err: any) {
    console.error('Error fetching content page for url:', args.request.url);
    const statusCode = err?.innerException?.additionalInfo?.statusCode;
    if (statusCode === 404) {
      console.error('Content page not found (404) for url:', args.request.url);
      // Don't log 404s as errors, as they are expected for non-existing content pages
      return {
        contentPage: null,
        url: args.request.url,
      };
    }
    if (statusCode === 401 || statusCode === 403) {
      // Don't log 403s as errors, as they can be expected for protected content pages when the user is not logged in or doesn't have access
      // During SSR, cookies are on the proxy domain (different from client domain), so we can't authenticate
      // Return null and let the client-side handle authentication after hydration
      // This prevents logging out a user who just logged in
      // cookies exist on proxy but are not sent to the client domain
      console.info(
        'Content page not accessible during SSR (401/403). Retry client-side after hydration',
        args.request.url,
      );
      return {
        contentPage: null,
        url: args.request.url,
        requiresAuth: true, // Content page requires authentication
      };
    }
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
      return {
        item,
        url: args.request.url,
      };
    }
  } catch (err: any) {
    if (err?.innerException?.additionalInfo?.statusCode !== 404) {
      console.error(
        'Failed to load item in react-router loader for route item detail',
        err,
        { id },
      );
    }
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
  } catch (err: any) {
    if (err?.innerException?.additionalInfo?.statusCode !== 404) {
      // Log errors except 404s
      console.error(
        'Failed to load collection in react-router loader for route Collection or Bundle detail',
        err,
        { id },
      );
    }

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
        true,
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
  } catch (err: any) {
    if (err?.innerException?.additionalInfo?.statusCode !== 404) {
      console.error(
        'Failed to load assignment in react-router loader for route Assignment detail',
        err,
        { id, url },
      );
    }
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
