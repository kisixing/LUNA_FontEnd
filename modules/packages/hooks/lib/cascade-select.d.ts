export interface OptionData {
    value: string;
    label: string;
}
export interface ListItem {
    name: string;
    options: ((...args: any) => OptionData[] | Promise<OptionData[]>);
}
export interface Select {
    props: {
        [key: string]: any;
    };
    options: OptionData[];
}
export interface UseCascadeSelectConfig {
    list: ListItem[];
    autoFirstSearch?: boolean;
    form: any;
}
export declare const useCascadeSelect: ({ list, autoFirstSearch, form, }: UseCascadeSelectConfig) => {
    search: (index: number, ...args: any) => void;
    selects: Select[];
};
