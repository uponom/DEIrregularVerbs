export function makeSmartOptions(items, key, correctItem, count = 5, shuffleFn) {
  const correct = correctItem[key];
  const allVals = Array.from(new Set(items.map((x) => x[key]).filter((v) => v && v !== correct)));
  const first = (correct || '').charAt(0).toLowerCase();
  const same = allVals.filter((v) => v.charAt(0).toLowerCase() === first);
  const rest = allVals.filter((v) => v.charAt(0).toLowerCase() !== first);
  const picks = [...shuffleFn(same).slice(0, count), ...shuffleFn(rest)].slice(0, count);
  return shuffleFn([correct, ...picks]);
}

function makeGap() {
  const gap = document.createElement('div');
  gap.className = 'gap-block';
  return gap;
}

function createOptions(values, onPick) {
  const wrap = document.createElement('div');
  wrap.className = 'options';

  values.forEach((value) => {
    const button = document.createElement('button');
    button.className = 'opt';
    button.textContent = value;
    button.onclick = () => onPick(value, button);
    wrap.appendChild(button);
  });

  return wrap;
}

export function renderQuiz(main, params) {
  const {
    item,
    translation,
    quizState,
    setQuizState,
    rerender,
    onNextItem,
    onSpeak,
    getOptions,
  } = params;

  const root = document.createElement('div');
  root.className = 'card';
  root.innerHTML = `
    <div class="grid" style="gap: 10px;">
      <div class="invert value-lg" style="width:100%; text-align:center;">${translation ?? ''}</div>
      <div id="ansDe"></div>
      <div id="ansPret"></div>
      <div id="ansP2"></div>
      <div class="row" style="margin-top:4px; justify-content: flex-end;">
        <button id="nextQ" class="btn btn-green">Дальше →</button>
      </div>
    </div>
  `;
  main.replaceChildren(root);

  const ansDe = document.getElementById('ansDe');
  if (quizState.de) {
    ansDe.innerHTML = `<div class="value-lg" style="text-align:center;"><strong>${quizState.de}</strong></div>`;
  } else {
    const label = document.createElement('div');
    label.className = 'step-label';
    label.textContent = 'Infinitiv';
    const options = createOptions(getOptions('de', item), (value, button) => {
      if (value === item.de) {
        button.classList.add('opt-right');
        setQuizState({ ...quizState, de: value });
        onSpeak([value]);
        setTimeout(rerender, 200);
      } else {
        button.classList.add('opt-wrong');
      }
    });
    ansDe.replaceChildren(makeGap(), label, options);
  }

  const ansPret = document.getElementById('ansPret');
  if (quizState.de) {
    if (quizState.pret) {
      ansPret.innerHTML = `<div class="value-lg" style="text-align:center;"><strong>${quizState.pret}</strong></div>`;
    } else {
      const label = document.createElement('div');
      label.className = 'step-label';
      label.textContent = 'Präteritum';
      const options = createOptions(getOptions('pret', item).filter(Boolean), (value, button) => {
        if (value === item.pret) {
          button.classList.add('opt-right');
          setQuizState({ ...quizState, pret: value });
          onSpeak([value]);
          setTimeout(rerender, 200);
        } else {
          button.classList.add('opt-wrong');
        }
      });
      ansPret.replaceChildren(makeGap(), label, options);
    }
  }

  const ansP2 = document.getElementById('ansP2');
  if (quizState.de && quizState.pret) {
    if (quizState.p2) {
      ansP2.innerHTML = `<div class="value-lg" style="text-align:center;"><span class="aux">${item.aux ? `${item.aux} ` : ''}</span><strong>${quizState.p2}</strong></div>`;
    } else {
      const label = document.createElement('div');
      label.className = 'step-label';
      label.textContent = 'Partizip II';
      const options = createOptions(getOptions('part2', item).filter(Boolean), (value, button) => {
        if (value === item.part2) {
          button.classList.add('opt-right');
          setQuizState({ ...quizState, p2: value });
          onSpeak([item.de, item.pret, item.part2]);
          setTimeout(rerender, 200);
        } else {
          button.classList.add('opt-wrong');
        }
      });
      ansP2.replaceChildren(makeGap(), label, options);
    }
  }

  document.getElementById('nextQ').onclick = onNextItem;
}
