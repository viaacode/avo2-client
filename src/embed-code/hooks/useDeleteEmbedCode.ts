import { useMutation } from '@tanstack/react-query'

import { EmbedCodeService } from '../embed-code-service';

export const useDeleteEmbedCode = () => {
  return useMutation({
    mutationFn: (embedCodeId: string): Promise<void> =>
      EmbedCodeService.deleteEmbedCode(embedCodeId),
  })
}
