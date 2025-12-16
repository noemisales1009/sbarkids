/**
 * Utilities para tratamento de erros
 */

export interface AppError {
    message: string;
    code?: string;
    details?: unknown;
}

/**
 * Log de erro com contexto
 */
export const logError = (error: unknown, context: string = ''): AppError => {
    const appError: AppError = {
        message: 'Um erro ocorreu',
        code: 'UNKNOWN_ERROR',
    };

    if (error instanceof Error) {
        appError.message = error.message;
        appError.details = error.stack;
    } else if (typeof error === 'string') {
        appError.message = error;
    } else {
        appError.details = error;
    }

    const logMessage = context ? `[${context}] ${appError.message}` : appError.message;
    console.error(logMessage, error);

    return appError;
};

/**
 * Wrapper para operações assíncronas com tratamento de erro
 */
export const asyncHandler = async <T,>(
    fn: () => Promise<T>,
    context: string = ''
): Promise<{ data?: T; error?: AppError }> => {
    try {
        const data = await fn();
        return { data };
    } catch (error) {
        const appError = logError(error, context);
        return { error: appError };
    }
};

/**
 * Mensagens de erro amigáveis ao usuário
 */
export const getUserFriendlyMessage = (error: AppError): string => {
    const messages: Record<string, string> = {
        NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
        INVALID_DATA: 'Dados inválidos fornecidos.',
        UNAUTHORIZED: 'Você não tem permissão para acessar isso.',
        NOT_FOUND: 'O recurso não foi encontrado.',
        SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
    };

    return messages[error.code || ''] || error.message || 'Algo deu errado. Tente novamente.';
};
