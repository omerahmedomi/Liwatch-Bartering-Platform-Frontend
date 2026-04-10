type ErrorWithResponseData = {
  response?: {
    data?: unknown;
  };
};

export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred",
) {
  const responseData = (error as ErrorWithResponseData)?.response?.data;
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
