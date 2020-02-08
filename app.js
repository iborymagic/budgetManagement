// Only about budget
const BudgetController = (function() {
    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calculatePercentage = function() {
        let percent, totalInc;
        totalInc = budgetData.total.inc;

        if(totalInc <= 0) {
            percent = -1;
        } else {
            percent = (this.value / totalInc) * 100;
        }
        
        this.percentage = percent;
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    const budgetData = {
        all : {
            exp : [],
            inc : []
        },
        total : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };

    const createID = function(type) {
        let id;

        if(budgetData.all[type].length > 0)
            id = budgetData.all[type][budgetData.all[type].length - 1].id + 1;
        else
            id = 0;
        
        return id;
    };

    const calculateTotalPerc = function() {
        if(budgetData.all.inc.length > 0) {
            budgetData.percentage = (budgetData.total.exp / budgetData.total.inc) * 100;
        } else {
            budgetData.percentage = -1;
        }
    };

    return {
        getBudget : function() {
            return budgetData;
        },

        getID : function(type) {
            return createID(type);
        },

        addBudget : function(type, id, description, value) {
            if(type === "inc") {
                budgetData.all.inc.push(new Income(id, description, value));
                budgetData.budget += value;
            } else if(type === "exp") {
                budgetData.all.exp.push(new Expense(id, description, value));
                budgetData.budget -= value;
            }
            budgetData.total[type] += value;
            calculateTotalPerc();
        },

        removeBudget : function(arr) {
            const type = arr[0];
            const id = arr[1];
            let item, index;

            budgetData.all[type].forEach(function(el) {
                if(el.id === parseInt(id)) {
                    item = el;
                }
            });

            index = budgetData.all[type].indexOf(item);
            budgetData.all[type].splice(index, 1);

            budgetData.total[type] -= item.value;
            if(type === "inc") {
                budgetData.budget -= item.value;
            } else if(type === "exp") {
                budgetData.budget += item.value;
            }
            calculateTotalPerc();
        },

        getTotalPercentage : function() {
            return budgetData.percentage;
        },

        getPercentages : function() {
            let percentages = [];
            budgetData.all.exp.forEach(function(el) {
                el.calculatePercentage();
                percentages.push(el.percentage);
            })

            return percentages;
        }
    };
})();

// Only about UI
const UIController = (function() {
    const DOMstrings = {
        inputType : ".add__type",
        inputDesc : ".add__description",
        inputVal : ".add__value",
        addBtn : ".add__btn",
        incomeList : ".income__list",
        expensesList : ".expenses__list",
        month : ".budget__title--month",
        budgetVal : ".budget__value",
        incomeVal : ".budget__income--value",
        expenseVal : ".budget__expenses--value",
        totalPerc : ".budget__expenses--percentage",
        percentages : ".item__percentage",
        container : ".container"
    };

    const nodeListForEach = function(nodeList, func) {
        nodeArray = Array.from(nodeList);
        nodeArray.forEach(function(ele, index) {
            func(ele, index);
        })
    }

    const formatting = function(num) {
        let int, dec, result;
        num = Math.abs(num);
        num = num.toFixed(2);

        num = num.split(".");
        int = num[0];
        dec = num[1];

        if(int.length > 3) {
            result = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3,3);
            result = result + "." + dec;
        } else {
            result = int + "." + dec;
        }

        return result;
    }

    return {
        getDOMStrings : function() {
            return DOMstrings;
        },

        getHTML : function(type, id, val, desc) {
            let html, newHTML;
            val = formatting(val);

            if(type === "inc") {
                html =`<div class="item clearfix" id="%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if(type === "exp") {
                html =`<div class="item clearfix" id="%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }

            newHTML = html.replace("%id%", type + "-" + id);
            newHTML = newHTML.replace("%description%", desc);
            newHTML = newHTML.replace("%value%", val);

            return newHTML;
        },

        addItemUI : function(type, html) {
            if(type === "inc") {
                document.querySelector(DOMstrings.incomeList).insertAdjacentHTML('beforeend', html);
            } else if(type === "exp") {
                document.querySelector(DOMstrings.expensesList).insertAdjacentHTML('beforeend', html);
            }

            document.querySelector(DOMstrings.inputDesc).value = "";
            document.querySelector(DOMstrings.inputVal).value = "";
            document.querySelector(DOMstrings.inputDesc).focus();
        },

        monthUI : function() {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "De cember"];
            const date = new Date();
            const year = date.getFullYear();
            const month = months[date.getMonth()];

            document.querySelector(DOMstrings.month).innerText = month + ", " + year;
        },

        budgetUI : function(bud, inc, exp) {
            const formBud = bud < 0 ? "- " + formatting(bud) : formatting(bud);
            document.querySelector(DOMstrings.budgetVal).innerText = formBud;
            document.querySelector(DOMstrings.incomeVal).innerText = "+ " + formatting(inc);
            document.querySelector(DOMstrings.expenseVal).innerText = "- " + formatting(exp);
        },

        removeItem : function(selector) {
            const ele = document.getElementById(selector);
            ele.parentNode.removeChild(ele);
        },

        totalPercentageUI : function(per) {
            if(per > 0) {
                document.querySelector(DOMstrings.totalPerc).innerText = per + "%";
            } else {
                document.querySelector(DOMstrings.totalPerc).innerText = "---";
            }
        },

        showPercentages : function(per) {
            const elements = document.querySelectorAll(DOMstrings.percentages);
            nodeListForEach(elements, function(el, index) {
                if(per[index] > 0) {
                    el.innerText = per[index].toFixed(0) + "%";
                } else {
                    el.innerText = "---";
                }
            });
        },

        UIColors : function() {
            const nodes = DOMstrings.inputVal + ", " +
                          DOMstrings.inputDesc + ", " + 
                          DOMstrings.inputType;

            nodeListForEach(document.querySelectorAll(nodes), function(el, index) {
                el.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.addBtn).classList.toggle("red");
        }   
    };
})();

// Totally 
const appController = (function(BudgetCtrl, UICtrl) {
    const DOMstrings = UICtrl.getDOMStrings();

    const enterPressed = function(event) {
        if(event.keyCode === 13) {
            const type = document.querySelector(DOMstrings.inputType).value;
            addItem(type);
        }
    };

    const handleButton = function() {
        const type = document.querySelector(DOMstrings.inputType).value;
        addItem(type);
    };

    const handleEventListeners = function() {
        document.querySelector(DOMstrings.addBtn).addEventListener("click", handleButton);
        document.addEventListener("keypress", enterPressed);
        document.querySelector(DOMstrings.inputType).addEventListener("change", UICtrl.UIColors);
        document.querySelector(DOMstrings.container).addEventListener("click", removeItem);
    };

    const removeItem = function(event) {
        const itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId) { 
            const arr = itemId.split("-");
                
            UICtrl.removeItem(itemId);
            BudgetCtrl.removeBudget(arr);
            showBudget();
            showTotalPercentage();
            updatePercentages();
        }
    }

    const showBudget = function() {
        const budget = BudgetCtrl.getBudget();
        UICtrl.budgetUI(budget.budget, budget.total.inc, budget.total.exp);
    };

    const showTotalPercentage = function() {
        const perc = BudgetCtrl.getTotalPercentage().toFixed(0);
        UICtrl.totalPercentageUI(perc);
    };

    const updatePercentages = function() {
        const percentages = BudgetCtrl.getPercentages();
        UICtrl.showPercentages(percentages);
    }

    const addItem = function(type) {
        const val = parseInt(document.querySelector(DOMstrings.inputVal).value);
        const desc = document.querySelector(DOMstrings.inputDesc).value;

        if(val && desc) {
            const id = BudgetCtrl.getID(type);
            const html = UICtrl.getHTML(type, id, val, desc);

            UICtrl.addItemUI(type, html);
            BudgetCtrl.addBudget(type, id, desc, val);
            showBudget();
            showTotalPercentage();
            updatePercentages();
        }
    };

    return {
        init : function() {
            handleEventListeners();
            UICtrl.monthUI();
            UICtrl.budgetUI(0, 0, 0);
            UICtrl.totalPercentageUI(-1);
        }
    };
})(BudgetController, UIController);

appController.init();