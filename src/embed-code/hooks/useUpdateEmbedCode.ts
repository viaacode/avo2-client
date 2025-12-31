import { useMutation } from '@tanstack/react-query';
import { type EmbedCode } from '../embed-code.types';
import { EmbedCodeService } from '../embed-code-service';

export const useUpdateEmbedCode = () => {
  return useMutation({
    mutationFn: (embedCode: EmbedCode): Promise<void> =>
      EmbedCodeService.updateEmbedCode(embedCode),
  });
};
