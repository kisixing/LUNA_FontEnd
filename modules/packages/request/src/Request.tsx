import { message } from 'antd';
import { extend, RequestMethod } from 'umi-request';
import { Iconfig, RequestOptions } from './types';
import getErrData from './getErrData';
import { notification } from 'antd';
import store from 'store'
type RequestType = (url: string, options?: RequestOptions) => Promise<any>;

const intervalSet: Set<string> = new Set();
export default class Request {
  public _request: RequestMethod = null;
  constructor() {
    this.init();
  }
  public init = (configs: Iconfig = {}) => {
    const { errHandler, ...others } = configs;
    

    this._request = extend({
      timeout: 5000,
      credentials: 'include', // 默认请求是否带上cookie
      headers: {
        Accept: 'application/json',
      },
      errorHandler: err => {
        const errorData = getErrData(err.response);
        if (errorData ) {
          errHandler && errHandler(errorData);
        } else {
          notification.error({
            message: '服务未响应',
          });
        }

        return Promise.reject(errorData);
      },
      ...others,
    });
    this.intercept();
  };
  public intercept() {
    ['get', 'post', 'put', 'delete'].forEach(_ => {
      this[_] = ((url, options = {}) => {
        const { loading, interval,cacheWhenFailed } = options;
        const key = _ + ':' + url;

        if (typeof interval === 'number') {
          if (intervalSet.has(key)) {
            return Promise.reject('interval !');
          }
          intervalSet.add(key);
          setTimeout(() => {
            intervalSet.delete(key);
          }, interval);
        }
        const promise: Promise<any> = this._request[_](url, options);
        if (loading !== undefined) {
          const hide = message.loading(loading, 0);
          return promise.finally(() => {
            hide();
          });
        }
        if (cacheWhenFailed ) {
          console.log('cacheWhenFailed')
        
          return promise.then(value => {
            store.set(key,value)
            return value
          }).catch(err => {
            return store.get(key)
          });
        }
        return promise;
      }) as RequestType;
    });
  }
  post: RequestType;
  get: RequestType;
  put: RequestType;
  delete: RequestType;
}
