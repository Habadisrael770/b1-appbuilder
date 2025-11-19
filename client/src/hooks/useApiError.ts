import { toast } from "sonner";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export function useApiError() {
  const handleError = (error: unknown, defaultMessage = "Something went wrong") => {
    let message = defaultMessage;
    let code = "UNKNOWN_ERROR";
    let status: number | undefined;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "object" && error !== null) {
      const err = error as Record<string, any>;
      
      // Handle tRPC errors
      if (err.data?.code) {
        code = err.data.code;
        message = err.message || defaultMessage;
        status = err.data.httpStatus;
      }
      // Handle fetch errors
      else if (err.message) {
        message = err.message;
      }
    } else if (typeof error === "string") {
      message = error;
    }

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", { message, code, status, error });
    }

    // Show toast notification
    toast.error(message);

    return { message, code, status };
  };

  const handleSuccess = (message = "Operation completed successfully") => {
    toast.success(message);
  };

  const handleLoading = (message = "Loading...") => {
    return toast.loading(message);
  };

  return { handleError, handleSuccess, handleLoading };
}
