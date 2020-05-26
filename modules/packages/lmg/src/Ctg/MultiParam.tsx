import React, { useState, useEffect } from 'react';
import { ICacheItem } from "../services/types";
import { MultiParamL } from "./MultiParamL";
const border = '1px dashed #ccc'


export const MultiParam = (props: { data: ICacheItem, isFullScreen: boolean, height: number }) => {

    const {
        data,
        isFullScreen,
        height
    } = props

    if (!data || !data.realTime) return null
    const [ecgData, setEcgData] = useState(data && data.ecgdata)

    const [p, setP] = useState(0)

    useEffect(() => {
        setEcgData(data.ecgdata)
        _setP()
        const id = setInterval(() => {
            _setP()
            setEcgData(data.ecgdata)
        }, 1000)
        return () => {
            clearInterval(id)
        }
    }, [data])

    function _setP() {
        let pv = data ? data.ple.B[0] : 0
        pv = !!pv ? (pv === 50 ? 0 : pv) : 0
        setP(pv)
    }
    const keys = ['脉率bpm', '血氧%', '体温℃', '心率bpm', '呼吸(次/分)', '血压(SDM)mmHg'];


    return (

        !!(ecgData && ecgData.length) && (
            <div style={{ width: isFullScreen ? 280 : '100%', borderRight: isFullScreen && border }}>
                {
                    isFullScreen ?
                        (
                            <MultiParamL ecgData={ecgData} p={data.ple} bloodList={data.bloodList } />
                        ) : (
                            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontSize: 10 }}>

                                {
                                    keys.map((_, i) => {
                                        return (
                                            <span>{_}{ecgData[i]}</span>
                                        )
                                    })
                                }
                            </div>
                        )
                }
            </div>
        )
    );
};


