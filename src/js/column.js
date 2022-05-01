export default function initColumn(columnEl, store) {
  const addButtonEl = columnEl.querySelector('.cards_button');
  const formEl = columnEl.querySelector('.cards_item__add_menu');
  const textarea = columnEl.querySelector('.textarea');
  const cardListEl = columnEl.querySelector('.cards_list');

  const cards = store.getColumnCards(columnEl.id);

  const createCardItem = (itemObj) => {
    const item = document.createElement('div');
    item.classList.add('cards_item');

    const itemBlock = document.createElement('div');
    itemBlock.classList.add('cards_item__block');

    const contentEl = document.createElement('div');
    contentEl.textContent = itemObj.content;
    contentEl.classList.add('cards_item__content');

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '&#x2715;';
    deleteButton.classList.add('cards_item__delete');

    itemBlock.append(contentEl, deleteButton);
    item.append(itemBlock);

    deleteButton.addEventListener('click', () => {
      item.remove();
      const index = cards.indexOf(itemObj);
      cards.splice(index, 1);
      store.saveState();
    });

    item.ondragstart = function () {
      return false;
    };

    const onMousedownHandler = (e) => {
      const shiftX = e.clientX - item.getBoundingClientRect().left;
      const shiftY = e.clientY - item.getBoundingClientRect().top;
      let itemClone = null;
      let placeholder = null;

      // переносит мяч на координаты (pageX, pageY),
      // дополнительно учитывая изначальный сдвиг относительно указателя мыши
      const moveAt = (pageX, pageY) => {
        itemClone.style.left = `${pageX - shiftX}px`;
        itemClone.style.top = `${pageY - shiftY}px`;
      };

      const onMouseMove = (ev) => {
        if (!itemClone) {
          itemClone = item.cloneNode(true);
          itemClone.style.width = `${item.offsetWidth}px`;
          itemClone.style.position = 'absolute';
          itemClone.style.zIndex = 1000;
          itemClone.style.cursor = 'grab';
          document.body.append(itemClone);

          placeholder = document.createElement('div');
          placeholder.classList.add('placeholder');
          placeholder.style.height = `${itemBlock.offsetHeight}px`;
          item.hidden = true;
        }

        moveAt(ev.pageX, ev.pageY);
        itemClone.hidden = true;
        const elemBelow = document.elementFromPoint(ev.clientX, ev.clientY);
        itemClone.hidden = false;

        if (!elemBelow) return;

        const cardBelow = elemBelow.closest('.cards_item');

        if (cardBelow) {
          const rect = cardBelow.getBoundingClientRect();
          const middle = rect.top + rect.height / 2;
          if (ev.clientY < middle) {
            cardBelow.parentElement.insertBefore(placeholder, cardBelow);
          } else {
            cardBelow.parentElement.insertBefore(placeholder, cardBelow.nextElementSibling);
          }
          return;
        }

        const cardsList = elemBelow.closest('.cards_list');
        if (cardsList) {
          const cardTitle = cardsList.querySelector('.cards_title');
          cardsList.insertBefore(placeholder, cardTitle.nextElementSibling);
        }
      };

      const onMouseUpHandler = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUpHandler);
        itemClone.remove();
        itemClone = null;
        item.hidden = false;
        if (placeholder) {
          placeholder.parentElement.insertBefore(item, placeholder);
          const columnID = placeholder.closest('.cards_column').id;
          placeholder.remove();
          placeholder = null;
          const index = cards.indexOf(itemObj);
          cards.splice(index, 1);
          const columnCards = Array.from(item.parentElement.querySelectorAll('.cards_item'));
          const newInd = columnCards.indexOf(item);
          store.moveCard(columnID, newInd, itemObj);
          store.saveState();
        }
      };

      // передвигаем мяч при событии mousemove
      document.addEventListener('mousemove', onMouseMove);

      // отпустить мяч, удалить ненужные обработчики
      document.addEventListener('mouseup', onMouseUpHandler);
    };

    item.addEventListener('mousedown', onMousedownHandler);

    return item;
  };

  const addCardHandler = (e) => {
    e.preventDefault();
    formEl.classList.remove('hidden');
    addButtonEl.classList.add('hidden');
  };

  const onCancelHandler = () => {
    formEl.classList.add('hidden');
    addButtonEl.classList.remove('hidden');
  };

  const onAddHandler = () => {
    if (!textarea.value) {
      return;
    }
    const cardItem = {
      content: textarea.value,
    };

    const newCard = createCardItem(cardItem);
    cardListEl.insertBefore(newCard, formEl);
    cards.push(cardItem);
    store.saveState();
    textarea.value = '';
    formEl.classList.add('hidden');
    addButtonEl.classList.remove('hidden');
  };

  cards.forEach((item) => {
    const newCard = createCardItem(item);
    cardListEl.insertBefore(newCard, formEl);
  });

  addButtonEl.addEventListener('click', addCardHandler);
  formEl.querySelector('.add_menu_button__close').addEventListener('click', onCancelHandler);
  formEl.querySelector('.add_menu_button').addEventListener('click', (e) => onAddHandler(e));
}
