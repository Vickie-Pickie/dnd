const defaultState = {
  todo: [
    {
      content: 'Задачу сделать',
    },
    {
      content: 'Welcome to Trello!',
    },
    {
      content: 'Починить кран',
    },
  ],
  in_progress: [
    {
      content: 'Накачать пресс',
    },
    {
      content: 'Выучить JS',
    },
  ],
  completed: [
    {
      content: 'Купил хлеб',
    },
  ],
};

export default function createStore() {
  let state = null;
  const storageState = localStorage.getItem('state');
  if (!storageState) {
    state = defaultState;
  } else {
    state = JSON.parse(storageState);
  }

  return {
    getColumnCards(columnName) {
      return state[columnName];
    },

    saveState() {
      localStorage.setItem('state', JSON.stringify(state));
    },

    moveCard(columnName, index, card) {
      state[columnName].splice(index, 0, card);
    },
  };
}
