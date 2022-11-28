type ParamPairs = Record<string, string | number | boolean>;

interface URLBuilder {
  addQueryParam: (param: string, value: string | number | boolean) => URLBuilder;
  toString: () => string;
}

export const createURL = (base: string, path: string): URLBuilder => {
  const params: ParamPairs = {};

  const builder: URLBuilder = {
    addQueryParam: (param, value) => {
      params[param] = value;
      return builder;
    },
    toString: () => {
      const urlString = base + path;
      const paramsString = Object.entries(params).map(([param, value]) => `${param}=${value}`).join('&');
      return urlString + (paramsString ? `?${paramsString}` : '');
    }
  };

  return builder;
};
