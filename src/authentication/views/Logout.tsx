import { useAtomValue } from 'jotai'
import { type FC, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { APP_PATH } from '../../constants.js'
import { ROUTE_PARTS } from '../../shared/constants/index.js'
import { isPupil } from '../../shared/helpers/is-pupil.js'
import { commonUserAtom } from '../authentication.store.js'
import { redirectToServerLogoutPage } from '../helpers/redirects.js'

export const Logout: FC = () => {
  const location = useLocation()

  const commonUser = useAtomValue(commonUserAtom)

  useEffect(() => {
    redirectToServerLogoutPage(
      location,
      isPupil(commonUser?.userGroup?.id)
        ? '/' + ROUTE_PARTS.pupils
        : APP_PATH.HOME.route,
    )
  }, [])

  return null
}

export default Logout
