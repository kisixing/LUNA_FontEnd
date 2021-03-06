declare type StoreBaseValue = string | number | boolean;
export declare type StoreValue = StoreBaseValue | Store | StoreBaseValue[];
export interface Store {
    [name: string]: StoreValue;
}
export interface UseFormConfig {
    defaultFormValues?: Store | (() => (Promise<Store> | Store));
    form?: any;
    submit?: (formValues: Store) => any;
}
export declare const useForm: (config: UseFormConfig) => {
    form: any;
    formProps: {
        form: any;
        onFinish: (formValue: Store) => Promise<unknown>;
        initialValues: {};
    } | {
        onSubmit(e: any): void;
        form?: undefined;
        onFinish?: undefined;
        initialValues?: undefined;
    };
    defaultFormValuesLoading: boolean;
    formValues: {};
    initialValues: {};
    formResult: undefined;
    formLoading: boolean;
    submit: (values?: Store) => Promise<unknown>;
};
export {};
