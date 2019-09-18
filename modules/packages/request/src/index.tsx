import { extend } from 'umi-request';
import { Iconfig, RequestOptions } from './types';
import { message, notification } from 'antd';
import getErrData from './getErrData';

class R {
  private _request = null;

  constructor() {
    this.config();
  }

  public config = (configs: Iconfig = {}) => {
    const { errHandler, Authorization = '', ...others } = configs;
    this._request = extend({
      timeout: 5000,
      credentials: 'include', // 默认请求是否带上cookie
      headers: {
        Accept: 'application/json',
      },
      errorHandler: err => {
        const errorData = getErrData(err.response);
        errHandler && errHandler(errorData);

        return Promise.reject(errorData);
      },
      ...others,
    });
    // request拦截器, 改变url 或 options.
    this._request.interceptors.request.use((url, options) => {
      // eslint-disable-next-line no-param-reassign
      options.headers = {
        ...options.headers,
        Authorization,
      };
      return { url, options };
    });

    this._request.interceptors.response.use((response: Response, options: RequestOptions) => {
      const { successText, hideErr } = options;
      const { status } = response;
      console.log('sta', status);

      // eslint-disable-next-line no-param-reassign
      if ([200, 304].includes(status)) {
        successText && message.success(successText);
      } else {
        if (status === 401) {
          notification.error({
            message: '未登录或登录已过期，请重新登录。',
          });
        }

        if (!hideErr) {
          const errorData = getErrData(response);
          const { status, errortext, url } = errorData;
          notification.error({
            message: `请求错误 ${status}: ${url}`,
            description: errortext,
          });
        }
      }

      return response;
    });
    return this._request;
  };
  public post = (url: string, options: RequestOptions) => {
    return this._request.post(url, options);
  };
  public get = (url: string) => {
    return this._request.get(url);
  };
}

const r = new R();
const { get, post, config } = r;
export { get, post, config };
export default r;
