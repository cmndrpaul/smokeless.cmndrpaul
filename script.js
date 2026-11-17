import { estimateSpending } from './calculator.js';
import { taglish } from './translations.js';

const root = document.documentElement;
const strings = new Map([...document.querySelectorAll('[data-i18n]')].map(el => [el, el.textContent]));
const $ = selector => document.querySelector(selector);
const tabs = [...document.querySelectorAll('[role="tab"]')];
const screenshot = $('#app-screenshot');
let activeScreen = 'home';
let imageRequest = 0;
let theme = root.dataset.theme;
let language = root.dataset.language;
const names = {home:'Home',log:'Log',calendar:'Calendar',insights:'Insights',craving:'Craving',settings:'Settings'};
const captions = {home:'Your day, at a glance.',log:'Every stick has a story.',calendar:'See your patterns, day by day.',insights:'Get to know your habits.',craving:'Breathe. Give yourself a moment.',settings:'Your plan, on your terms.'};
const currency = new Intl.NumberFormat('en-PH', {style:'currency',currency:'PHP'});

function store(key, value) { try { localStorage.setItem(key,value); } catch { /* Preferences still work for this visit. */ } }
function t(key, fallback) { return language === 'tag' ? taglish[key] ?? fallback : fallback; }
function updateScreenshot(announce = true) {
  const request = ++imageRequest;
  const target = `assets/screenshots/${activeScreen}-${language}-${theme}.webp`;
  const label = t(`screen${names[activeScreen]}`, names[activeScreen]);
  const image = new Image();
  $('#phone-frame').setAttribute('aria-busy','true');
  image.onload = () => {
    if (request !== imageRequest) return;
    screenshot.src = target;
    screenshot.alt = language === 'tag' ? `Smoke Less ${label}, ${theme} mode, sample data` : `Smoke Less ${label} screen in ${theme} mode with sample data`;
    $('#screen-caption').textContent = t(`caption${names[activeScreen]}`,captions[activeScreen]);
    $('#phone-frame').setAttribute('aria-busy','false');
    if (announce) $('#preview-status').textContent = screenshot.alt;
  };
  image.onerror = () => {
    if (request !== imageRequest) return;
    $('#phone-frame').setAttribute('aria-busy','false');
    $('#preview-status').textContent = t('imageError','The screen preview could not load. Please try again.');
  };
  image.src = target;
}
function updateLabels() {
  $('#theme-toggle').setAttribute('aria-label',language === 'tag' ? `Lumipat sa ${theme === 'light' ? 'dark' : 'light'} mode` : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
  $('#theme-toggle').setAttribute('aria-pressed',String(theme === 'dark'));
  $('#language-toggle').setAttribute('aria-label',language === 'en' ? 'Switch to Taglish' : 'Switch to English');
  $('#language-target').textContent = language === 'en' ? 'TAG' : 'ENG';
  $('#menu-toggle').setAttribute('aria-label',language === 'tag' ? 'Buksan o isara ang menu' : 'Open or close menu');
  $('#navigation').setAttribute('aria-label',language === 'tag' ? 'Pangunahing navigation' : 'Main navigation');
  $('.screen-tabs').setAttribute('aria-label',language === 'tag' ? 'Mga screen ng app' : 'App screens');
  $('#app').setAttribute('aria-label',language === 'tag' ? 'Interactive na preview ng app' : 'Interactive app preview');
}
function updateLanguage() {
  root.lang = language === 'tag' ? 'fil' : 'en';
  root.dataset.language = language;
  for (const [el, english] of strings) el.textContent = t(el.dataset.i18n,english);
  document.title = language === 'tag' ? 'Smoke Less — Bawas nang kaunti. Mas may oras para sa’yo.' : 'Smoke Less — A little less. A little more you.';
  $('#release-date').textContent = new Intl.DateTimeFormat(language === 'tag' ? 'fil-PH' : 'en-PH',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date('2026-11-17T00:00:00Z'));
  updateLabels(); updateCalculator(); updateScreenshot(false);
}
function updateTheme() {
  root.dataset.theme = theme;
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#101b19' : '#f6f3ee';
  updateLabels(); updateScreenshot();
}
function updateCalculator() {
  const sticks = $('#sticks'); const price = $('#price');
  const result = estimateSpending(sticks.value.trim(),price.value.trim());
  $('#weekly').textContent = result ? currency.format(result.weekly) : '—';
  $('#monthly').textContent = result ? currency.format(result.monthly) : '—';
  const invalid = !result;
  sticks.setAttribute('aria-invalid',String(invalid && (!/^\d+$/.test(sticks.value) || Number(sticks.value) > 200)));
  price.setAttribute('aria-invalid',String(invalid && (!/^\d+(\.\d{1,2})?$/.test(price.value) || Number(price.value) > 5000)));
  $('#calculator-error').textContent = invalid ? t('calcError','Enter 0–200 whole sticks and a price of ₱0–5,000 (up to 2 decimals).') : '';
}
$('#theme-toggle').addEventListener('click',() => { theme = theme === 'light' ? 'dark' : 'light'; store('smokeless-theme',theme); updateTheme(); });
$('#language-toggle').addEventListener('click',() => { language = language === 'en' ? 'tag' : 'en'; store('smokeless-language',language); updateLanguage(); });
tabs.forEach((tab,index) => {
  function select() {
    activeScreen = tab.dataset.screen;
    $('#phone-frame').setAttribute('aria-labelledby',tab.id);
    tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected',String(selected)); item.tabIndex = selected ? 0 : -1; });
    updateScreenshot();
  }
  tab.addEventListener('click',select);
  tab.addEventListener('keydown',event => {
    const key = event.key;
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(key)) return;
    event.preventDefault();
    const next = key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : (index + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  });
});
$('#calculator').addEventListener('submit',event => event.preventDefault());
$('#sticks').addEventListener('input',updateCalculator); $('#price').addEventListener('input',updateCalculator);
const menu = $('#menu-toggle');
function closeMenu() { menu.setAttribute('aria-expanded','false'); $('#navigation').classList.remove('is-open'); }
menu.addEventListener('click',() => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); $('#navigation').classList.toggle('is-open',open); });
$('#navigation').addEventListener('click',event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown',event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.addEventListener('click',event => { if (!event.target.closest('.site-header')) closeMenu(); });
$('#copyright-year').textContent = String(new Date().getFullYear());
updateLanguage(); updateTheme();
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if (!motion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  root.classList.add('js-reveal');
  // Hash links and keyboard focus must never land on invisible content.
  document.addEventListener('focusin',event => event.target.closest('.reveal')?.classList.add('is-visible'));
}
