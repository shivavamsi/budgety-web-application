// Budget Controller
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome)*100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(typ, des, val) {
			var newItem;

			// create new ID
			if(data.allItems[typ].length > 0) {
				ID = data.allItems[typ][data.allItems[typ].length - 1].id + 1;
			} else {
				ID = 0;
			}


			// create new item based on typ
			if(typ === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if(typ === 'inc'){
				newItem = new Income(ID, des, val);
			}

			// push new item into data structure
			data.allItems[typ].push(newItem);

			// return new element
			return newItem;
		},

		calculateBudget: function() {

			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income & expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage of income that we spent
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalIncome: data.totals.inc,
				totalExpense: data.totals.exp,
				percentage: data.percentage
			}
		},

		deleteItem: function(type, id) {

			var ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		testing: function() {
			console.log(data);
		}
	};

})();

// UI Controller
var UIController = (function(){

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expencePercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		var numSplit;
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		intPart = numSplit[0];
		if(intPart.length > 3) {
			intPart = intPart.substr(0, intPart.length - 3) + ',' + intPart.substr(intPart.length -3, 3);
		}

		decPart = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + intPart + '.' + decPart;
	};

	return {
		getInput: function() {

			// The function getInput returns an object containing the inputs
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		getDOMstrings: function() {
			return DOMstrings;
		},

		addListItem: function(obj, type) {
			var html, newHTML, element;

			// create html and placeholder text
			if(type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp'){
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><div class="item__percentage">10%</div><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// replace placeholder with actual data
			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

			// insert HTML in to DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
		},

		deleteListItem: function(selectorID) {

			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
		},

		displayBudget: function(obj) {
			var type;

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).innerHTML = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).innerHTML = formatNumber(obj.totalIncome, 'inc');
			document.querySelector(DOMstrings.expenseLabel).innerHTML = formatNumber(obj.totalExpense, 'exp');
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).innerHTML = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).innerHTML = '---';
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expencePercLabel);

			for(var i = 0; i < fields.length; i++) {
				fields[i].innerHTML = percentages[i] + '%';
			}

			/*var nodeListForEach = function(list, callback) {
				for(var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			};

			nodeListForEach(fields, function(current, index) {

				if(percentages[index] > 0) {
					current.innerHTML = percentages[index] +  '%';
				} else {
					current.innerHTML = '---';
				}


			});*/
		},

		displayMonth: function() {
			var now, month, months, year;

			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',	'September', 'October',	'November',	'December'];

			now = new Date();
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).innerHTML = months[month] + ' ' + year;
		},

		changeType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue
			);

			document.querySelector(DOMstrings.inputButton).classList.toggle('red');

			for(var i = 0; i < fields.length; i++) {
				fields[i].classList.toggle('red-focus');
			}
		}
	};
})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		// Event listener for button click
		// add item on event
		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

		// event listener for key press
		document.addEventListener('keypress', function(event) {
			if(event.keyCode === 13 || event.which === 13){
				// add item
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
	};

	var updateBudget = function() {
		// 1. calculate budget
		budgetCtrl.calculateBudget();

		// 2. return the budget
		var budget = budgetCtrl.getBudget();

		// 3. display the budget on the UI
		UICtrl.displayBudget(budget);

	};

	var updatePercentages = function() {
		// 1. calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. read percentages from budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. update the UI with the new percentages
		UICtrl.displayPercentages(percentages);

	};

	var ctrlAddItem = function() {
		var input, newItem;

		// 1. get input data
		input = UIController.getInput();

		if(input.description !== '' && !isNaN(input.value) && input.value > 0) {

			// 2. add item to budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. add item to UI
			UICtrl.addListItem(newItem, input.type);

			// 4. clear the fields
			UICtrl.clearFields();

			// 5. calculate & update budget
			updateBudget();

			// 6. calculate and update percentages
			updatePercentages();
		}
	};

	var findParent = function(el, className) {
		while(!el.classList.contains(className)){
			el = el.parentElement;
		};
		return el.id;
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;

		itemID = findParent(event.target, 'item');

		if(itemID) {

			// inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseFloat(splitID[1]);

			// 1. delete item from data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. delete item from UI
			UICtrl.deleteListItem(itemID);

			// 3. update and show the new budget
			updateBudget();

			// 4. calculate and update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			UICtrl.clearFields();
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpense: 0,
				percentage: -1
			});
			setupEventListeners();
			UICtrl.displayMonth();
		}
	};

})(budgetController, UIController);

controller.init();
