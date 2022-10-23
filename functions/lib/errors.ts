export class BadRequestError extends Error {
  constructor(message?: string) {
    super(message === undefined ? 'Invalid request' : message);
  }
}
