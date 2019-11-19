import React, { useMemo,useState } from 'react';
import { Row, Col, Button } from 'antd';
import Result from './Result';
import Setting from './Setting';
import CTGChart from './CTGChart';
import { Suit } from '@lianmed/lmg/lib/Ctg/Suit';
import { event } from '@lianmed/utils';
import request from "@lianmed/request";
import useCtgData from './useCtgData'
export const Context = React.createContext({});
const border = { border: '1px solid #ddd' }
function Analysis({
  docid = '1_1112_160415144057'
}) {
  // docid = '1_1112_160415144057'
  const [ctgData] = useCtgData(docid)
  const v = useMemo<{ suit: Suit }>(() => {
    return {} as any;
  }, []);
  const [fetal, setFetal] = useState(1)
  const submit = () => {
    const data = { note: docid }
    event.emit('analysis:result', result => {
      Object.assign(data, { result })
    })
    event.emit('analysis:diagnosis', diagnosis => {
      Object.assign(data, { diagnosis })
    })
    console.log(data)
    request.put(`/ctg-exams-note`, { data })
  }
  return (
    <Context.Provider value={v}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, padding: 24, marginBottom: 24, background: '#fff', boxShadow: '#ddd 0px 0px 2px 2px' }}>
          <CTGChart ctgData={ctgData} />
        </div>
        <div style={{ height: 420 }}>
          <Row gutter={24} style={{ height: '100%' }}>
            <Col span={12} style={{ height: '100%' }} >
              <Result fetal={fetal} setFetal={setFetal} ctgData={ctgData} docid={docid} v={v} style={{ ...border, height: '100%', background: '#fff' }} />
            </Col>
            <Col span={12} style={{ height: '100%' }} >
              <Setting fetal={fetal} style={{ ...border, height: '100%', background: '#fff' }} />
              <Button style={{ position: 'absolute', right: 24, bottom: 16 }} type="primary" onClick={submit}>保存</Button>
            </Col>
          </Row>
        </div>
      </div>
    </Context.Provider>
  );
}

export default Analysis;