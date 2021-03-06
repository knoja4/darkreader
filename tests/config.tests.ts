import {readFile} from 'fs';
import {resolve as resolvePath} from 'path';
import {compareURLPatterns} from '../src/utils/url';
import {parseArray, formatArray} from '../src/utils/text';
import {parseInversionFixes, formatInversionFixes} from '../src/generators/css-filter';
import {parseStaticThemes, formatStaticThemes} from '../src/generators/static-theme';

function readConfig(fileName) {
    return new Promise<string>((resolve, reject) => {
        readFile(resolvePath(__dirname, '../src/config/', fileName), {encoding: 'utf-8'}, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

function isURLPatternValid(url: string) {
    return url.length > 0 && url.indexOf('://') < 0;
}

test('Dark Sites list', async () => {
    const file = await readConfig('dark-sites.config');
    const sites = parseArray(file);

    // is not empty
    expect(sites.length).toBeGreaterThan(0);

    // url patterns should have no protocol
    expect(sites.every(isURLPatternValid)).toBe(true);

    // sites are sorted alphabetically
    expect(sites).toEqual(sites.slice().sort(compareURLPatterns));

    // sites are properly formatted
    expect(file).toEqual(formatArray(sites));
});

test('Inversion Fixes config', async () => {
    const file = await readConfig('inversion-fixes.config');
    const fixes = parseInversionFixes(file);

    // there is a common fix
    expect(fixes[0].url[0]).toEqual('*');

    // each fix has valid URL
    expect(fixes.every(({url}) => url.every(isURLPatternValid))).toBe(true);

    // fixes are sorted alphabetically
    expect(fixes.map(({url}) => url[0])).toEqual(fixes.map(({url}) => url[0]).sort(compareURLPatterns));

    // selectors should have no comma
    expect(fixes.every(({invert, noinvert, removebg}) => (invert || []).concat(noinvert || []).concat(removebg || []).every((s) => s.indexOf(',') < 0))).toBe(true);

    // fixes are properly formatted
    expect(file).toEqual(formatInversionFixes(fixes));
});

test('Static Themes config', async () => {
    const file = await readConfig('static-themes.config');
    const themes = parseStaticThemes(file);

    // there is a common theme
    expect(themes[0].url[0]).toEqual('*');

    // each theme has valid URL
    expect(themes.every(({url}) => url.every(isURLPatternValid))).toBe(true);

    // themes are sorted alphabetically
    expect(themes.map(({url}) => url[0])).toEqual(themes.map(({url}) => url[0]).sort(compareURLPatterns));

    // selectors should have no comma
    expect(themes.every((t) => Object.keys(t)
        .filter((prop) => ['url', 'noCommon'].indexOf(prop) < 0)
        .every((prop) => t[prop]
            .every((s) => s.indexOf(',') < 0)))).toBe(true);

    // fixes are properly formatted
    expect(file).toEqual(formatStaticThemes(themes));
});
