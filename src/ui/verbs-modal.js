function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function buildVerbRow(verb, fallback) {
  const row = createElement('article', 'verbs-row');
  const head = createElement('div', 'verbs-row-head');
  head.appendChild(createElement('strong', 'verbs-row-inf', verb.de || fallback));
  head.appendChild(createElement('span', 'verbs-row-level', verb.level || fallback));
  row.appendChild(head);

  const forms = createElement('div', 'verbs-row-forms');
  if (verb.pras) {
    forms.appendChild(createElement('span', 'verbs-row-pras', `(${verb.pras})`));
  }
  forms.appendChild(createElement('strong', 'verbs-row-pret', verb.pret || fallback));
  forms.appendChild(createElement('span', 'verbs-row-sep', '/'));
  const part = createElement('span', 'verbs-row-part');
  if (verb.aux) {
    part.appendChild(createElement('span', 'verbs-row-aux', `${verb.aux} `));
  }
  part.appendChild(createElement('strong', 'verbs-row-part2', verb.part2 || fallback));
  forms.appendChild(part);
  row.appendChild(forms);

  row.appendChild(createElement('div', 'verbs-row-translation', verb.translation || fallback));
  return row;
}

export function renderVerbsModal(root, params) {
  const {
    open,
    labels,
    levels,
    selectedLevels,
    sortMode,
    verbs,
    onClose,
    onSortToggle,
    onLevelToggle,
  } = params;

  root.replaceChildren();
  if (!open) return;

  const backdrop = createElement('div', 'modal-backdrop');
  backdrop.onclick = (event) => {
    if (event.target === backdrop) onClose();
  };

  const dialog = createElement('section', 'modal-dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', labels.verbsModal.title);
  backdrop.appendChild(dialog);

  const header = createElement('div', 'modal-header');
  header.appendChild(createElement('h2', 'modal-title', labels.verbsModal.title));

  const actions = createElement('div', 'modal-actions');
  const sortButton = createElement('button', 'btn icon-btn', sortMode === 'infinitive' ? '🔤' : '💬');
  sortButton.type = 'button';
  sortButton.title = sortMode === 'infinitive' ? labels.controls.sortInfAria : labels.controls.sortTrAria;
  sortButton.setAttribute('aria-label', sortButton.title);
  sortButton.onclick = onSortToggle;
  actions.appendChild(sortButton);

  const closeButton = createElement('button', 'btn icon-btn', '✖️');
  closeButton.type = 'button';
  closeButton.title = labels.controls.closeListAria;
  closeButton.setAttribute('aria-label', labels.controls.closeListAria);
  closeButton.onclick = onClose;
  actions.appendChild(closeButton);
  header.appendChild(actions);
  dialog.appendChild(header);

  const filters = createElement('div', 'modal-filters');
  const selectedSet = new Set(
    Array.isArray(selectedLevels) ? selectedLevels : levels
  );
  levels.forEach((level) => {
    const button = createElement('button', `btn ${selectedSet.has(level) ? 'active' : ''}`, level);
    button.type = 'button';
    button.onclick = () => onLevelToggle(level);
    filters.appendChild(button);
  });
  dialog.appendChild(filters);

  const content = createElement('div', 'modal-content');
  if (!verbs.length) {
    content.appendChild(createElement('p', 'modal-empty', labels.verbsModal.empty));
  } else {
    verbs.forEach((verb) => content.appendChild(buildVerbRow(verb, labels.fallback)));
  }
  dialog.appendChild(content);

  root.appendChild(backdrop);
}
