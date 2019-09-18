/**** BUDGET CONTROLLER ************/
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage =-1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0)
            this.percentage = Math.round((this.value/ totalIncome)*100);
            else
            this.percentage= -1;
    };


    Expense.prototype.getPercentage = function(){
        return this.percentage; 
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }


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

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum = sum + current.value;

        });
        data.totals[type] = sum;
    };


    return {
        addItems: function (type, description, value) {
            var newItem, ID;

            ID = data.allItems[type].length > 0 ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;

            if (type === 'exp') {

                newItem = new Expense(ID, description, value);

            } else if (type === 'inc') {
                newItem = new Income(ID, description, value);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage expenditure
            if (data.totals.inc > 0)
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            else
                data.percentage = -1;
        },

        calculatePercentage: function(){
                data.allItems.exp.forEach(function(current){
                    current.calcPercentage(data.totals.inc);
                });
        },

        getPercentages: function(){

            var allPercentages;

            allPercentages=data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPercentages;
        },

        returnBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function (type, id) {
            var ids;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        }

    };

})();

/**** UI CONTROLLER ************/
var UIController = (function () {

    var DOMStrings = {

        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expense__list',
        budgetLabel: '#total-budget',
        incomeLabel: '.total-budget-income',
        expenseLabel: '.total-budget-expense',
        totalPercentageLabel: '.total-budget-expense-percentage',
        container: '.item--container',
        percentageDiv: '.percentage-item',
        month: '.month'
    };


    var formatNumber = function(num,type){

        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length>3){
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,int.length);
        }

        return (type ==='exp'? '-':'+')+' '+int+ '.'+dec;
    };

    var nodeListForEach = function(list ,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i], i);
        }
     };

    return {
        getInput: function () {

            return {

                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItems: function (obj, type) {
            var html, element;

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<li class="item list-group-item" id="inc-%id%"><div class="item__description">%description%</div><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-trash" aria-hidden="true"></i></button></div></li>';

            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<li class="item list-group-item" id="exp-%id%"><div class="item__description">%description%</div><div class="item__value">%value%</div><div class="percentage-item">13%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-trash" aria-hidden="true"></i></button></div></li>';
            }

            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', formatNumber(obj.value,type));
           

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        deleteListItems: function (itemId) {

            var delElement= document.getElementById(itemId);
            delElement.parentNode.removeChild(delElement);

        },

        clearAllFields: function () {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,obj.budget>0?'inc':'exp');
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpense,'exp');
            document.querySelector(DOMStrings.totalPercentageLabel).textContent = obj.percentage + '%';
        },

        displayPercentages: function(obj){
            var fields= document.querySelectorAll(DOMStrings.percentageDiv);


            nodeListForEach(fields, function(current,index){

                current.textContent = obj[index]+ '%';
            })
        },

        displayMonth:function(){
            var now, month, year, months;

            now = new Date();
            months = [
                'January',
                'Feburary',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ]
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.month).textContent = months[month]+'  '+ year;
        },


        changedType:function(){
            var fields = document.querySelectorAll(DOMStrings.inputType+','+DOMStrings.inputDescription+','+DOMStrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red');
                cur.classList.toggle('green');
            })

            document.querySelector('.fa-check-circle').classList.toggle('red-btn');
            document.querySelector('.fa-check-circle').classList.toggle('green-btn');

        }


    }
})();

/**** GLOBAL APP CONTROLLER ************/
var controller = (function (budgtCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };



    var ctrlAddItem = function () {
        // get the filled data
        var input, newItem;

        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // add item to budget controller
            newItem = budgtCtrl.addItems(input.type, input.description, input.value);
            // add item to UI
            UICtrl.addListItems(newItem, input.type);

            // clear All Fields
            UICtrl.clearAllFields();

            //update Budget
            updateBudget();

            // Update Percentage
            updatePercentage();
        };



    };
    var ctrlDeleteItem = function (event) {

        var target, itemId, splitId, ID, type;
        if (event.target.className === 'fa fa-trash') {

            itemId = event.target.parentNode.parentNode.parentNode.id;
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);


            // delete the Item from DS
            budgtCtrl.deleteItem(type, ID);

            // delete item from UI
            UICtrl.deleteListItems(itemId);

            // Update and show new Budget
            updateBudget();

            // Update Percentage
            updatePercentage();
        }


    };

    var updateBudget = function () {

        var budget;
        // calculate budget
        budgtCtrl.calculateBudget();

        //return budget
        budget = budgtCtrl.returnBudget();
        // display budget on UI     

        UICtrl.displayBudget(budget);

    };

    var updatePercentage = function () {

        var percentages;
        // calculate percentages
        budgtCtrl.calculatePercentage();
        // read percentages from budget ctrl
        percentages=budgtCtrl.getPercentages();
        // update UI
        UICtrl.displayPercentages(percentages);
    };

    return {
        init: function () {
            console.log('The Expense Management Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: 0
            });

            setupEventListeners();
        }
    }

})(budgetController, UIController);




controller.init();