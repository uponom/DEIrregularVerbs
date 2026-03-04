function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function buildChildRow(child, fallback) {
  const row = createElement('tr', 'modal-child-row');
  row.appendChild(createElement('td', 'modal-child-inf', child.de || fallback));
  row.appendChild(createElement('td', 'modal-child-tr', child.translation || fallback));
  return row;
}

function buildVerbRow(verb, fallback, options) {
  const { modalParentOnly, isExpanded, childRows, labels, onVerbToggle } = options;
  const row = createElement('article', 'verbs-row');
  const canExpand = modalParentOnly && childRows.length > 0;
  if (canExpand) {
    row.classList.add('verbs-row-clickable');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-expanded', String(Boolean(isExpanded)));
    row.setAttribute('aria-label', labels.parentChildren.modalExpandAria);
    row.onclick = () => onVerbToggle(verb.id);
    row.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onVerbToggle(verb.id);
      }
    };
  }

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

  if (canExpand && isExpanded) {
    const wrap = createElement('div', 'modal-child-wrap');
    if (!childRows.length) {
      wrap.appendChild(createElement('p', 'modal-child-empty', labels.parentChildren.empty));
    } else {
      const table = createElement('table', 'modal-child-table');
      const body = createElement('tbody', '');
      childRows.forEach((child) => body.appendChild(buildChildRow(child, fallback)));
      table.appendChild(body);
      wrap.appendChild(table);
    }
    row.appendChild(wrap);
  }

  return row;
}

export function renderVerbsModal(root, params) {
  const {
    open,
    labels,
    levels,
    selectedLevels,
    modalParentOnly,
    expandedModalParentId,
    sortMode,
    verbs,
    onClose,
    onSortToggle,
    onLevelToggle,
    onModalParentOnlyToggle,
    getChildRows,
    onVerbToggle,
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
    button.setAttribute('aria-pressed', String(selectedSet.has(level)));
    button.onclick = () => onLevelToggle(level);
    filters.appendChild(button);
  });
  const parentButton = createElement('button', `btn icon-btn ${modalParentOnly ? 'active' : ''}`, '🌱');
  parentButton.type = 'button';
  parentButton.title = modalParentOnly ? labels.controls.modalParentOnlyOnAria : labels.controls.modalParentOnlyOffAria;
  parentButton.setAttribute('aria-label', parentButton.title);
  parentButton.setAttribute('aria-pressed', String(modalParentOnly));
  parentButton.onclick = onModalParentOnlyToggle;
  filters.appendChild(parentButton);
  dialog.appendChild(filters);

  const content = createElement('div', 'modal-content');
  if (!verbs.length) {
    content.appendChild(createElement('p', 'modal-empty', labels.verbsModal.empty));
  } else {
    verbs.forEach((verb) => {
      const childRows = getChildRows ? getChildRows(verb.id) : [];
      content.appendChild(buildVerbRow(verb, labels.fallback, {
        modalParentOnly,
        isExpanded: expandedModalParentId === verb.id,
        childRows,
        labels,
        onVerbToggle,
      }));
    });
  }
  dialog.appendChild(content);

  root.appendChild(backdrop);
}
