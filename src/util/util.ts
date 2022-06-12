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
    }
};