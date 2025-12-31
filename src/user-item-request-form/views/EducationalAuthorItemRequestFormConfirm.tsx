import { Button, Container, Spacer } from '@viaa/avo2-components';
import { type FC } from 'react';
import { useNavigate } from 'react-router';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

export const EducationalAuthorItemRequestFormConfirm: FC = () => {
  const navigateFunc = useNavigate();

  return (
    <Container className="c-register-stamboek-view" mode="vertical">
      <Container mode="horizontal" size="large">
        <SeoMetadata
          title={tText(
            'user-item-request-form/views/educational-author-item-request-form-confirm___gebruikersaanvraag-pagina-titel',
          )}
          description={tText(
            'user-item-request-form/views/educational-author-item-request-form-confirm___gebruikersaanvraag-pagina-beschrijving',
          )}
        />
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
  );
};

export default EducationalAuthorItemRequestFormConfirm;
