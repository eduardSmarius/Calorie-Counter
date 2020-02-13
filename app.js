const StorageCtrl = (function () {

    return {
        addToLS: function (item) {
            let items;
            if (localStorage.getItem('items') === null) {
                items = [];
                items.push(item);
                localStorage.setItem('items', JSON.stringify(items));
            } else {
                items = JSON.parse(localStorage.getItem('items'));
                items.push(item);
                localStorage.setItem('items', JSON.stringify(items));
            }
        },

        getFromLS: function () {
            let items;
            if (localStorage.getItem('items') === null) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem('items'));
                localStorage.setItem('items', JSON.stringify(items))
            }
            return items;
        },

        updateLS: function (updatedtItem) {
            let items = JSON.parse(localStorage.getItem('items'));
            items.forEach((item, index) => {
                if (item.id === updatedtItem.id) {
                    items.splice(index, 1, updatedtItem);
                }
            });
            localStorage.setItem('items', JSON.stringify(items));
        },

        deletefromLS: function (id) {
            let items = JSON.parse(localStorage.getItem('items'));
            items.forEach((item, index) => {
                if (id === item.id) {
                    items.splice(index, 1)
                }
            });

            localStorage.setItem('items', JSON.stringify(items));
        }
    }

})();

const ItemCtrl = (function () {
    const Item = function (id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    const data = {
        items: StorageCtrl.getFromLS(),
        currentItem: null,
        currentItemID: null,
        totalCalories: 0
    }

    const addData = function (name, calories) {
        let ID;
        if (data.items.length > 0) {
            ID = data.items.length;
        } else {
            ID = 0;
        }

        calories = parseInt(calories);
        let item = new Item(ID, name, calories);
        data.items.push(item);

        return item;
    }

    const addTCalories = function () {
        let total = 0;
        data.items.forEach(item => {
            total += item.calories;
        });
        data.totalCalories = total;

        return data.totalCalories;
    }

    const editItem = function (item, id) {
        let currentMeal;
        let currentCalories;
        data.currentItem = item;
        data.currentItemID = parseInt(item.id.split('-')[1]);
        data.items.forEach(it => {
            if (it.id === id) {
                currentMeal = it.name;
                currentCalories = it.calories;
            }
        });
        return {
            meal: currentMeal,
            calories: currentCalories
        }
    }

    const itemUpdate = function (meal, calories) {
        let currentItemID = parseInt(data.currentItem.id.split('-')[1]);
        data.items.forEach(item => {
            if (item.id === currentItemID) {
                item.name = meal;
                item.calories = parseInt(calories);
                data.currentItem = item;
                StorageCtrl.updateLS(item, data.items);
            }
        });


        return data.items;
    }

    const deleteItem = function () {
        data.items.splice(data.currentItemID, 1);

        StorageCtrl.deletefromLS(data.currentItemID)
    }

    return {
        logData: data,
        logItems: data.items,
        addToData: addData,
        addTotalCalories: addTCalories,
        defineCurrent: editItem,
        updateItem: itemUpdate,
        deleteItem: deleteItem
    }

})();


const UICtrl = (function () {

    const UISelectors = {
        collection: '.collection',
        addMeal: '.add-meal',
        updateMeal: '.update-meal',
        deleteMeal: '.delete-meal',
        back: '.back',
        addItem: '.add-item',
        addCalories: '.add-calories',
        totalCalories: '.total-nr',
        clearAll: '.btn-clear',
    }

    return {
        paintUI: function (items) {
            let html = '';

            items.forEach((item) => {
                html += `<li id="item-${item.id}"><span><strong>${item.name}: </strong><em>${item.calories} Calories</em></span><i class="edit fas fa-pen"></i></li>`
            });

            document.querySelector(UISelectors.collection).innerHTML = html;
        },

        hideBtns: function () {
            document.querySelector(UISelectors.updateMeal).style.display = 'none';
            document.querySelector(UISelectors.deleteMeal).style.display = 'none';
            document.querySelector(UISelectors.back).style.display = 'none';
        },

        showTotalCalories: function (cal) {
            document.querySelector(UISelectors.totalCalories).textContent = cal;
        },

        addLi: function (item) {
            document.querySelector(UISelectors.collection).insertAdjacentHTML('beforeend', `<li id="item-${item.id}"><span><strong>${item.name}: </strong><em>${item.calories} Calories</em></span><i class="edit fas fa-pen"></i></li>`)
        },

        getInput: function () {
            return {
                name: document.querySelector(UISelectors.addItem).value,
                calories: document.querySelector(UISelectors.addCalories).value
            }
        },

        clearInputs: function () {
            document.querySelector(UISelectors.addItem).value = '';
            document.querySelector(UISelectors.addCalories).value = '';
        },

        selectors: function () {
            return UISelectors;
        },

        uiEdit: function (meal, calories) {
            document.querySelector(UISelectors.addMeal).style.display = 'none';
            document.querySelector(UISelectors.updateMeal).style.display = 'inline';
            document.querySelector(UISelectors.deleteMeal).style.display = 'inline';
            document.querySelector(UISelectors.back).style.display = 'inline';


            document.querySelector(UISelectors.addItem).value = meal;
            document.querySelector(UISelectors.addCalories).value = calories;
        },

        updateUI: function (items) {
            const list = document.querySelector(UISelectors.collection);
            UICtrl.paintUI(items);
            UICtrl.clearInputs();
            let total = ItemCtrl.addTotalCalories();
            UICtrl.showTotalCalories(total);
            UICtrl.hideBtns();
            document.querySelector(UISelectors.addMeal).style.display = 'block';

        },

        deleteItem: function () {
            UICtrl.updateUI(ItemCtrl.logData.items);
            document.querySelector(UISelectors.addMeal).style.display = 'block';
        },

        back: function () {
            UICtrl.clearInputs();
            UICtrl.hideBtns();
        },

        showUI: function () {
            let items = ItemCtrl.logData.items;
            UICtrl.paintUI(items);
            let total = ItemCtrl.addTotalCalories();
            UICtrl.showTotalCalories(total);

            if (localStorage.getItem('items') === null) {
                document.querySelector(UISelectors.collection).style.display = 'none';
            } else {
                document.querySelector(UISelectors.collection).style.display = 'block';
            }

        }

    }
})();


const App = (function (ItemCtrl, StorageCtrl, UICtrl) {
    let UISelectors = UICtrl.selectors();

    let itemAdd = function () {
        let input = UICtrl.getInput();
        if (input.name !== '' && input.calories !== '') {
            document.querySelector(UISelectors.collection).style.display = 'block';
            const newItem = ItemCtrl.addToData(input.name, input.calories);
            UICtrl.addLi(newItem);
            UICtrl.clearInputs();

            const totalCalories = ItemCtrl.addTotalCalories();
            UICtrl.showTotalCalories(totalCalories);

            StorageCtrl.addToLS(newItem);
        }
    }

    let editItem = function (e) {
        let currentItem;
        let currentID;
        if (e.target.classList.contains('edit')) {
            currentItem = e.target.parentElement;
            currentID = parseInt(currentItem.id.split('-')[1]);

            let inputs = ItemCtrl.defineCurrent(currentItem, currentID);
            let meal = inputs.meal;
            let calories = inputs.calories;

            UICtrl.uiEdit(meal, calories);
        }

        e.preventDefault();
    }

    let updateItem = function () {
        let meal = document.querySelector(UISelectors.addItem).value
        let calories = document.querySelector(UISelectors.addCalories).value

        let items = ItemCtrl.updateItem(meal, calories);
        UICtrl.updateUI(items);
    }

    let deleteItem = function () {
        ItemCtrl.deleteItem();
        UICtrl.deleteItem();
    }

    let back = function () {
        UICtrl.back();
    }

    let clearAll = function () {
        document.querySelector(UISelectors.collection).innerHTML = '';
        localStorage.removeItem('items');
        document.querySelector(UISelectors.totalCalories).textContent = 0;
    }

    let loadEvents = function () {
        document.querySelector(UISelectors.addMeal).addEventListener('click', itemAdd);
        document.querySelector(UISelectors.collection).addEventListener('click', editItem);
        document.querySelector(UISelectors.updateMeal).addEventListener('click', updateItem);
        document.querySelector(UISelectors.deleteMeal).addEventListener('click', deleteItem);
        document.querySelector(UISelectors.back).addEventListener('click', back);
        document.querySelector(UISelectors.clearAll).addEventListener('click', clearAll);
        window.addEventListener('DOMContentLoaded', UICtrl.showUI);
    }

    return {
        init: function () {
            const items = ItemCtrl.logItems;
            UICtrl.paintUI(items);
            loadEvents();
            UICtrl.hideBtns();
        }
    }
})(ItemCtrl, StorageCtrl, UICtrl);

App.init();

