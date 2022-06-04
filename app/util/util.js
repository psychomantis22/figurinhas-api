export default {
    equalizePayloadWithModel(model, payload) {
        let result = { ...model, ...payload };

        Object.keys(result).forEach((field) => {
            let isPresentOnModel = Object.keys(model).some(modelField => modelField === field);

            if (!isPresentOnModel) {
                delete result[field];
            };
        });

        return result;
    }
};