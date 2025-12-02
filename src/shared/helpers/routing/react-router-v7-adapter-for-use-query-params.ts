import { useLocation, useNavigate } from 'react-router';
import { type PartialLocation } from 'use-query-params';
import { QueryParamAdapterComponent } from './use-query-params-ssr';

export const ReactRouter7Adapter: QueryParamAdapterComponent = ({
  children,
}: {
  children: any;
}) => {
  const navigateFunc = useNavigate();
  const location = useLocation();

  return children({
    location,
    push: ({ search, state }: PartialLocation) =>
      navigateFunc({ search }, { state }),
    replace: ({ search, state }: PartialLocation) =>
      navigateFunc({ search }, { replace: true, state }),
  });
};
