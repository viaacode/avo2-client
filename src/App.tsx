import { type Avo, PermissionName } from '@viaa/avo2-types'
import { clsx } from 'clsx'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { isEqual, noop, uniq } from 'es-toolkit'
import React, { type FC, useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useLocation } from 'react-router-dom'
import { Slide, ToastContainer } from 'react-toastify'
import { QueryParamProvider } from 'use-query-params'

import pkg from '../package.json' with { type: 'json' }

import { withAdminCoreConfig } from './admin/shared/hoc/with-admin-core-config.js'
import { SpecialUserGroupId } from './admin/user-groups/user-group.const.js'
import { commonUserAtom } from './authentication/authentication.store.js'
import { getLoginStateAtom } from './authentication/authentication.store.actions.js'
import { PermissionService } from './authentication/helpers/permission-service.js'
import { ConfirmModal } from './shared/components/ConfirmModal/ConfirmModal.js'
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from './shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent.js'
import { ROUTE_PARTS } from './shared/constants/index.js'
import { CustomError } from './shared/helpers/custom-error.js'
import { getEnv } from './shared/helpers/env.js'
import { ReactRouter7Adapter } from './shared/helpers/routing/react-router-v7-adapter-for-use-query-params.js'
import { tHtml } from './shared/helpers/translate-html.js'
import { tText } from './shared/helpers/translate-text.js'
import { useHideZendeskWidget } from './shared/hooks/useHideZendeskWidget.js'
import { usePageLoaded } from './shared/hooks/usePageLoaded.js'
import { ToastService } from './shared/services/toast-service.js'
import { embedFlowAtom, historyLocationsAtom } from './shared/store/ui.store.js'
import { waitForTranslations } from './shared/translations/i18n.js'

import 'react-datepicker/dist/react-datepicker.css' // TODO: lazy-load
import './App.scss'
import './styles/main.scss'

const App: FC = () => {
  const location = useLocation()
  const navigateFunc = useNavigate()
  const getLoginState = useSetAtom(getLoginStateAtom)

  const commonUser = useAtomValue(commonUserAtom)
  const [historyLocations, setHistoryLocations] = useAtom(historyLocationsAtom)
  const setEmbedFlow = useSetAtom(embedFlowAtom)

  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false)

  const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(
    location.pathname,
  )
  const isPupilUser = [
    SpecialUserGroupId.PupilSecondary,
    SpecialUserGroupId.PupilElementary,
  ]
    .map(String)
    .includes(String(commonUser?.userGroup?.id))
  const query = new URLSearchParams(location?.search || '')
  const isPreviewRoute = query.get('preview') === 'true'

  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  })

  const consoleLogClientAndServerVersions = useCallback(async () => {
    console.info(`%c client version: ${pkg.version}`, 'color: #bada55')
    const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/client')
    const proxyUrl = getEnv('PROXY_URL')
    if (!proxyUrl) {
      console.warn('PROXY_URL is not defined, cannot fetch server version')
      return
    }
    const response = await fetchWithLogoutJson<{ version: string }>(proxyUrl)

    console.info(`%c server version: ${response.version}`, 'color: #bada55')
  }, [])

  /**
   * Scroll to the element with the id that is in the hash of the url
   */
  const handlePageLoaded = useCallback(() => {
    if (window.location.hash) {
      const decodedHash = decodeURIComponent(window.location.hash).replaceAll(
        ' ',
        '-',
      )
      document
        .querySelector(decodedHash)
        ?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])
  usePageLoaded(handlePageLoaded, !!location.hash)

  /**
   * Wait for translations to be loaded before rendering the app
   */
  useEffect(() => {
    waitForTranslations
      .then(() => {
        setLoadingInfo({ state: 'loaded' })
      })
      .catch((err: any) => {
        console.error(new CustomError('Failed to wait for translations', err))
      })
  }, [setLoadingInfo])

  /**
   * Load login status as soon as possible
   */
  useEffect(() => {
    getLoginState(false)
  }, [getLoginState])

  /**
   * Write the client and server versions to the console
   */
  useEffect(() => {
    consoleLogClientAndServerVersions()
  }, [consoleLogClientAndServerVersions])

  /**
   * Hide zendesk when a pupil is logged in
   */
  useHideZendeskWidget(commonUser, isPupilUser)

  /**
   * Redirect after linking an account the the hetarchief account (eg: leerid, smartschool, klascement)
   */
  useEffect(() => {
    if (loadingInfo.state === 'loaded') {
      const url = new URL(window.location.href)
      const linked: Avo.Auth.IdpLinkedSuccessQueryParam = 'linked'
      const hasLinked = url.searchParams.get(linked) !== null
      if (hasLinked) {
        ToastService.success(tHtml('app___je-account-is-gekoppeld'))
        url.searchParams.delete(linked)
        navigateFunc(url.toString().replace(url.origin, ''), { replace: true })
      }
    }
  }, [loadingInfo, navigateFunc])

  /**
   * Keep track of route changes and track the 3 last visited pages for tracking events
   * Store them in the redux store
   */
  useEffect(() => {
    const existingHistoryLocations = historyLocations
    const newHistoryLocations = uniq([
      ...existingHistoryLocations,
      location.pathname,
    ]).slice(-3)
    if (!isEqual(existingHistoryLocations, newHistoryLocations)) {
      setHistoryLocations(newHistoryLocations)
    }
    handlePageLoaded()
  }, [location, historyLocations, setHistoryLocations, handlePageLoaded])

  /**
   * Check if this window was opened from somewhere else and get the embed-flow query param
   * Store the embed-flow query param in the redux store
   */
  useEffect(() => {
    const url = new URL(window.location.href)
    const embedFlow = url.searchParams.get('embed-flow') || ''
    const isOpenedByOtherPage = !!window.opener

    if (isOpenedByOtherPage && !!embedFlow && commonUser) {
      if (
        PermissionService.hasPerm(
          commonUser,
          PermissionName.EMBED_ITEMS_ON_OTHER_SITES,
        )
      ) {
        setEmbedFlow(embedFlow)
      } else {
        ToastService.info(
          tHtml('app___je-hebt-geen-toegang-tot-de-embed-functionaliteit'),
        )
      }
    } else if (embedFlow) {
      console.error(
        "Embed flow query param is present, but the page wasn't opened from another page, so window.opener is undefined. Cannot start the embed flow",
      )
    }
  }, [setEmbedFlow, commonUser])

  // Render
  const renderApp = () => {
    return (
      <div
        className={clsx('o-app', {
          'o-app--admin': isAdminRoute,
          'o-app--preview': isPreviewRoute,
        })}
      >
        <ToastContainer
          autoClose={4000}
          className="c-alert-stack"
          closeButton={false}
          closeOnClick={false}
          draggable={false}
          position="bottom-left"
          transition={Slide}
        />
        <Outlet />
      </div>
    )
  }

  return (
    <>
      {/* Use query params*/}
      <QueryParamProvider adapter={ReactRouter7Adapter}>
        <>
          <LoadingErrorLoadedComponent
            loadingInfo={loadingInfo}
            dataObject={{}}
            render={renderApp}
          />
          <ConfirmModal
            className="c-modal__unsaved-changes"
            isOpen={isUnsavedChangesModalOpen}
            confirmCallback={() => {
              setIsUnsavedChangesModalOpen(false)
              ;(confirmUnsavedChangesCallback || noop)(true)
              confirmUnsavedChangesCallback = null
            }}
            onClose={() => {
              setIsUnsavedChangesModalOpen(false)
              ;(confirmUnsavedChangesCallback || noop)(false)
              confirmUnsavedChangesCallback = null
            }}
            cancelLabel={tText('app___blijven')}
            confirmLabel={tText('app___verlaten')}
            title={tHtml('app___wijzigingen-opslaan')}
            body={tHtml(
              'app___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten',
            )}
            confirmButtonType="primary"
          />
        </>
      </QueryParamProvider>
    </>
  )
}

export const AppWithAdminCoreConfig = withAdminCoreConfig(App) as FC

let confirmUnsavedChangesCallback: ((navigateAway: boolean) => void) | null
