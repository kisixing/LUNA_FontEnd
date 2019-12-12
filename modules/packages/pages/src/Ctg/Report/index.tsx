import React, { useMemo, useRef, useLayoutEffect, useState } from 'react';
import Ctg from './Ctg';
import Preview from './Preview';

export const Context = React.createContext({})

export interface IProps {
    age: number
    docid: string
    fetalcount: number
    inpatientNO: string
    name: string
    startdate: string
    print_interval: number
    onDownload: () => void
    gestationalWeek?: any
}

const PrintPreview = (props: IProps) => {
    const { docid } = props;
    const [wh, setWh] = useState({ w: 0, h: 0 })
    useLayoutEffect(() => {
        const { clientHeight, clientWidth } = inputEl.current;
        setWh({ h: clientHeight, w: clientWidth })
    }, [])

    const inputEl = useRef(null);

    // const onDownload = () => {

    //     const filePath = `${request.configure.apiPrefix}/ctg-exams-pdfurl/${docid}`
    //     window.open(filePath)
    // }

    const v = useMemo(() => { return {} }, []);
    return (
        <Context.Provider value={v}>
            <div style={{ height: '100%' }} ref={inputEl}>
                <div style={{ height: 240, textAlign: 'center' }}>
                    <Preview wh={wh} {...props} />
                </div>
                <div style={{
                    height:`calc(100% - 250px)`,
                    padding: 24,
                    marginTop: 12,
                    border: '1px solid #d9d9d9',
                    background: '#fff'
                }}>
                    <Ctg docid={docid} />
                </div>
            </div>

        </Context.Provider>
    );
}

export default PrintPreview;
