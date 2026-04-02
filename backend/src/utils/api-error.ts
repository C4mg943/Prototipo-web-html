export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[] | undefined;

  constructor(statusCode: number, message: string, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
