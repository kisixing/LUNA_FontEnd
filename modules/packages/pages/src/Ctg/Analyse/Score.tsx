import React, { useState, useEffect } from 'react';
import { Radio, Button, Select } from 'antd';
import { Suit } from '@lianmed/lmg/lib/Ctg/Suit';

import Methods from './methods'
import { event } from '@lianmed/utils';
const intervals = [20, 40]
interface IProps {
  ctgData: any;
  docid: string,
  v: Suit
  responseData: any
  MARKS: any
  analyse: any
  startTime: any
  mark, setMark: any
  interval, setInterval: any
  modifyData: any
  Fischer_ref: any
  Nst_ref: any
  Krebs_ref: any
  [x: string]: any
}

const ScoringMethod = (props: IProps) => {
  const { docid, v, ctgData, fetal, setFetal, ...others } = props;

  const [disabled, setDisabled] = useState(true)

  const {
    responseData,
    MARKS,
    analyse,
    startTime,
    mark, setMark,
    interval, setInterval,
    modifyData
  } = props

  const onChange = e => {
    const mark = e.target.value
    modifyData()

    setMark(mark)
  };



  useEffect(() => {

    const cb = fn => {
      fn(JSON.stringify(responseData))

    }
    event.on('analysis:result', cb)
    return () => {
      event.off('analysis:result', cb)
    };
  }, [responseData])


  const IntervalRadio = () => {
    return (
      <span style={{ marginRight: 10 }}> 时长：
            <Select onChange={e => {
          const i = Number(e) || 20
          setInterval(i)

        }} value={interval}>
          {
            intervals.map(value => (
              <Select.Option value={value} key={value}>{value + '分钟'}</Select.Option>
            ))
          }
        </Select>
      </span>
    )
  }
  const FetalSelect = () => {
    return (
      <span style={{ marginRight: 10 }}> 胎心率：
            <Select onChange={setFetal} value={fetal}>
          {
            Array(+ctgData.fetalnum).fill(0).map((_, i) => (
              <Select.Option value={i + 1} key={i + 1}>{`FHR${i + 1}`}</Select.Option>
            ))
          }
        </Select>
      </span>
    )
  }

  const StartTime = () => {
    return <span style={{ marginRight: 10 }}>开始时间：{(startTime / 240).toFixed(1)}分</span>
  }
  const EndTime = () => {
    return <span>结束时间：{(startTime / 240 + interval).toFixed(1)}分</span>
  }

  return (
    <div  {...others}>
      <div style={{ padding: '12px 24px', background: '#ddd' }}>
        <>
          <IntervalRadio />
          <FetalSelect />
          <StartTime />
          <EndTime />
        </>
      </div>
      <div style={{ padding: '10px 24px 0' }}>
        <Radio.Group onChange={onChange} value={mark} style={{ marginBottom: 5 }}>
          {
            MARKS.map(_ => (
              <Radio value={_} key={_}>{_}分析法</Radio>
            ))
          }
        </Radio.Group>
        {/* <Form form={form} labelAlign="left" {...formItemLayout} style={{ width: '100%' }}>
          {
            activeItem.map(({ label, key, rules }) => (
              <Form.Item label={label} key={key} style={{ marginBottom: 0 }} rules={rules}>
                <InputNumber disabled={disabled} style={{ width: '150px' }} />
              </Form.Item>
            ))
          }
          <Form.Item label="电脑评分">
            <span>CTG = {Object.values(formScores).reduce((a, b) => ~~a + ~~b, 0)}</span>
          </Form.Item>

        </Form> */}


        <Methods {...props} disabled={disabled} />

        <div style={{ marginTop: 5 }}>
          <Button size="small" style={{ marginBottom: 10 }} type="primary" onClick={analyse}>分析</Button>
          <Button size="small" style={{ marginBottom: 10 }} onClick={() => {
            const next = !disabled
            if (next) {
              modifyData()
            }
            setDisabled(next)
          }}>{disabled ? '修改' : '确认'}</Button>
          <Button size="small" style={{ marginBottom: 10 }}>打印</Button>
        </div>
      </div>
    </div>
  );
}

export default ScoringMethod