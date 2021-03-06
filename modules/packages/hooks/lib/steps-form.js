"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var form_1 = require("./form");
exports.useStepsForm = function (config) {
    var _a = config || {}, form = _a.form, defaultFormValues = _a.defaultFormValues, _b = _a.defaultCurrent, defaultCurrent = _b === void 0 ? 0 : _b, submit = _a.submit, total = _a.total, _c = _a.isBackValidate, isBackValidate = _c === void 0 ? true : _c;
    var _d = react_1.useState(defaultCurrent), current = _d[0], setCurrent = _d[1];
    var _e = form_1.useForm({
        form: form,
        submit: submit,
        defaultFormValues: defaultFormValues,
    }), formInstance = _e.form, formProps = _e.formProps, formLoading = _e.formLoading, defaultFormValuesLoading = _e.defaultFormValuesLoading, formValues = _e.formValues, initialValues = _e.initialValues, formResult = _e.formResult, formSubmit = _e.submit;
    var go = function (step) {
        var targetStep = step;
        if (step > total - 1) {
            targetStep = total - 1;
        }
        if (step < 0) {
            targetStep = 0;
        }
        setCurrent(targetStep);
    };
    var gotoStep = function (step) {
        if (step === current) {
            return true;
        }
        if (step < current && !isBackValidate) {
            go(step);
            return true;
        }
        return new Promise((function (resolve, reject) {
            formInstance.validateFields(function (err, values) {
                if (!err) {
                    go(step);
                    resolve(values);
                }
                else {
                    reject(err);
                }
            });
        }));
    };
    var handleStepChange = function (currentStep) { return gotoStep(currentStep); };
    return {
        current: current,
        gotoStep: gotoStep,
        stepsProps: {
            current: current,
            onChange: handleStepChange,
        },
        formProps: formProps,
        formLoading: formLoading,
        defaultFormValuesLoading: defaultFormValuesLoading,
        formValues: formValues,
        initialValues: initialValues,
        formResult: formResult,
        form: formInstance,
        submit: formSubmit,
    };
};
