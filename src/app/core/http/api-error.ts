import { HttpErrorResponse } from '@angular/common/http';

/** Normalized error thrown by the HTTP layer, carrying a user-facing (pt-BR) message. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly url: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  static fromHttpError(error: HttpErrorResponse): ApiError {
    return new ApiError(error.status, messageForStatus(error.status), error.url);
  }
}

export function messageForStatus(status: number): string {
  if (status === 0) {
    return 'Não foi possível conectar à API. Verifique sua conexão.';
  }
  if (status === 404) {
    return 'Conteúdo não encontrado.';
  }
  if (status === 429) {
    return 'Muitas requisições em pouco tempo. Tente novamente em instantes.';
  }
  if (status >= 500) {
    return 'O serviço da TVMaze está instável no momento.';
  }
  return 'Algo deu errado ao carregar os dados.';
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Algo deu errado ao carregar os dados.';
}
