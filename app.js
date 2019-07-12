// Create 3 IIFE (anonymous) function, modules are created this way as well
// through IIFE we can set scopes on variables or funcitons, so the return functions or variables are public
// Split code into 3 modules; BudgetController, UIController and Controller

// BUDGET CONTROLLER: only interacts with Controller
var BudgetController = (function () {

    // use function constructors because will have many expensses and incomes
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    // data structure for the expenses and incomes
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
        percentage: -1 // '-1' represents somehting non existance, so if there is no budget or total then there cant be any percentage
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (current) {
            // 'value' is the price property
            sum += current.value;
        })
        data.totals[type] = sum;
    }



    return {
        addItems: function (type, desc, val) {
            var newItem, ID;

            // if the lenght of the 'exp' array or 'inc' array is more than 0
            // 'data.allItem[type].length - 1]' will select the last item in the array
            // basically increment the last id in the array so we can have an id for a new item
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new item based on 'exp' or 'inc' type
            if (type === "exp") {
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc") {
                newItem = new Income(ID, desc, val);
            }

            // push newItem into the 'data' structure
            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            // calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            } else {
                data.percentage = -1;
            }


        },

        calculatePercentage: function () {

            data.allItems.exp.forEach(function (cur) {
                // 'calcPercentage' is the prototype function that we created
                cur.calcPercentage(data.totals.inc);
            })

        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                // 'getPercentage' is the prototype function that we created
                return cur.getPercentage();
            })
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function (type, id) {


            // different between 'foreach' and 'map' is that 'map' returns a new array
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            // if the index does exist
            if (index !== -1) {

                // 'splice' will delete the item at the index and it will only delete 1 item
                data.allItems[type].splice(index, 1);
            }

        },

        test: function () {
            console.log(data);
        }
    }


})();


// UI CONTROLLER: only interacts with Controller
var UIController = (function () {

    // create these DOM strings so that when one of these changes in html then we only have to change it here and we dont have to change it everywhere in javascript
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",

        incomeLstContainer: ".income__list",
        expenseLstContainer: ".expenses__list",

        budgetLabel: ".budget__value",
        incLabel: ".budget__income--value",
        expLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",

        container: ".container",

        expencesPercLbl: ".item__percentage",

        dateLbl: ".budget__title--month"

    };

    var formatNumber = function (num, type) {

        //2303.33 > 2,303.33

        // removes the '+' or the "-"
        numb = Math.abs(num);

        // return to 2 decimal points
        numb = numb.toFixed(2);

        var numSplit = numb.split(".");

        var int = numSplit[0];
        // more than 3 means more than a 1000
        if (int.length > 3) {
            // so if input is 2310 and output will be 2,310
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, int.length);
        }

        var dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;

    }

    return {
        // return the data from the input fields
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // type will have either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) // parse the value of string type to float
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            // create HTML with placeholder text
            if (type === "inc") {

                element = DOMStrings.incomeLstContainer;

                html = '<div class = "item clearfix" id="inc-%id%"><div class = "item__description" > %description% </div><div class = "right clearfix" ><div class="item__value"> %value% </div> <div class = "item__delete" ><button class = "item__delete--btn" > <i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {

                element = DOMStrings.expenseLstContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the palceholder text with actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));


            // insert the html into DOM
            // 'beforeend' will make it so that all the new html is inserted as the last child of either the 'incomeLstContainer' or 'expenseLstContainer' 
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);



        },

        clearFields: function () {

            // get the inputDescriptiuon and inputValue fields
            var fields = document.querySelectorAll(DOMStrings.inputDescription + "," + DOMStrings.inputValue);

            // 'querySelectorAll' used above uses list
            // so call the 'slice' method from the Array prototype as we cant apply 'slice' method directly on 'fields' as it is a list
            var fieldsArr = Array.prototype.slice.call(fields);

            // 'current' is the value of the array that is currently been proccessed
            // 'index' 0 to lenght of array
            // 'array' have access to the entire array
            fieldsArr.forEach(function (current, index, array) {
                // clear the current fields
                current.value = "";
            });
            // go to the description field after clearing
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMStrings.expLabel).textContent = formatNumber(obj.totalExp, "exp");


            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";

            }

        },

        deleteLstItem: function (selectorId) {

            var element = document.getElementById(selectorId); // get the element by id
            // we have to go to the parent node of the element and then remove child and pass the elemetn again
            element.parentNode.removeChild(element);
        },

        displayPercentage: function (percentage) {

            var fields = document.querySelectorAll(DOMStrings.expencesPercLbl);

            var nodeLstForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }

            nodeLstForEach(fields, function (cur, index) {
                if (percentage[index] > 0) {
                    cur.textContent = percentage[index] + "%";
                } else {
                    cur.textContent = "---";
                }

            })
        },

        displayMonth: function () {

            document.querySelector(DOMStrings.dateLbl).textContent = new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });
        },



        // return the 'DOMStrings' object so Controller module can use it
        getDOMStrings: function () {
            return DOMStrings;
        }

    }

})();




// GLOBAL APP CONTROLLER: interacts with UIController and BudgetController
var Controller = (function () {


    var ctrlAddItem = function () {

        // 1. get the input data from the fields
        var input = UIController.getInput();

        // if description field is not empty and 'value' field is not null and 'value' field is more than 0
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. pass the values of the input fields to the 'BudgetController'
            var newItem = BudgetController.addItems(input.type, input.description, input.value)

            // 3. add the item to the UI
            UIController.addListItem(newItem, input.type);

            // 4. Clear fields
            UIController.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. update the percentage
            updatePercentage();
        }
    }

    var updateBudget = function () {

        // 1. caluclate the budget
        BudgetController.calculateBudget();

        // 2. return the budget
        var budget = BudgetController.getBudget();

        // 2. display budget on UI
        UIController.displayBudget(budget);
    }

    var updatePercentage = function () {

        //1. caluclate percentage
        BudgetController.calculatePercentage();

        //2. Read percentages from budget controller
        var percentages = BudgetController.getPercentages();

        //3. Update the UI with new percentages
        UIController.displayPercentage(percentages);
    }

    // the 'event' argument is from the event listener we can name it anything we want
    var ctrlDeleteItem = function (event) {

        // this is event bubbling
        // 'target' will get the html element of the item clicked on
        // 'parentNode' will get the parent element of the item clicked on, its been used 4 times because we want to move up 4 times the parent ladder of that item and will get the id of that 4th parent, example id 'income-0'
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // if the item id is there
        if (itemId) {

            // 'split' mwthod will split the 'ItemId' at the '-'
            // for e.g. itemId = income-0 after split the 'itemSplit' will have array of '["inc", 0]' or '["exp", 0]'
            var itemSplit = itemId.split("-");
            var type = itemSplit[0]; // get the type either inc or exp
            var ID = parseInt(itemSplit[1]); // get id 

            // 1.delete item from data structure
            BudgetController.deleteItem(type, ID);

            // 2.delete item from UI
            UIController.deleteLstItem(itemId);

            // 3.update and show new budget
            updateBudget();

            // 4. update the percentage
            updatePercentage();


        }
    }



    var setUpEventListeners = function () {

        // call DOM strings object from 'UIController' module
        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        // create an event for a keypress on the keyboard
        document.addEventListener("keypress", function (event) {

            // 13 is the keycode for the enter button on keyboard
            // some older browsers use the 'Which' property
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

        // delete item event
        // we use event delegation which is event bubbling, so this means we dont have to add event to every item in that container, instead we can use event bobling to get an item in that container which is done through the 'event.target' mehtod in the 'ctrlDeleteItem' function
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem)
    }



    return {
        // initilize members so it can be called in global scope
        init: function () {
            setUpEventListeners();
            // set everything to 0 at the start of the applicaiton
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            })
            UIController.displayMonth();
        }
    }

})();


Controller.init();
