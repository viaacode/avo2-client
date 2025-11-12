import { useLocation, useNavigate } from 'react-router';
import { PartialLocation, QueryParamAdapterComponent } from 'use-query-params';

export const ReactRouter7Adapter: QueryParamAdapterComponent = ({
  children,
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
