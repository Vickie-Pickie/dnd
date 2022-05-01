import createStore from './store';
import initColumn from './column';

const store = createStore();
const columns = document.querySelectorAll('.cards_column');
for (let i = 0; i < columns.length; i += 1) {
  const column = columns[i];
  initColumn(column, store);
}
