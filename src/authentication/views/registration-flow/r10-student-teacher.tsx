import { BlockHeading } from '@meemoo/admin-core-ui/client'
import { Button, Container, IconName, Spacer } from '@viaa/avo2-components'
import React, { type FC } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router'

import { GENERATE_SITE_TITLE } from '../../../constants.js'
import { tHtml } from '../../../shared/helpers/translate-html.js'
import { tText } from '../../../shared/helpers/translate-text.js'

export const StudentTeacher: FC = () => {
  const navigateFunc = useNavigate()

  return (
    <Container className="c-register-stamboek-view" mode="vertical">
      <Container mode="horizontal" size="large">
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              tText(
                'authentication/views/registration-flow/r-10-student-teacher___student-lesgever-pagina-titel',
              ),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'authentication/views/registration-flow/r-10-student-teacher___student-lesgever-pagina-beschrijving',
            )}
          />
        </Helmet>
        <div className="c-content">
          <Spacer margin="bottom-large">
            <Button
              type="secondary"
              onClick={() => navigateFunc(-1)}
              icon={IconName.arrowLeft}
              title={tText(
                'authentication/views/registration-flow/r-10-student-teacher___ga-terug-naar-de-manuele-account-aanvraag-pagina',
              )}
              ariaLabel={tText(
                'authentication/views/registration-flow/r-10-student-teacher___ga-terug-naar-de-manuele-account-aanvraag-pagina',
              )}
            />
          </Spacer>
          <BlockHeading type="h2">
            {tHtml(
              'authentication/views/registration-flow/r-10-student-teacher___het-archief-voor-onderwijs-voor-student-leerkrachten',
            )}
          </BlockHeading>
          {tHtml(
            'authentication/views/registration-flow/r-10-student-teacher___student-teacher-description',
          )}
        </div>
      </Container>
    </Container>
  )
}

export default StudentTeacher
