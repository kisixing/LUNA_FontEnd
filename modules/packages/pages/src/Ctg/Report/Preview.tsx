import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button, Modal } from 'antd';
import { Context } from './index'
import request from "@lianmed/request";
import usePrintConfig from "./usePrintConfig";
import useSign from "./useSign";
import PreviewContent from './PreviewContent'
import useDiagnosis from "./useDiagnosis";
import Diagnosis from './Diagnosis'
const COEFFICIENT = 240

interface IProps {
  age: number
  docid: string
  end: number
  fetalcount: number
  inpatientNO: string
  name: string
  start: number
  startdate: string
  print_interval: number
  onDownload: () => void
  wh: { w: number, h: number }
  gestationalWeek?: any
}
const Preview = (props: IProps) => {
  const { onDownload, docid, name, age, gestationalWeek, inpatientNO, startdate, fetalcount, print_interval, wh } = props;
  const [value, setValue] = useState<{ suit: any }>({ suit: null })
  const [pdfBase64, setPdfBase64] = useState('')
  const [pdfBase64Loading, setPdfBase64Loading] = useState(false)

  const {
    startingTime,
    endingTime,
    locking,
    customizable,
    // remoteSetStartingTime,
    // remoteSetEndingTime,
    toggleLocking,
    toggleCustomiz
  } = usePrintConfig(value, print_interval)
  const { signHandler, qrCodeBase64, modalVisible, qrCodeBase64Loading, setModalVisible } = useSign(docid, setPdfBase64)
  const handlePreview = () => {
    setPdfBase64Loading(true)
    request.post(`/ctg-exams-pdf`, {
      data: {
        name, age, gestationalWeek, inpatientNO, startdate, fetalcount,
        docid,
        diagnosis,
        start: startingTime,
        end: endingTime,
      },
    }).then(res => {
      setPdfBase64Loading(false)
      const pdfData = res.pdfdata && `data:application/pdf;base64,${res.pdfdata}`;
      setPdfBase64(pdfData)
    })
  }
  const totalTime = ((endingTime - startingTime) / COEFFICIENT).toFixed(1) || '0'
  const { diagnosis, setDiagnosis } = useDiagnosis(totalTime)

  return (
    <Context.Consumer>
      {
        (v: any) => {
          setValue(v)
          return (
            <div style={{ display: 'flex', height: '100%' }}>
              <PreviewContent pdfBase64={pdfBase64} wh={wh} />
              <Diagnosis value={diagnosis} onChange={setDiagnosis} />

              <div style={{ width: 300, padding: 24, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', border: '1px solid #d9d9d9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>开始时间：
                    {/* <Input size="small" style={{ width: 80 }} value={(startingTime/ COEFFICIENT).toFixed(1)} onChange={e => {
                    remoteSetStartingTime(parseFloat(e.target.value))
                  }} /> */}
                    {(startingTime / COEFFICIENT).toFixed(1)}
                    分

                  </span>
                  <Button type={locking ? 'danger' : 'primary'} onClick={toggleLocking} size="small">
                    {
                      locking ? '重置' : '确定'
                    }
                  </Button>
                </div>

                {/* TODO: 计算显示时间 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>结束时间：
                    {/* <Input  size="small" style={{ width: 80 }} value={(endingTime/ COEFFICIENT).toFixed(1) } onChange={e => {
                    remoteSetEndingTime(parseFloat(e.target.value))
                  }} /> */}
                    {(endingTime / COEFFICIENT).toFixed(1)}
                    分
                  </span>
                  {
                    locking && (
                      <Button type={customizable ? 'danger' : 'primary'} onClick={toggleCustomiz} size="small">
                        {
                          customizable ? '取消' : '选择'
                        }
                      </Button>
                    )
                  }
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>时长：{totalTime}分</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <Button block disabled={!locking} type="primary" loading={pdfBase64Loading} onClick={handlePreview} style={{ marginRight: 10 }}>
                    生成
                  </Button>
                  <Button block disabled={!pdfBase64} type="primary" loading={qrCodeBase64Loading} onClick={signHandler} style={{ marginRight: 10 }}>
                    签名
                  </Button>
                  <Button block disabled={!pdfBase64} type="primary" onClick={onDownload}>
                    打印
                  </Button>
                </div>
              </div>

              <Modal visible={modalVisible} footer={null} centered onCancel={() => setModalVisible(false)} bodyStyle={{ textAlign: 'center' }}>
                <img alt="qrcode" src={qrCodeBase64} />
              </Modal>
            </div>
          )
        }
      }
    </Context.Consumer >
  );
}

export default Preview