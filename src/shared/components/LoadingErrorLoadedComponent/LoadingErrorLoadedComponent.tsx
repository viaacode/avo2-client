import { IconName } from '@viaa/avo2-components';
import { type FC, type ReactElement } from 'react';

import {
  ErrorView,
  type ErrorViewQueryParams,
} from '../../../error/views/ErrorView';
import { tHtml } from '../../helpers/translate-html';
import { FullPageSpinner } from '../FullPageSpinner/FullPageSpinner';

export type LoadingState = 'loading' | 'loaded' | 'error' | 'forbidden';

export interface LoadingInfo extends ErrorViewQueryParams {
  state: LoadingState;
}

interface LoadingErrorLoadedComponentProps {
  loadingInfo: LoadingInfo;
  notFoundError?: string | null;
  showSpinner?: boolean;
  dataObject: any | undefined | null;
  render: () => ReactElement | null;
  locationId: string;
}

export const LoadingErrorLoadedComponent: FC<
  LoadingErrorLoadedComponentProps
> = ({
  loadingInfo = { state: 'loading' },
  notFoundError,
  showSpinner = true,
  dataObject,
  render,
  locationId,
}) => {
  const renderSpinner = () => (
    <FullPageSpinner locationId={`${locationId}--loading`} />
  );

  const renderError = () => (
    <ErrorView
      locationId={`${locationId}--error`}
      message={
        loadingInfo.message ||
        tHtml(
          'shared/components/loading-error-loaded-component/loading-error-loaded-component___er-is-iets-mis-gegaan-bij-het-laden-van-de-gegevens',
        )
      }
      icon={loadingInfo.icon || IconName.alertTriangle}
      actionButtons={loadingInfo.actionButtons || ['home']}
    />
  );

  // Render
  switch (loadingInfo.state) {
    case 'error':
    case 'forbidden':
      return renderError();

    case 'loaded':
      if (dataObject) {
        return render();
      }
      return (
        <ErrorView
          locationId={`${locationId}--error`}
          message={
            notFoundError ||
            tHtml(
              'shared/components/loading-error-loaded-component/loading-error-loaded-component___het-gevraagde-object-is-niet-gevonden',
            )
          }
          icon={IconName.search}
          actionButtons={['home', 'helpdesk']}
        />
      );

    case 'loading':
    default:
      return showSpinner ? renderSpinner() : <></>;
  }
};
