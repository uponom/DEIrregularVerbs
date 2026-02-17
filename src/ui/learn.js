export function renderLearn(main, item, translation, onNext) {
  const root = document.createElement('div');
  root.className = 'card';
  root.innerHTML = `
    <div class="flash">
      <div class="line" style="justify-content: space-between;">
        <div class="label colhdr" style="text-align:left;">Infinitiv/Präsens</div>
        <div class="label colhdr" style="text-align:center;">Präteritum</div>
        <div class="label colhdr" style="text-align:right;">Partizip II</div>
      </div>
      <div class="line left">
        <div class="value-lg"><strong>${item.de ?? ''}</strong> ${item.pras ? `<span class="form3">(${item.pras})</span>` : ''}</div>
      </div>
      <div class="line center"><div class="value-lg"><strong>${item.pret ?? ''}</strong></div></div>
      <div class="line right"><div class="value-lg"><span class="aux">${item.aux || ''}</span><strong>${item.part2 ?? ''}</strong></div></div>
      <div class="line"><div class="invert value-lg" style="width:100%">${translation ?? ''}</div></div>
    </div>
    <div class="row" style="margin-top:12px; justify-content: flex-end;">
      <button id="nextBtn" class="btn btn-green">Дальше →</button>
    </div>`;

  main.replaceChildren(root);
  document.getElementById('nextBtn').onclick = onNext;
}
