import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { estimateSpending } from '../calculator.js';
import { taglish } from '../translations.js';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('sharing metadata uses the requested title and packaged homepage screenshot',()=>{
  const title='Smoke Less — Offline Cigarette Tracker for Android';
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes(`<meta property="og:title" content="${title}">`));
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
  const image=new URL(html.match(/property="og:image" content="([^"]+)"/)[1]);
  assert.equal(image.origin,'https://smokeless-cmndrpaul.pages.dev');
  const file=readFileSync(new URL(`..${image.pathname}`,import.meta.url));
  assert.equal(file.readUInt16BE(0),0xffd8);
  assert.ok(file.length<1000000);
});
test('calculator uses exact centavos and 7/30-day periods',()=>{
  assert.deepEqual(estimateSpending('5','8.50'),{weekly:297.5,monthly:1275});
  assert.deepEqual(estimateSpending('0','0'),{weekly:0,monthly:0});
  assert.deepEqual(estimateSpending('3','0.10'),{weekly:2.1,monthly:9});
  assert.deepEqual(estimateSpending('200','5000'),{weekly:7000000,monthly:30000000});
  for(const [sticks,price] of [['','8'],['-1','8'],['1.5','8'],['201','8'],['5','-1'],['5','1.234'],['5','5000.01'],['NaN','8'],['5','Infinity']]) assert.equal(estimateSpending(sticks,price),null);
});
test('all page copy has a Taglish translation',()=>{
  for(const [,key] of html.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(taglish[key],`Missing translation: ${key}`);
});
test('every preview combination is a real, nonempty asset',()=>{
  for(const screen of ['home','log','calendar','insights','craving','settings']) for(const language of ['en','tag']) for(const theme of ['light','dark']) {
    const url=new URL(`../assets/screenshots/${screen}-${language}-${theme}.webp`,import.meta.url);
    assert.ok(existsSync(url),String(url)); assert.ok(statSync(url).size>15000,`Unrendered screenshot: ${url}`);
    assert.equal(readFileSync(url).subarray(8,12).toString(),'WEBP');
  }
});
test('local links resolve and the only download destination is the supplied APK',()=>{
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  for(const [,hash] of html.matchAll(/href="#([^\"]+)"/g)) assert.ok(ids.has(hash),`Broken anchor: ${hash}`);
  assert.ok(html.includes('https://www.mediafire.com/file/2id0ji2y6kd9azn/Smoke-Less-1.0.1-universal.apk/file'));
  assert.ok(!/mailto:|feedback|testimonials/i.test(html));
  for(const [,path] of html.matchAll(/(?:src|href)="((?:assets\/|\.\/)[^"]+)"/g)) assert.ok(existsSync(new URL(`../${path}`,import.meta.url)),path);
});
