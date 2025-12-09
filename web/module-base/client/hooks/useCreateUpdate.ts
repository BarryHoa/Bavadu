import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";

interface UseCreateUpdateOptions<TPayload, TResult> {
  mutationFn: (payload: TPayload) => Promise<TResult>;
  invalidateQueries?: QueryKey[];
  onSuccess?: (data: TResult) => void;
  onError?: (error: unknown) => void;
}

export function useCreateUpdate<TPayload, TResult>({
  mutationFn,
  invalidateQueries,
  onSuccess,
  onError,
}: UseCreateUpdateOptions<TPayload, TResult>) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: TPayload) => {
      setErrorMessage(null);
      return mutationFn(payload);
    },
    onSuccess: (data) => {
      if (invalidateQueries?.length) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again.";
      setErrorMessage(message);
      onError?.(error);
    },
  });

  const handleSubmit = useCallback(
    async (payload: TPayload) => {
      await mutation.mutateAsync(payload);
    },
    [mutation]
  );

  const resetError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    handleSubmit,
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: errorMessage,
    resetError,
  };
}
