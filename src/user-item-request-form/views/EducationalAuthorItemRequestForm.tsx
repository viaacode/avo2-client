import { BlockHeading } from '@meemoo/admin-core-ui/client';
import { TextInput } from '@meemoo/react-components';
import {
  Button,
  Checkbox,
  Container,
  FormGroup,
  Spacer,
  Spinner,
  TextArea,
} from '@viaa/avo2-components';
import { AvoFileUploadAssetType, AvoLomLomField } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import type { Requests } from 'node-zendesk';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router';

import { commonUserAtom } from '../../authentication/authentication.store';
import { redirectToClientPage } from '../../authentication/helpers/redirects/redirects';
import { APP_PATH } from '../../constants';
import { FileUpload } from '../../shared/components/FileUpload/FileUpload';
import { LomFieldsInput } from '../../shared/components/LomFieldsInput/LomFieldsInput';
import { DOC_TYPES } from '../../shared/helpers/files';
import { getFullNameCommonUser } from '../../shared/helpers/formatters/avatar';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { validateForm } from '../../shared/helpers/validate-form';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ZendeskService } from '../../shared/services/zendesk-service';

import { EDUCATIONAL_AUTHOR_ITEM_REQUEST_FORM_VALIDATION_SCHEMA } from './EducationalAuthorItemRequestForm.consts';
import { renderAttachment } from './UserItemRequestForm.helpers';

import './ItemRequestForm.scss';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

interface FormValues {
  description: string;
  wantsToUploadAttachment: boolean;
  attachmentUrl: string | null;
  organisation: string;
  method: string;
  educationLevels: AvoLomLomField[];
}

export const EducationalAuthorItemRequestForm: FC = () => {
  const navigateFunc = useNavigate();
  const commonUser = useAtomValue(commonUserAtom);

  const [formValues, setFormValues] = useState<FormValues>({
    description: '',
    wantsToUploadAttachment: false,
    attachmentUrl: null,
    organisation: commonUser?.organisation?.name || '',
    method: '',
    educationLevels: [],
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSend = async () => {
    let ticket: Requests.CreateModel | undefined;
    try {
      setIsLoading(true);
      const newFormErrors = await validateForm(
        formValues,
        EDUCATIONAL_AUTHOR_ITEM_REQUEST_FORM_VALIDATION_SCHEMA,
      );
      if (newFormErrors) {
        setFormErrors(newFormErrors);
        ToastService.danger(Object.values(newFormErrors)[0]);
        setIsLoading(false);
        return;
      }

      // create zendesk ticket
      const body = {
        description: formValues.description,
        firstName: commonUser?.firstName,
        lastName: commonUser?.lastName,
        email: commonUser?.email,
        organisation: formValues.organisation,
        method: formValues.method,
        educationLevels: formValues.educationLevels
          .map((educationLevel) => educationLevel.label)
          .join(', '),
      };
      ticket = {
        comment: {
          url: window.location.href,
          body: JSON.stringify(body),
          html_body: `<dl>
  <dt>${tText(
    'user-item-request-form/views/educational-author-item-request-form___bericht',
  )}</dt><dd>${body.description}</dd>
  <dt>${tText(
    'user-item-request-form/views/educational-author-item-request-form___bijlage',
  )}</dt><dd>${renderAttachment(formValues.attachmentUrl, formValues.wantsToUploadAttachment)}</dd>
  <dt>${tText(
    'user-item-request-form/views/educational-author-item-request-form___school-of-organisatie',
  )}</dt><dd>${body.organisation}</dd>
  <dt>${tText(
    'user-item-request-form/views/educational-author-item-request-form___methode',
  )}</dt><dd>${body.method}</dd>
  <dt>${tText(
    'user-item-request-form/views/educational-author-item-request-form___onderwijsniveaus',
  )}</dt><dd>${body.educationLevels}</dd>
</dl>`,
          public: false,
        },
        subject: tText(
          'user-item-request-form/views/educational-author-item-request-form___uitgeverij-aanvraag-item',
        ),
        requester: {
          email: commonUser?.email,
          name: getFullNameCommonUser(commonUser, true, false) || '',
        },
      };
      await ZendeskService.createTicket(ticket);

      trackEvents(
        {
          object: formValues.description,
          object_type: 'item',
          action: 'request',
        },
        commonUser,
      );

      ToastService.success(
        tHtml(
          'user-item-request-form/views/educational-author-item-request-form___je-aanvraag-is-verstuurt',
        ),
      );
      redirectToClientPage(
        APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
        navigateFunc,
      );
    } catch (err) {
      console.error('Failed to create zendesk ticket', err, ticket);
      ToastService.danger(
        tHtml(
          'user-item-request-form/views/educational-author-item-request-form___het-versturen-van-je-aanvraag-is-mislukt',
        ),
      );
    }
    setIsLoading(false);
  };

  const renderForm = () => {
    return (
      <>
        <BlockHeading type="h2">
          {tHtml(
            'user-item-request-form/views/educational-author-item-request-form___niet-gevonden-wat-je-zocht-vraag-het-aan',
          )}
        </BlockHeading>
        {tHtml(
          'user-item-request-form/views/educational-author-item-request-form___vul-onderstaand-formulier-in',
        )}
        <Container mode="vertical">
          {tHtml(
            'user-item-request-form/views/educational-author-item-request-form___omschrijf-je-aanvraag',
          )}
          <FormGroup error={formErrors.description}>
            <TextArea
              id="description"
              value={formValues.description}
              onChange={(newDescription) =>
                setFormValues({ ...formValues, description: newDescription })
              }
              rows={isMobileWidth() ? 6 : 15}
              placeholder={tText(
                'user-item-request-form/views/educational-author-item-request-form___gebruikersaanvraag-beschrijving',
              )}
            />
          </FormGroup>
          <FormGroup label="" labelFor="attachment">
            <Checkbox
              label={tText(
                'user-item-request-form/views/educational-author-item-request-form___ik-wil-een-bijlage-opladen',
              )}
              checked={formValues.wantsToUploadAttachment}
              onChange={(checked) =>
                setFormValues({
                  ...formValues,
                  wantsToUploadAttachment: checked,
                })
              }
            />
            {formValues.wantsToUploadAttachment && (
              <FileUpload
                assetType={AvoFileUploadAssetType.ZENDESK_ATTACHMENT}
                urls={
                  formValues.attachmentUrl ? [formValues.attachmentUrl] : []
                }
                onChange={(attachments) =>
                  setFormValues({
                    ...formValues,
                    attachmentUrl: attachments[0],
                  })
                }
                ownerId=""
                allowedTypes={DOC_TYPES}
                allowMulti={false}
                label={tText(
                  'user-item-request-form/views/educational-author-item-request-form___selecteer-een-bestand-word-excel-max-xxx-mb',
                )}
              />
            )}
          </FormGroup>
          <FormGroup
            label={tText(
              'user-item-request-form/views/educational-author-item-request-form___naam-uitgeverij',
            )}
            required
            labelFor="organisation"
            error={formErrors.organisation}
          >
            <TextInput
              className="c-input-react-components"
              id="organisation"
              ariaLabel={tText(
                'user-item-request-form/views/educational-author-item-request-form___organisatie',
              )}
              value={formValues.organisation}
              onChange={(evt) =>
                setFormValues({
                  ...formValues,
                  organisation: evt.currentTarget.value,
                })
              }
            />
          </FormGroup>
          <FormGroup
            label={tText(
              'user-item-request-form/views/educational-author-item-request-form___naam-methode',
            )}
            required
            labelFor="method"
            error={formErrors.method}
          >
            <TextInput
              className="c-input-react-components"
              id="method"
              ariaLabel={tText(
                'user-item-request-form/views/educational-author-item-request-form___naam-methode',
              )}
              value={formValues.method}
              onChange={(evt) =>
                setFormValues({
                  ...formValues,
                  method: evt.currentTarget.value,
                })
              }
            />
          </FormGroup>
          <FormGroup error={formErrors.educationLevels} required>
            <LomFieldsInput
              loms={formValues.educationLevels}
              isEducationRequired={true}
              showEducation={true}
              isEducationDegreesRequired={false}
              showEducationDegrees={false}
              isSubjectsRequired={false}
              showSubjects={false}
              isThemesRequired={false}
              showThemes={false}
              onChange={(newLoms) =>
                setFormValues({
                  ...formValues,
                  educationLevels: newLoms || [],
                })
              }
              allowMultiSelect={true}
              educationLabel={tText(
                'user-item-request-form/views/educational-author-item-request-form___onderwijsgraden',
              )}
            />
          </FormGroup>
          <Spacer margin={['top', 'bottom-extra-large']}>
            <FormGroup>
              {isLoading ? (
                <Spinner size="large" />
              ) : (
                <Button
                  type="primary"
                  onClick={onSend}
                  label={tText(
                    'user-item-request-form/views/educational-author-item-request-form___aanvraag-indienen',
                  )}
                />
              )}
            </FormGroup>
          </Spacer>
          {tHtml(
            'user-item-request-form/views/educational-author-item-request-form___welk-materiaal-komt-in-aanmerking-voor-publicatie',
          )}
        </Container>
      </>
    );
  };

  return (
    <Container className="p-item-request-form" mode="vertical">
      <Container mode="horizontal" size="large">
        <SeoMetadata
          title={tText(
            'user-item-request-form/views/educational-author-item-request-form___gebruikersaanvraag-pagina-titel',
          )}
          description={tText(
            'user-item-request-form/views/educational-author-item-request-form___gebruikersaanvraag-pagina-beschrijving',
          )}
        />
        <div className="c-content">{renderForm()}</div>
      </Container>
    </Container>
  );
};

export default EducationalAuthorItemRequestForm;
