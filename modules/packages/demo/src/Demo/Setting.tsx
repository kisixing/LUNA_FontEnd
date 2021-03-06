import React, { useEffect } from 'react';
import { Form, Radio, Input } from 'antd';
import { event } from '@lianmed/utils';

const Setting = (props: { form: any }) => {

  const { form, ...others } = props;


  return (
    <div {...others}>
      <div >
        <div style={{ padding: '12px 24px', background: '#ddd' }}>
          诊断结果
          </div>
        <Form style={{ padding: '12px 24px' }}>
          <Form.Item label="NST" style={{ marginBottom: 0 }}>
            <Radio.Group>
              <Radio value={1}>有反应</Radio>
              <Radio value={2}>无反应</Radio>
              <Radio value={3}>正弦型</Radio>
              <Radio value={4}>不满意</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="CST/OCT" style={{ marginBottom: 0 }}>

            <Radio.Group>
              <Radio value={1}>阴性</Radio>
              <Radio value={2}>阳性</Radio>
              <Radio value={3}>可以</Radio>
              <Radio value={4}>不满意</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="短变异（毫秒）" style={{ marginBottom: 0 }}>

            <Radio.Group>
              <Radio value={1}>平滑</Radio>
              <Radio value={2}>小波浪</Radio>
              <Radio value={3}>中波浪</Radio>
              <Radio value={4}>大波浪</Radio>
              <Radio value={5}>正弦型</Radio>
            </Radio.Group>
            
          </Form.Item>
          <Form.Item label='诊断' style={{ marginBottom: 0 }} >
            <Input.TextArea style={{ maxWidth: 400 }} />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default (Setting);