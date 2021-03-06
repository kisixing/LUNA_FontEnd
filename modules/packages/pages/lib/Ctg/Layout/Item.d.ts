import React from 'react';
import { BedStatus, ICacheItem, ICacheItemPregnancy } from "@lianmed/lmg/lib/services/types";
interface IProps {
    loading: boolean;
    onClose: (data: any) => void;
    itemData: any;
    children: React.ReactNode;
    startTime: string;
    pregnancy: ICacheItemPregnancy;
    data: ICacheItem;
    bedname: string;
    unitId: string;
    ismulti: boolean;
    docid: string;
    status: BedStatus;
    onSelect?: (unitId: string) => void;
    RenderMaskIn: any;
    outPadding: number;
    fullScreenId: string;
    itemHeight: number;
    itemSpan: number;
    themeColor: string;
    bordered?: boolean;
    borderedColor: string;
}
declare const _default: React.MemoExoticComponent<(props: IProps) => JSX.Element>;
export default _default;
