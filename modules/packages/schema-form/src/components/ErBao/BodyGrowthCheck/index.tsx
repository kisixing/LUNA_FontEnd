import React from 'react';
import { registerFormField, connect } from '@uform/antd';
import EditableCell from './EditableTable';

export default registerFormField(
  'body_growth_check',
  connect({})((props: any) => {
    const { dataset = [], value = [], onChange, readOnly, title } = props;
    return (
      <div style={{ display: 'flex' }}>
        <span style={{ width: '90px', textAlign: 'right' }}>{title}：</span>
        <EditableCell
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          dataset={dataset}
          title={title}
        />
      </div>
    );
  })
);
