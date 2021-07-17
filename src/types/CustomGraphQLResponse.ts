export interface CustomGraphQLResponse<T> {
  data: T;
  errors: Array<{
    errorType: string;
    message: string;
    errorInfo: any;
  }>;
}
