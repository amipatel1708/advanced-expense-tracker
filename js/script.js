let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let editId = null;

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const addBtn = document.getElementById("addBtn");

const expenseList = document.getElementById("expenseList");

const filterCategory = document.getElementById("filterCategory");
const sortBy = document.getElementById("sortBy");

const totalExpenseEl = document.getElementById("totalExpense");
const todayExpenseEl = document.getElementById("todayExpense");
const yesterdayExpenseEl = document.getElementById("yesterdayExpense");

const chart = document.getElementById("chart");

function saveToLocalStorage() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function clearInputs() {
    titleInput.value = "";
    amountInput.value = "";
    categoryInput.value = "";
    dateInput.value = "";
}

addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || amount <= 0 || !category || !date) {
        alert("Please fill all fields correctly");
        return;
    }

    if (editId) {
        const index = expenses.findIndex(exp => exp.id === editId);
        if (index !== -1) {
            expenses[index] = {
                id: editId,
                title,
                amount,
                category,
                date
            };
        }
        editId = null;
        addBtn.textContent = "+ Add Expense";
    } else {
        expenses.push({
            id: Date.now(),
            title,
            amount,
            category,
            date
        });
    }

    saveToLocalStorage();
    clearInputs();
    renderExpenses();
});

function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    expenses = expenses.filter(exp => exp.id !== id);
    saveToLocalStorage();
    renderExpenses();
}

function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;

    editId = id;
    addBtn.textContent = "Update Expense";
}

filterCategory.addEventListener("change", renderExpenses);
sortBy.addEventListener("change", renderExpenses);

function renderExpenses() {
    expenseList.innerHTML = "";

    let filteredExpenses = [...expenses];

    if (filterCategory.value !== "All") {
        filteredExpenses = filteredExpenses.filter(
            exp => exp.category === filterCategory.value
        );
    }

    switch (sortBy.value) {
        case "newest":
            filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case "oldest":
            filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case "amountHigh":
            filteredExpenses.sort((a, b) => b.amount - a.amount);
            break;
        case "amountLow":
            filteredExpenses.sort((a, b) => a.amount - b.amount);
            break;
    }

    filteredExpenses.forEach(exp => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${exp.title}</td>
            <td>₹${exp.amount}</td>
            <td>${exp.category}</td>
            <td>${exp.date}</td>
            <td>
                <button id ="editbtn" onclick="editExpense(${exp.id})">Edit</button>
                <button id ="deletebtn" onclick="deleteExpense(${exp.id})">Delete</button>
            </td>
        `;

        expenseList.appendChild(tr);
    });

    updateSummary();
    renderChart();
}

function updateSummary() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalExpenseEl.textContent = total;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

    let todayTotal = 0;
    let yesterdayTotal = 0;

    expenses.forEach(exp => {
        if (exp.date === today) todayTotal += exp.amount;
        if (exp.date === yesterday) yesterdayTotal += exp.amount;
    });

    todayExpenseEl.textContent = todayTotal;
    yesterdayExpenseEl.textContent = yesterdayTotal;
}

function renderChart() {
    chart.innerHTML = "";

    const categories = ["Food", "Travel", "Bills", "Other"];
    const totals = { Food: 0, Travel: 0, Bills: 0, Other: 0 };

    expenses.forEach(exp => {
        totals[exp.category] += exp.amount;
    });

    const maxValue = Math.max(...Object.values(totals), 1);

    categories.forEach(category => {
        const wrapper = document.createElement("div");
        wrapper.className = "bar-wrapper";

        const valueText = document.createElement("div");
        valueText.className = "bar-value";
        valueText.textContent = `₹${totals[category]}`;

        const bar = document.createElement("div");
        bar.className = `bar ${category.toLowerCase()}`;
        bar.style.height = `${(totals[category] / maxValue) * 180}px`;

        const label = document.createElement("div");
        label.className = "bar-label";
        label.textContent = category;

        wrapper.appendChild(valueText);
        wrapper.appendChild(bar);
        wrapper.appendChild(label);

        chart.appendChild(wrapper);
    });
}

renderExpenses();
