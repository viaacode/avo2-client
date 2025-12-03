import { useMutation } from '@tanstack/react-query';
import {
  DeleteCollectionOrBundleByUuidMutation,
  DeleteCollectionOrBundleByUuidMutationVariables,
} from '../../shared/generated/graphql-db-operations.ts';
import { DeleteCollectionOrBundleByUuidDocument } from '../../shared/generated/graphql-db-react-query.ts';
import { dataService } from '../../shared/services/data-service.ts';

export const useDeleteCollectionOrBundleByUuid = () => {
  return useMutation({
    mutationFn: (ids: {
      collectionOrBundleUuid: string;
      collectionOrBundleUuidAsText: string;
    }): Promise<DeleteCollectionOrBundleByUuidMutation> => {
      return dataService.query<
        DeleteCollectionOrBundleByUuidMutation,
        DeleteCollectionOrBundleByUuidMutationVariables
      >({
        query: DeleteCollectionOrBundleByUuidDocument,
        variables: {
          collectionOrBundleUuid: ids.collectionOrBundleUuid,
          collectionOrBundleUuidAsText: ids.collectionOrBundleUuidAsText,
        },
      });
    },
  });
};
