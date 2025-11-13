import { useMutation } from '@tanstack/react-query'
import { type EmbedCode } from '../embed-code.types';
import { EmbedCodeService } from '../embed-code-service';

export const useCreateEmbedCode = () => {
  return useMutation({
    mutationFn: (embedCode: EmbedCode): Promise<EmbedCode> =>
      EmbedCodeService.createEmbedCode(embedCode),
  })
}
