function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getQuizLogic() {
  if (window.QuizLogic) return window.QuizLogic;
  return {
    makeSmartOptions: () => [],
  };
}

function addFeedback(button, resultText, isCorrect) {
  if (button.getAttribute('data-feedback') === 'true') return;
  const marker = isCorrect ? '✓' : '✗';
  const suffix = createElement('span', 'feedback-text', ` ${marker} ${resultText}`);
  button.appendChild(suffix);
  button.setAttribute('aria-label', `${button.textContent.trim()} ${resultText}`);
  button.setAttribute('data-feedback', 'true');
}

function createOptions(values, onPick) {
  const wrap = createElement('div', 'quiz-options');
  values.forEach((value) => {
    const button = createElement('button', 'opt', value);
    button.type = 'button';
    button.onclick = () => onPick(value, button);
    wrap.appendChild(button);
  });
  return wrap;
}

function createStep(labelText, optionsNode) {
  const step = createElement('section', 'quiz-step');
  step.appendChild(createElement('div', 'step-label', labelText));
  step.appendChild(optionsNode);
  return step;
}

export function makeSmartOptions(items, key, correctItem, count, shuffleFn) {
  return getQuizLogic().makeSmartOptions(items, key, correctItem, count, shuffleFn);
}

export function renderQuiz(main, params) {
  const {
    item,
    translation,
    quizState,
    labels,
    fallback,
    feedbackLabels,
    onPickDe,
    onPickPret,
    onPickP2,
    onNextItem,
    getOptions,
  } = params;

  const card = createElement('section', 'card');
  const quizLayout = createElement('div', 'quiz-layout');
  card.appendChild(quizLayout);

  const prompt = createElement('div', 'invert value-lg full-width quiz-prompt', translation || fallback);
  prompt.setAttribute('aria-live', 'polite');
  quizLayout.appendChild(prompt);

  const answerDe = createElement('div', 'quiz-answer');
  if (quizState.de) {
    const selected = createElement('div', 'value-lg answer-value');
    selected.appendChild(createElement('strong', '', quizState.de));
    answerDe.appendChild(selected);
  } else {
    const options = createOptions(getOptions('de', item), (value, button) => {
      if (value === item.de) {
        button.classList.add('opt-right');
        addFeedback(button, feedbackLabels.correct, true);
        onPickDe(value);
      } else {
        button.classList.add('opt-wrong');
        addFeedback(button, feedbackLabels.wrong, false);
      }
    });
    answerDe.appendChild(createStep(labels.quiz.inf, options));
  }
  quizLayout.appendChild(answerDe);

  const answerPret = createElement('div', 'quiz-answer');
  if (quizState.de) {
    if (quizState.pret) {
      const selected = createElement('div', 'value-lg answer-value');
      selected.appendChild(createElement('strong', '', quizState.pret));
      answerPret.appendChild(selected);
    } else if (item.pret) {
      const options = createOptions(getOptions('pret', item).filter(Boolean), (value, button) => {
        if (value === item.pret) {
          button.classList.add('opt-right');
          addFeedback(button, feedbackLabels.correct, true);
          onPickPret(value);
        } else {
          button.classList.add('opt-wrong');
          addFeedback(button, feedbackLabels.wrong, false);
        }
      });
      answerPret.appendChild(createStep(labels.quiz.pret, options));
    }
  }
  quizLayout.appendChild(answerPret);

  const answerPart2 = createElement('div', 'quiz-answer');
  if (quizState.de && quizState.pret) {
    if (quizState.p2) {
      const selected = createElement('div', 'value-lg answer-value');
      selected.appendChild(createElement('span', 'aux', item.aux ? `${item.aux} ` : ''));
      selected.appendChild(createElement('strong', '', quizState.p2));
      answerPart2.appendChild(selected);
    } else if (item.part2) {
      const options = createOptions(getOptions('part2', item).filter(Boolean), (value, button) => {
        if (value === item.part2) {
          button.classList.add('opt-right');
          addFeedback(button, feedbackLabels.correct, true);
          onPickP2(value);
        } else {
          button.classList.add('opt-wrong');
          addFeedback(button, feedbackLabels.wrong, false);
        }
      });
      answerPart2.appendChild(createStep(labels.quiz.part2, options));
    }
  }
  quizLayout.appendChild(answerPart2);

  const actions = createElement('div', 'actions actions-right');
  const nextButton = createElement('button', 'btn btn-green', labels.next);
  nextButton.id = 'nextQ';
  nextButton.type = 'button';
  nextButton.onclick = onNextItem;
  actions.appendChild(nextButton);
  quizLayout.appendChild(actions);

  main.replaceChildren(card);
}
