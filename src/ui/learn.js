function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function renderLearn(main, params) {
  const { item, translation, labels, fallback, onNext } = params;

  const card = createElement('section', 'card');
  const flash = createElement('div', 'flash-grid');
  card.appendChild(flash);

  const headerRow = createElement('div', 'forms-header');
  headerRow.appendChild(createElement('div', 'label colhdr', labels.headers.infPras));
  headerRow.appendChild(createElement('div', 'label colhdr forms-header-center', labels.headers.pret));
  headerRow.appendChild(createElement('div', 'label colhdr forms-header-right', labels.headers.part2));
  flash.appendChild(headerRow);

  const infLine = createElement('div', 'forms-line forms-line-left');
  const infValue = createElement('div', 'value-lg');
  const infStrong = createElement('strong', '', item.de || fallback);
  infValue.appendChild(infStrong);
  if (item.pras) {
    infValue.appendChild(document.createTextNode(' '));
    const present = createElement('span', 'form3', `(${item.pras})`);
    infValue.appendChild(present);
  }
  infLine.appendChild(infValue);
  flash.appendChild(infLine);

  const pretLine = createElement('div', 'forms-line forms-line-center');
  const pretValue = createElement('div', 'value-lg');
  pretValue.appendChild(createElement('strong', '', item.pret || fallback));
  pretLine.appendChild(pretValue);
  flash.appendChild(pretLine);

  const partLine = createElement('div', 'forms-line forms-line-right');
  const partValue = createElement('div', 'value-lg');
  partValue.appendChild(createElement('span', 'aux', `${item.aux || fallback} `));
  partValue.appendChild(createElement('strong', '', item.part2 || fallback));
  partLine.appendChild(partValue);
  flash.appendChild(partLine);

  const translationLine = createElement('div', 'forms-line');
  const translationValue = createElement('div', 'invert value-lg full-width');
  translationValue.textContent = translation || fallback;
  translationLine.appendChild(translationValue);
  flash.appendChild(translationLine);

  const actions = createElement('div', 'actions actions-right');
  const nextButton = createElement('button', 'btn btn-green', labels.next);
  nextButton.id = 'nextBtn';
  nextButton.type = 'button';
  nextButton.onclick = onNext;
  actions.appendChild(nextButton);
  card.appendChild(actions);

  main.replaceChildren(card);
}

export function renderEmptyState(main, labels) {
  const card = createElement('section', 'card empty-state');
  card.appendChild(createElement('h2', 'empty-title', labels.empty.title));
  card.appendChild(createElement('p', 'empty-body', labels.empty.body));
  main.replaceChildren(card);
}
