import test from 'node:test';
import assert from 'node:assert/strict';
import { locales, matchLocale, preferredLocale } from '../scripts/locales.mjs';

test('browser locales map to all ten requested translations', () => {
  const cases = { 'en-US': 'en', 'en-GB': 'en', 'fr-CA': 'fr', 'pt-BR': 'pt-br', 'pt-PT': 'pt-br', 'es-MX': 'es', 'de-DE': 'de', 'it-IT': 'it', 'zh-CN': 'zh', 'zh-TW': 'zh', 'zh-Hans': 'zh', 'ko-KR': 'ko', 'ja-JP': 'ja', 'vi-VN': 'vi' };
  for (const [input, expected] of Object.entries(cases)) assert.equal(matchLocale(input), expected, input);
  assert.equal(locales.length, 10);
});
test('explicit choice takes priority and invalid stored values cannot form URLs', () => {
  assert.equal(preferredLocale('ja', ['en-US']), 'ja');
  assert.equal(preferredLocale('//untrusted.invalid', ['fr-FR']), 'fr');
  assert.equal(preferredLocale('../en', ['pt-BR']), 'pt-br');
  assert.equal(preferredLocale('constructor', ['ko-KR']), 'ko');
});
test('browser preference order is respected with English fallback', () => {
  assert.equal(preferredLocale(null, ['pl-PL', 'de-DE', 'fr-FR']), 'de');
  assert.equal(preferredLocale(null, ['en-AU', 'fr-FR']), 'en');
  assert.equal(preferredLocale(null, ['ar', 'nl']), 'en');
  assert.equal(preferredLocale(null, []), 'en');
});
