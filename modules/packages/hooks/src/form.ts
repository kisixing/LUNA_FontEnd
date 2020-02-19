import { useState, useEffect } from 'react';
import { Form } from 'antd';

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


export const useForm = (config: UseFormConfig) => {
  const [defaultFormValuesLoading, setDefaultFormValuesLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const { defaultFormValues, form, submit } = config;
  const [formValues, setFormValues] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formResult, setFormResult] = useState();


  let version = 3;
  // antd4
  if (Form['useForm']) {
    version = 4;
  }

  let formInstance = form;
  if (!form) {
    if (version === 4) {
      [formInstance] = Form['useForm']();
    } else {
      throw new Error('"form" need in antd@3');
    }
  }

  const onFinish = (formValue: Store) => {
    setFormValues(formValue);
    setFormLoading(true);
    return new Promise((resolve, reject) => {
      formInstance.validateFields().then(values => {
        resolve(Promise.resolve(submit(values)).then(data => {
          setFormLoading(false);
          setFormResult(data);
          return data;
        }).catch(err => {
          setFormLoading(false);
          throw err;
        }))
      }).catch(validateErr => {
        setFormLoading(false);
          reject(validateErr);
      })
    });
  };

  useEffect(() => {
    let isUnMounted = false;
    if (!defaultFormValues) {
      return;
    }
    let value: Store | Promise<Store>;
    if (typeof defaultFormValues === 'function') {
      setDefaultFormValuesLoading(true);
      value = defaultFormValues();
    } else {
      value = defaultFormValues;
    }
    Promise.resolve(value).then(data => {
      if (!isUnMounted) {
        const obj = { ...data };
        Object.keys(data).forEach(name => {
          obj[name] = form.isFieldTouched(name) ? form.getFieldValue(name) : data[name];
        });
        setDefaultFormValuesLoading(false);
        setInitialValues(data);
        form.setFieldsValue(obj);
      }
    }).catch(() => {
      if (!isUnMounted) {
        setDefaultFormValuesLoading(false);
      }
    });
    return () => {
      isUnMounted = true;
    };
  }, []);


  const formProps = version === 4 ? {
    form: formInstance,
    onFinish,
    initialValues,
  } : {
      onSubmit(e) {
        e.preventDefault();
        onFinish(form.getFieldsValue());
      },
    };

  return {
    form: formInstance,
    formProps,
    defaultFormValuesLoading,
    formValues,
    initialValues,
    formResult,
    formLoading,
    submit: (values?: Store) => {
      formInstance.setFieldsValue(values);
      return onFinish(formInstance.getFieldsValue());
    },
  };
};
