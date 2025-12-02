import { Button, Container, Spacer } from '@viaa/avo2-components'
import { type FC } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router'

import { GENERATE_SITE_TITLE } from '../../constants';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

export const EducationalAuthorItemRequestFormConfirm: FC = () => {
  const navigateFunc = useNavigate()

  return (
    <Container className="c-register-stamboek-view" mode="vertical">
      <Container mode="horizontal" size="large">
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              tText(
                'user-item-request-form/views/educational-author-item-request-form-confirm___gebruikersaanvraag-pagina-titel',
              ),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'user-item-request-form/views/educational-author-item-request-form-confirm___gebruikersaanvraag-pagina-beschrijving',
            )}
          />
        </Helmet>
        <div className="c-content">
          {tHtml(
            'user-item-request-form/views/educational-author-item-request-form-confirm___bevestiging',
          )}
          <Spacer margin="top-large">
            <Button
              type="primary"
              onClick={() => navigateFunc(-1)}
              label={tText(
                'user-item-request-form/views/educational-author-item-request-form-confirm___doe-nog-een-aanvraag',
              )}
              title={tText(
                'user-item-request-form/views/educational-author-item-request-form-confirm___doe-nog-een-aanvraag',
              )}
              ariaLabel={tText(
                'user-item-request-form/views/educational-author-item-request-form-confirm___de-nog-een-aanvraag',
              )}
            />
          </Spacer>
        </div>
      </Container>
    </Container>
  )
}

export default EducationalAuthorItemRequestFormConfirm
