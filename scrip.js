
// =====================================
// SpendWise Budget Tracker
// =====================================

// 1. Variables
let totalBudget = 0;
let totalExpenses = 0;
let remainingBalance = 0;

// 2. Array to store expense records
let expenses = [];

// 3. Select HTML elements
const budgetForm = document.getElementById("budgetForm");
const expenseForm = document.getElementById("expenseForm");

const budgetInput = document.getElementById("budgetInput");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");

const totalBudgetDisplay = document.getElementById("totalBudget");
const totalExpensesDisplay = document.getElementById("totalExpenses");
const remainingBalanceDisplay = document.getElementById("remainingBalance");
const expenseCountDisplay = document.getElementById("expenseCount");

const expenseTableBody = document.getElementById("expenseTableBody");
const filterCategory = document.getElementById("filterCategory");
const clearExpensesButton = document.getElementById("clearExpenses");

const budgetProgress = document.getElementById("budgetProgress");
const budgetPercentage = document.getElementById("budgetPercentage");
const budgetMessage = document.getElementById("budgetMessage");
const tableSummary = document.getElementById("tableSummary");

// 4. Currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES"
    }).format(amount);
}

// 5. Save data in local storage
function saveData() {
    localStorage.setItem("spendwiseBudget", JSON.stringify(totalBudget));
    localStorage.setItem("spendwiseExpenses", JSON.stringify(expenses));
}

// 6. Load saved data
function loadData() {
    const savedBudget = localStorage.getItem("spendwiseBudget");
    const savedExpenses = localStorage.getItem("spendwiseExpenses");

    if (savedBudget !== null) {
        totalBudget = Number(savedBudget) || 0;
    }

    if (savedExpenses !== null) {
        try {
            const parsedExpenses = JSON.parse(savedExpenses);
            expenses = Array.isArray(parsedExpenses) ? parsedExpenses : [];
        } catch (error) {
            expenses = [];
        }
    }

    updateDashboard();
}

// 7. Calculate expenses
function calculateExpenses() {
    totalExpenses = expenses.reduce(function(total, expense) {
        return total + Number(expense.amount);
    }, 0);

    remainingBalance = totalBudget - totalExpenses;
}

// 8. Update dashboard
function updateDashboard() {
    calculateExpenses();

    totalBudgetDisplay.textContent = formatCurrency(totalBudget);
    totalExpensesDisplay.textContent = formatCurrency(totalExpenses);
    remainingBalanceDisplay.textContent = formatCurrency(remainingBalance);
    expenseCountDisplay.textContent = expenses.length;

    // Conditional statements to check remaining balance
    if (remainingBalance < 0) {
        remainingBalanceDisplay.style.color = "#dc2626";
    } else {
        remainingBalanceDisplay.style.color = "#16a34a";
    }

    updateBudgetProgress();
    displayExpenses();
    saveData();
}

// 9. Update budget progress bar
function updateBudgetProgress() {
    let percentage = 0;

    if (totalBudget > 0) {
        percentage = (totalExpenses / totalBudget) * 100;
    }

    const displayedPercentage = Math.min(percentage, 100);

    budgetProgress.style.width = displayedPercentage + "%";
    budgetPercentage.textContent = Math.round(percentage) + "%";

    if (percentage >= 100 && totalBudget > 0) {
        budgetProgress.style.backgroundColor = "#dc2626";
        budgetMessage.textContent =
            "Warning! You have reached or exceeded your budget.";
        budgetMessage.style.color = "#dc2626";

    } else if (percentage >= 75) {
        budgetProgress.style.backgroundColor = "#f59e0b";
        budgetMessage.textContent =
            "You have used most of your budget. Spend carefully.";
        budgetMessage.style.color = "#b45309";

    } else if (totalBudget > 0) {
        budgetProgress.style.backgroundColor = "#16a34a";
        budgetMessage.textContent =
            "Good job! You are managing your budget.";
        budgetMessage.style.color = "#16a34a";

    } else {
        budgetProgress.style.backgroundColor = "#16a34a";
        budgetMessage.textContent =
            "Set your budget to begin tracking.";
        budgetMessage.style.color = "#64748b";
    }
}

// 10. Set monthly budget
budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newBudget = Number(budgetInput.value);

    if (!Number.isFinite(newBudget) || newBudget <= 0) {
        alert("Please enter a valid budget greater than zero.");
        return;
    }

    totalBudget = newBudget;

    updateDashboard();

    budgetForm.reset();

    alert("Your budget has been updated successfully!");
});

// 11. Add new expense
expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    // Validate user input
    if (
        name === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        category === "" ||
        date === ""
    ) {
        alert("Please enter valid information in all expense fields.");
        return;
    }

    // Create expense object
    const newExpense = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: name,
        amount: amount,
        category: category,
        date: date
    };

    // Store expense in array
    expenses.push(newExpense);

    updateDashboard();

    expenseForm.reset();

    alert("Expense added successfully!");
});

// 12. Display expenses in table
function displayExpenses() {
    const selectedCategory = filterCategory.value;

    // Filter expenses using conditionals
    const filteredExpenses = expenses.filter(function(expense) {
        if (selectedCategory === "All") {
            return true;
        }

        return expense.category === selectedCategory;
    });

    expenseTableBody.innerHTML = "";

    // Display message when no expenses exist
    if (filteredExpenses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-message";
        cell.textContent = "No expenses found.";

        row.appendChild(cell);
        expenseTableBody.appendChild(row);

    } else {
        filteredExpenses.forEach(function(expense) {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = expense.name;

            const categoryCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "category-badge";
            badge.textContent = expense.category;
            categoryCell.appendChild(badge);

            const dateCell = document.createElement("td");
            dateCell.textContent = expense.date;

            const amountCell = document.createElement("td");
            amountCell.textContent = formatCurrency(expense.amount);

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-button";

            deleteButton.addEventListener("click", function() {
                deleteExpense(expense.id);
            });

            actionCell.appendChild(deleteButton);

            row.append(
                nameCell,
                categoryCell,
                dateCell,
                amountCell,
                actionCell
            );

            expenseTableBody.appendChild(row);
        });
    }

    tableSummary.textContent =
        "Showing " + filteredExpenses.length + " of " +
        expenses.length + " expenses";
}

// 13. Delete individual expense
function deleteExpense(id) {
    const confirmed = confirm("Are you sure you want to delete this expense?");

    if (!confirmed) {
        return;
    }

    expenses = expenses.filter(function(expense) {
        return expense.id !== id;
    });

    updateDashboard();
}

// 14. Filter expenses by category
filterCategory.addEventListener("change", function() {
    displayExpenses();
});

// 15. Clear all expenses
clearExpensesButton.addEventListener("click", function() {
    if (expenses.length === 0) {
        alert("There are no expenses to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete all expense records?"
    );

    if (confirmed) {
        expenses = [];
        updateDashboard();
        alert("All expenses have been cleared.");
    }
});

// 16. Set today's date automatically
expenseDate.value = new Date().toLocaleDateString("en-CA");

// 17. Load saved information when the page opens
loadData();
