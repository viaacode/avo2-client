import { useEffect, useState } from 'react'

import { CustomError } from '../helpers/custom-error.js'
import { tHtml } from '../helpers/translate-html.js'
import { OrganisationService } from '../services/organizations-service.js'
import { ToastService } from '../services/toast-service.js'

export type BasicOrganisation = {
  or_id: string
  name: string
}

type UseCompaniesTuple = [BasicOrganisation[], boolean]

export const useCompanies = (onlyWithItems: boolean): UseCompaniesTuple => {
  const [companies, setCompanies] = useState<BasicOrganisation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)

    OrganisationService.fetchOrganisations(onlyWithItems)
      .then((orgs) => {
        if (orgs) {
          setCompanies(
            orgs.filter((org) => org.name && org.or_id) as BasicOrganisation[],
          )
        }
      })
      .catch((err) => {
        console.error(
          new CustomError('Failed to get organisations from database', err),
        )
        ToastService.danger(
          tHtml(
            'settings/components/profile___het-ophalen-van-de-organisaties-is-mislukt',
          ),
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [onlyWithItems])

  return [companies, isLoading]
}

export const useCompaniesWithUsers = (): UseCompaniesTuple => {
  const [companies, setCompanies] = useState<BasicOrganisation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)

    OrganisationService.fetchOrganisationsWithUsers()
      .then((orgs) => {
        if (orgs) {
          setCompanies(
            orgs.filter((org) => org.name && org.or_id) as BasicOrganisation[],
          )
        }
      })
      .catch((err) => {
        console.error(
          new CustomError('Failed to get organisations from database', err),
        )
        ToastService.danger(
          tHtml(
            'settings/components/profile___het-ophalen-van-de-organisaties-is-mislukt',
          ),
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return [companies, isLoading]
}
