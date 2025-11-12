import { BlockHeading } from '@meemoo/admin-core-ui/client'
import {
  Alert,
  Button,
  Column,
  Container,
  Form,
  FormGroup,
  Grid,
  IconName,
  Spacer,
} from '@viaa/avo2-components'
import { useAtomValue } from 'jotai'
import React, { type FC } from 'react'
import { Helmet } from 'react-helmet'

import { commonUserAtom } from '../../authentication/authentication.store.js'
import { redirectToExternalPage } from '../../authentication/helpers/redirects/redirect-to-external-page.js'
import { GENERATE_SITE_TITLE } from '../../constants.js'
import { ErrorView } from '../../error/views/ErrorView.js'
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { Users_Idps_Enum } from '../../shared/generated/graphql-db-types.js'
import { getEnv } from '../../shared/helpers/env.js'
import { formatDate } from '../../shared/helpers/formatters/date.js'
import { isPupil } from '../../shared/helpers/is-pupil.js'
import { tHtml } from '../../shared/helpers/translate-html.js'
import { tText } from '../../shared/helpers/translate-text.js'

// const ssumAccountEditPage = getEnv('SSUM_ACCOUNT_EDIT_URL') as string;
const ssumPasswordEditPage = getEnv('SSUM_PASSWORD_EDIT_URL') as string

export const Account: FC = () => {
  const commonUser = useAtomValue(commonUserAtom)

  const hasTempAccess = commonUser?.tempAccess?.has_currently_access?.status

  if (!commonUser) {
    return <FullPageSpinner />
  }

  if (
    isPupil(commonUser.userGroup?.id) &&
    !commonUser.idps?.[Users_Idps_Enum.Hetarchief]
  ) {
    return (
      <ErrorView
        message={tHtml(
          'settings/components/account___je-hebt-geen-toegang-tot-de-account-pagina',
        )}
        icon={IconName.lock}
      />
    )
  }
  return (
    <>
      <Helmet>
        <title>
          {GENERATE_SITE_TITLE(
            tText(
              'settings/components/account___account-instellingen-pagina-titel',
            ),
          )}
        </title>
        <meta
          name="description"
          content={tText(
            'settings/components/account___account-pagina-beschrijving',
          )}
        />
      </Helmet>
      <Container mode="vertical">
        <Spacer margin="bottom">
          <Grid>
            <Column size="3-7">
              <Form type="standard">
                <Form type="standard">
                  <BlockHeading type="h3">
                    {tText('settings/components/account___account')}
                  </BlockHeading>
                  <FormGroup
                    label={tText('settings/components/account___email')}
                  >
                    <span>{commonUser?.email || '-'}</span>
                  </FormGroup>
                  {/* TODO re-enable when summ allows you to change your email address */}
                  {/*<Spacer margin="bottom">*/}
                  {/*	<Button*/}
                  {/*		type="secondary"*/}
                  {/*		onClick={() =>*/}
                  {/*			redirectToExternalPage(ssumAccountEditPage, null)*/}
                  {/*		}*/}
                  {/*		label={tText(*/}
                  {/*			'settings/components/account___wijzig-accountgegevens'*/}
                  {/*		)}*/}
                  {/*	/>*/}
                  {/*</Spacer>*/}
                  <BlockHeading type="h3">
                    {tText('settings/components/account___wachtwoord')}
                  </BlockHeading>
                  {!!commonUser?.email && (
                    <Spacer margin="top">
                      <Button
                        type="secondary"
                        onClick={() =>
                          redirectToExternalPage(
                            `${ssumPasswordEditPage}&email=${commonUser?.email}`,
                            null,
                          )
                        }
                        label={tText(
                          'settings/components/account___wijzig-wachtwoord',
                        )}
                      />
                    </Spacer>
                  )}
                  {!isPupil && (
                    <Spacer margin="top-large">
                      <Alert type="info">
                        <span className="c-content">
                          {tHtml(
                            'settings/components/account___beheerd-in-een-centraal-identiteitsmanagementsysteem',
                          )}
                        </span>
                      </Alert>
                    </Spacer>
                  )}
                  {hasTempAccess && (
                    <Spacer margin="top-large">
                      <BlockHeading type="h3">
                        {tText(
                          'settings/components/account___tijdelijke-toegang',
                        )}
                      </BlockHeading>
                      <span>
                        {`${tText(
                          'settings/components/account___dit-is-een-tijdelijk-account-de-toegang-van-je-account-verloopt-op',
                        )} ${formatDate(commonUser?.tempAccess?.until)}`}
                        .
                      </span>
                    </Spacer>
                  )}
                </Form>
              </Form>
            </Column>
            <Column size="3-5">
              <></>
            </Column>
          </Grid>
        </Spacer>
      </Container>
    </>
  )
}
