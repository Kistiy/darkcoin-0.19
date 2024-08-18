// Global variables
let currentUserId;
let currentBalance = 0;

// Login function
function login() {
    const id = document.getElementById('login-id').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUserId = id;
            currentBalance = data.balance;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('wallet-section').style.display = 'block';
            document.getElementById('user-id').innerText = id;
            document.getElementById('balance').innerText = data.balance;

            // Show admin section if master account
            if (id === 'master') {
                document.getElementById('admin-section').style.display = 'block';
            }

            loadTransactions();
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Transfer DarkCoin function
function transfer() {
    const toId = document.getElementById('transfer-to-id').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);

    if (amount <= 0 || amount > currentBalance) {
        alert('Invalid amount');
        return;
    }

    fetch('/transfer', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromId: currentUserId, toId, amount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentBalance -= amount;
            document.getElementById('balance').innerText = currentBalance;
            loadTransactions();
            alert('Transfer successful');
        } else {
            alert('Transfer failed: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Change Password function
function changePassword() {
    const newPassword = prompt("Enter your new password:");

    fetch('/change-password', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: currentUserId, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Password changed successfully');
        } else {
            alert('Failed to change password: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Load Last 10 Transactions
function loadTransactions() {
    fetch('/transactions', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: currentUserId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const transactionList = document.getElementById('transaction-list');
            transactionList.innerHTML = '';
            data.transactions.forEach(transaction => {
                const listItem = document.createElement('li');
                listItem.innerText = `${transaction.date}: ${transaction.type} ${transaction.amount} DarkCoin to/from ${transaction.counterparty}`;
                transactionList.appendChild(listItem);
            });
        } else {
            alert('Failed to load transactions: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Admin: Create New Account
function createAccount() {
    const id = document.getElementById('new-account-id').value;
    const password = document.getElementById('new-account-password').value;

    fetch('/create-account', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Account created successfully');
        } else {
            alert('Failed to create account: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Admin: Delete Account
function deleteAccount() {
    const id = prompt("Enter the ID of the account to delete:");

    fetch('/delete-account', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Account deleted successfully');
        } else {
            alert('Failed to delete account: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Admin: Set Exchange Rate
function setExchangeRate() {
    const rate = parseFloat(prompt("Enter the new exchange rate:"));

    fetch('/set-exchange-rate', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rate }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Exchange rate set successfully');
        } else {
            alert('Failed to set exchange rate: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Admin: Add Funds to Account
function addFunds() {
    const id = prompt("Enter the ID of the account to add funds to:");
    const amount = parseFloat(prompt("Enter the amount of DarkCoin to add:"));

    fetch('/add-funds', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, amount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Funds added successfully');
        } else {
            alert('Failed to add funds: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Admin: Remove Funds from Account
function removeFunds() {
    const id = prompt("Enter the ID of the account to remove funds from:");
    const amount = parseFloat(prompt("Enter the amount of DarkCoin to remove:"));

    fetch('/remove-funds', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, amount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Funds removed successfully');
        } else {
            alert('Failed to remove funds: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Admin: Rename Account
function renameAccount() {
    const id = prompt("Enter the ID of the account to rename:");
    const newName = prompt("Enter the new name for the account:");

    fetch('/rename-account', {  // Изменено на относительный путь
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, newName }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Account renamed successfully');
        } else {
            alert('Failed to rename account: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Admin: View All Accounts
function viewAccounts() {
    fetch('/view-accounts', {  // Изменено на относительный путь
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const accountsList = document.getElementById('accounts-list');
            accountsList.innerHTML = '';
            data.accounts.forEach(account => {
                const listItem = document.createElement('li');
                listItem.innerText = `ID: ${account.id}, Balance: ${account.balance}, Password: ${account.password}`;
                accountsList.appendChild(listItem);
            });
        } else {
            alert('Failed to load accounts: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}
