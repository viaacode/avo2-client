import { useMutation } from '@tanstack/react-query'

export type UseMutationResult<T, U, V> = ReturnType<typeof useMutation<T, U, V>>
