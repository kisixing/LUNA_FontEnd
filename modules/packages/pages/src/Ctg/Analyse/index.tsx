import { Ctg } from '@lianmed/lmg';
import { Suit } from '@lianmed/lmg/lib/Ctg/Suit';
import request from "@lianmed/request";
import { Button, Col, Row, message, Modal } from 'antd';
import 'antd/dist/antd.css';
import React, { useRef, useState } from 'react';
import styled from "styled-components";
import Analyse from './Analyse';
import Score from './Score';
import useAnalyse from './useAnalyse';
import useCtgData from './useCtgData';
import { obvue } from '@lianmed/f_types/lib/obvue';

const Wrapper = styled.div`
  height:100%;
  .divider {
    border-radius:2px;
    background:linear-gradient(45deg, #e0e0e0, transparent) !important;
    padding-left:20px;
    margin: 8px 0;
  }
  button {
    margin:0 6px 6px 0
  }
  .bordered {
    border: 1px solid #ddd;
  }
`

function Analysis({
  docid = ''
}) {
  // docid = '1_1112_160415144057'
  const { ctgData, loading, setFhr, fetal, setFetal } = useCtgData(docid)
  const [disabled, setDisabled] = useState(true)


  const ref = useRef<Suit>(null)

  const {
    responseData,
    MARKS,
    analyse,
    startTime,
    mark, setMark,
    interval, setInterval,
    Fischer_ref,
    Nst_ref,
    Krebs_ref,
    analysis_ref,
    old_ref,

  } = useAnalyse(ref.current, docid, fetal, setFhr)

  const d = {
    responseData,
    MARKS,
    analyse,
    startTime,
    mark, setMark,
    interval, setInterval,
    Fischer_ref,
    Nst_ref,
    Krebs_ref,
    old_ref
  }
  const submit = () => {
    const curData: { [x: string]: number } = d[`${mark}_ref`].current.getFieldsValue()
    const oldData: { [x: string]: number } = old_ref.current[mark]
    const rightData = analysis_ref.current.getFieldsValue()
    const { wave, diagnosistxt, classification0, classification1, ...analyseData } = rightData


    const isedit = Object.entries(curData).find(([k, v]) => oldData[k] !== v) ? true : false
    const data = {
      note: docid,
      diagnosis: JSON.stringify({ wave, diagnosistxt, classification0, classification1 }),
      result: JSON.stringify({
        ...analyseData,
        ...curData,
        isedit
      })
    }

    request.put(`/ctg-exams-note`, { data }).then((r: any) => {
      //TODO: 结果判断
      message.success('保存成功！', 3);
    })
  }

  const history = () => {
    const data = {
      'note.equals': docid
    }


    request.get(`/ctg-exams-criteria`, { params: data }).then(function (r) {
      if (r.length > 0) {
        const diagnosis = r[0].diagnosis;
        let t;
        try {
          t = JSON.parse(diagnosis).diagnosistxt
        } catch (error) {
        }
        info(t || '暂无记录');
      }
    })
  }

  const info = (message: any) => {
    Modal.info({
      title: '历史记录',
      content: message,
      onOk() { }
    });
  }
  const btnDisabled = !docid || !disabled
  return (
    <Wrapper >
      <div style={{ height: `calc(100% - 420px - 12px)`, marginBottom: 12, background: '#fff', boxShadow: '#ddd 0px 0px 2px 2px', overflow: 'hidden' }}>
        <Ctg suitType={1} ref={ref} loading={loading} data={ctgData} />

      </div>
      <Row gutter={12} style={{ height: 420 }}>
        <Col span={12} >
          <Score disabled={disabled}  {...d} fetal={fetal} setFetal={setFetal} ctgData={ctgData} docid={docid} v={ref.current} className="bordered" />
          <div style={{ position: 'absolute', right: 12, bottom: 0 }}>
            <Button size="small" style={{ marginBottom: 10 }} onClick={history} disabled={btnDisabled}>历史分析</Button>
            <Button size="small" style={{ marginBottom: 10 }} disabled={!docid} onClick={() => setDisabled(!disabled)}>{disabled ? '修改' : '确认'}</Button>
            <Button size="small" style={{ marginBottom: 10 }} type="primary" onClick={analyse} disabled={!docid}>评分</Button>
          </div>
        </Col>
        <Col span={12}  >
          <Analyse ref={analysis_ref} />
          <div style={{ position: 'absolute', right: 12, bottom: 0 }}>
            <Button size="small" style={{ marginBottom: 10 }} disabled={btnDisabled}>打印</Button>
            <Button size="small" type="primary" onClick={submit} disabled={btnDisabled}>保存</Button>
          </div>

        </Col>
      </Row>
    </Wrapper>
  );
}

export default Analysis;
