const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const INDEX_HTML = path.join(__dirname, '..', 'src', 'index.html');

test('app shell contains required mount points and scripts for initialization', () => {
  const html = fs.readFileSync(INDEX_HTML, 'utf8');

  assert.match(html, /id="main"/);
  assert.match(html, /id="langGroup"/);
  assert.match(html, /id="modeLearn"/);
  assert.match(html, /id="modeQuiz"/);
  assert.match(html, /id="parentOnlyBtn"/);
  assert.match(html, /id="ttsToggleBtn"/);
  assert.match(html, /id="openVerbsBtn"/);
  assert.match(html, /class="level-row"/);
  assert.match(html, /id="levelFilters"/);
  assert.match(html, /id="parentOnlyBtn"/);
  assert.match(html, /id="modeGroup"/);
  assert.match(html, /id="verbsModalRoot"/);
  assert.match(html, /src="\.\/data\/verbs\.js"/);
  assert.match(html, /src="\.\/data\/verb-schema\.js"/);
  assert.match(html, /src="\.\/quiz-logic\.js"/);
  assert.match(html, /src="\.\/verbs-list\.js"/);
  assert.match(html, /src="\.\/index\.js"/);
});
