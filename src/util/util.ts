import { AxiosResponse } from 'axios';

class ErrorType {
    status: number;
    error: boolean;
    message: string | String;
    innerError?: ErrorType

    constructor(status: number, error: boolean, message: string | String) {
        this.status = status;
        this.error = error;
        this.message = message;
    }
}

export default {
    equalizePayloadWithModel(model: any, payload: any) {
        let result = { ...model, ...payload };

        Object.keys(result).forEach((field) => {
            let isPresentOnModel = Object.keys(model).some(modelField => modelField === field);

            if (!isPresentOnModel) {
                delete result[field];
            };
        });

        return result;
    },

    minDate() {
        return new Date(-8640000000000000);
    },

    maxDate() {
        return new Date(8640000000000000);
    },

    handleError(e: ErrorType | unknown, customMessage?: string) {
        let error: ErrorType = new ErrorType(500, true, customMessage ?? '');

        if (typeof e === 'string' || e instanceof String) {
            error.message = e;
        } else if (e instanceof ErrorType) {
            error.status = e.status;
            error.innerError = e;
        } else {
            console.error(e);
        };

        return error;
    },

    createError(status: number, message?: string) {
        let error: ErrorType = new ErrorType(status, true, message ?? '');
        return error;
    },

    ensureAxiosSuccessCode(result: AxiosResponse, messageInCaseOfError?: string) {
        if (result.status !== 200) {
            throw this.createError(result.status, messageInCaseOfError ?? result.statusText);
        };
    },
};