
export const relative = (from: string, to: string, noSeperator?: boolean) => {
  const res = normalize(to).slice(normalize(from).length);
  if (noSeperator) {
    if (res.startsWith('/')) {
      return res.slice(1);
    }
  }

  return res;
};

/*
'' '' == ''
'/' '/' == '/'
'/a' '/' == '/a'
'a' 'b' == '/a/b
* */
export const join = (...parts: string[]) => {
  return parts
    .map(p => normalize(p))
    .filter(p => p !== '')
    .reduce((acc, cur) => {
      if (cur.endsWith('/')) {
        acc = acc + cur.slice(0, -1);
        return acc;
      } else {
        return acc + cur;
      }
    }, '');
};
/*

'' == ''
' ' == ''
'/' == '/'
'/ ' == '/'
'a/' == '/a'
'a' == '/a'
'/a'
'/a/' == '/a'
* */
export const normalize = (val: string) => {
  if (typeof val !== 'string') return '';
  let res = val.trim();
  if (res.trim() === '') return '';
  if (res === '/') return res;
  if (!res.startsWith('/')) res = '/' + res;
  if (res.endsWith('/')) res = res.slice(0, -2);
  return res;
};

export const formatBytes = (bytes: number) => {
  let num = bytes;
  let unit = 'bytes';
  if (num > 1024) {
    num = num / 1024;
    unit = 'KB';
  }

  if (num > 1024) {
    num = num / 1024;
    unit = 'MB';
  }

  return {
    num,
    unit,
    str: `${num.toFixed(0)} ${unit}`,
  };
};

export const foldLongText = (str: string, maxLen = 15): string => {
  if (str.length <= maxLen) return str;

  const clipped = Math.floor(maxLen * 0.6);
  return str.slice(0, maxLen - clipped) + '...' + str.slice(-clipped);
};

export const format = (ts: number) => {
  const date = new Date(ts);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

export const pad = (val: number | string) => {
  return val.toString().padStart(2, '0');
};
