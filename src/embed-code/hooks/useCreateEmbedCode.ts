import { useMutation } from '@tanstack/react-query'
import { type EmbedCode } from '../embed-code.types.js'
import { EmbedCodeService } from '../embed-code-service.js'

export const useCreateEmbedCode = () => {
  return useMutation({
    mutationFn: (embedCode: EmbedCode): Promise<EmbedCode> =>
      EmbedCodeService.createEmbedCode(embedCode),
  })
}
