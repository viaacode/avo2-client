import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
  Alert,
  Button,
  Container,
  FormGroup,
  Spacer,
} from '@viaa/avo2-components';
import { type FC, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { APP_PATH } from '../../../constants';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { StamboekInput } from '../../components/StamboekInput';
import { redirectToServerArchiefRegistrationIdp } from '../../helpers/redirects/redirects';

export type StamboekValidationStatus =
  | 'INCOMPLETE'
  | 'INVALID_FORMAT'
  | 'INVALID_NUMBER'
  | 'VALID_FORMAT'
  | 'VALID'
  | 'ALREADY_IN_USE'
  | 'SERVER_ERROR';

export const STAMBOEK_LOCAL_STORAGE_KEY = 'AVO.stamboek';

export const RegisterStamboek: FC = () => {
  const location = useLocation();

  const [validStamboekNumber, setValidStamboekNumber] = useState<string>('');

  const handleCreateAccountButtonClicked = () => {
    redirectToServerArchiefRegistrationIdp(location, validStamboekNumber);
  };

  return (
    <Container className="c-register-stamboek-view" mode="vertical">
      <Container mode="horizontal" size="medium">
        <SeoMetadata
          title={tText(
            'authentication/views/registration-flow/r-3-stamboek___stamboek-pagina-titel',
          )}
          description={tText(
            'authentication/views/registration-flow/r-3-stamboek___stamboek-pagina-beschrijving',
          )}
        />
        <div className="c-content">
          <BlockHeading type="h2">
            {tHtml(
              'authentication/views/registration-flow/r-3-stamboek___geef-hieronder-je-lerarenkaart-of-stamboeknummer-in',
            )}
          </BlockHeading>
          <p>
            {tHtml(
              'authentication/views/registration-flow/r-3-stamboek___zo-gaan-wij-na-of-jij-een-actieve-lesgever-bent-aan-een-vlaamse-erkende-onderwijsinstelling',
            )}
          </p>
          <Spacer margin="top-small">
            <Alert type="info">
              <a
                href="/faq-lesgever/waarom-lerarenkaart-of-stamboeknummer"
                target="_blank"
              >
                {tHtml(
                  'authentication/views/registration-flow/r-3-stamboek___waarom-hebben-jullie-mijn-stamboeknummer-nodig',
                )}
              </a>
            </Alert>
          </Spacer>
        </div>
        <Spacer margin={['top-large', 'bottom']}>
          <FormGroup
            label={tText(
              'authentication/views/registration-flow/r-3-stamboek___lerarenkaart-of-stamboeknummer',
            )}
            labelFor="stamboekInput"
            required
          >
            <StamboekInput onChange={setValidStamboekNumber} />
          </FormGroup>
        </Spacer>
        <FormGroup>
          <Button
            label={tText(
              'authentication/views/registration-flow/r-3-stamboek___account-aanmaken',
            )}
            type="primary"
            disabled={!validStamboekNumber}
            onClick={handleCreateAccountButtonClicked}
          />
        </FormGroup>

        <Spacer margin="top-large">
          {/* TODO add links to help article */}
          <Alert type="info">
            <Link to={APP_PATH.MANUAL_ACCESS_REQUEST.route}>
              {tHtml(
                'authentication/views/registration-flow/r-3-stamboek___ik-ben-lesgever-en-heb-nog-geen-lerarenkaart-of-stamboeknummer',
              )}
            </Link>
          </Alert>
        </Spacer>
      </Container>
    </Container>
  );
};

export default RegisterStamboek;
