const STRINGS = {
  RU: {
    appLang: 'ru',
    ttsLabel: 'Озвучка (de-DE)',
    modeLearn: 'Обучение',
    modeQuiz: 'Проверка',
    next: 'Дальше →',
    headers: {
      infPras: 'Infinitiv/Präsens',
      pret: 'Präteritum',
      part2: 'Partizip II',
    },
    quiz: {
      inf: 'Infinitiv',
      pret: 'Präteritum',
      part2: 'Partizip II',
    },
    ttsInfo: {
      version: 'Версия',
      engine: 'Движок',
      enabled: 'Включено',
      voice: 'Голос',
      speed: 'Скорость',
      pitch: 'Тембр',
      yes: 'да',
      no: 'нет',
    },
    feedback: {
      correct: 'Верно',
      wrong: 'Неверно',
    },
    empty: {
      title: 'Нет доступных глаголов',
      body: 'Проверьте данные словаря и перезапустите приложение.',
    },
    fallback: '—',
  },
  UA: {
    appLang: 'uk',
    ttsLabel: 'Озвучення (de-DE)',
    modeLearn: 'Навчання',
    modeQuiz: 'Перевірка',
    next: 'Далі →',
    headers: {
      infPras: 'Infinitiv/Präsens',
      pret: 'Präteritum',
      part2: 'Partizip II',
    },
    quiz: {
      inf: 'Infinitiv',
      pret: 'Präteritum',
      part2: 'Partizip II',
    },
    ttsInfo: {
      version: 'Версія',
      engine: 'Двигун',
      enabled: 'Увімкнено',
      voice: 'Голос',
      speed: 'Швидкість',
      pitch: 'Тембр',
      yes: 'так',
      no: 'ні',
    },
    feedback: {
      correct: 'Правильно',
      wrong: 'Неправильно',
    },
    empty: {
      title: 'Немає доступних дієслів',
      body: 'Перевірте дані словника та перезапустіть застосунок.',
    },
    fallback: '—',
  },
  EN: {
    appLang: 'en',
    ttsLabel: 'Speech (de-DE)',
    modeLearn: 'Learn',
    modeQuiz: 'Quiz',
    next: 'Next →',
    headers: {
      infPras: 'Infinitive/Present',
      pret: 'Preterite',
      part2: 'Participle II',
    },
    quiz: {
      inf: 'Infinitive',
      pret: 'Preterite',
      part2: 'Participle II',
    },
    ttsInfo: {
      version: 'Version',
      engine: 'Engine',
      enabled: 'Enabled',
      voice: 'Voice',
      speed: 'Rate',
      pitch: 'Pitch',
      yes: 'yes',
      no: 'no',
    },
    feedback: {
      correct: 'Correct',
      wrong: 'Wrong',
    },
    empty: {
      title: 'No verbs available',
      body: 'Check the dictionary data and restart the app.',
    },
    fallback: '—',
  },
};

export function getStrings(uiLang) {
  return STRINGS[uiLang] || STRINGS.RU;
}

export { STRINGS };
