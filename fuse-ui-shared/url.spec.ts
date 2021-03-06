///<reference types="jasmine"/>

import { parseUrl, Scheme } from './url';

describe('url parsing', () => {
  it('parse url', () => {
    const url = parseUrl('https://www.foo.bar:998/root/sub/sub2/file.txt?color=red&size=3');
    expect(url.scheme).toBe(Scheme.https);
    expect(url.hostname).toBe('www.foo.bar');
    expect(url.port).toBe(998);
    expect(url.path).toBe('/root/sub/sub2/file.txt');
    expect(url.query).toEqual({ color: 'red', size: '3' });
    const formatted = url.format();
    const formattedUrl = parseUrl(formatted);
    expect(formatted.indexOf('https://www.foo.bar:998/root/sub/sub2/file.txt?')).toBe(0);
    expect(formattedUrl.query).toEqual({ color: 'red', size: '3' });
  })
})
