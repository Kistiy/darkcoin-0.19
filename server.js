const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Этот маршрут отвечает на запросы к корневому URL "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Пример других маршрутов, если они есть
app.get('/about', (req, res) => {
    res.send('This is the about page');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Хранилище данных (эмуляция базы данных)
const accounts = {
    master: { password: 'masterpassword', balance: 1000000, transactions: [] },
    user1: { password: 'user1password', balance: 100, transactions: [] },
    user2: { password: 'user2password', balance: 50, transactions: [] },
};

// Логин
app.post('/login', (req, res) => {
    const { id, password } = req.body;
    if (accounts[id] && accounts[id].password === password) {
        res.json({ success: true, balance: accounts[id].balance });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// Перевод DarkCoin
app.post('/transfer', (req, res) => {
    const { fromId, toId, amount } = req.body;

    if (!accounts[fromId] || !accounts[toId]) {
        return res.json({ success: false, message: 'Account not found' });
    }

    const fee = Math.floor(amount * 0.05);  // 5% комиссия
    const netAmount = amount - fee;

    if (accounts[fromId].balance < amount) {
        return res.json({ success: false, message: 'Insufficient balance' });
    }

    // Списание средств с отправителя
    accounts[fromId].balance -= amount;

    // Пополнение счета получателя
    accounts[toId].balance += netAmount;

    // Перевод комиссии на мастер-аккаунт
    accounts.master.balance += fee;

    // Запись транзакций
    const transaction = {
        date: new Date().toISOString(),
        type: 'Transfer',
        amount,
        counterparty: toId,
    };
    accounts[fromId].transactions.push(transaction);

    const recipientTransaction = {
        date: new Date().toISOString(),
        type: 'Received',
        amount: netAmount,
        counterparty: fromId,
    };
    accounts[toId].transactions.push(recipientTransaction);

    res.json({ success: true });
});

// Получение последних 10 транзакций
app.post('/transactions', (req, res) => {
    const { id } = req.body;

    if (!accounts[id]) {
        return res.json({ success: false, message: 'Account not found' });
    }

    const transactions = accounts[id].transactions.slice(-10);
    res.json({ success: true, transactions });
});

// Создание аккаунта (админ)
app.post('/create-account', (req, res) => {
    const { id, password } = req.body;

    if (accounts[id]) {
        return res.json({ success: false, message: 'Account already exists' });
    }

    accounts[id] = { password, balance: 0, transactions: [] };
    res.json({ success: true });
});

// Удаление аккаунта (админ)
app.post('/delete-account', (req, res) => {
    const { id } = req.body;

    if (!accounts[id]) {
        return res.json({ success: false, message: 'Account not found' });
    }

    delete accounts[id];
    res.json({ success: true });
});

// Добавление средств (админ)
app.post('/add-funds', (req, res) => {
    const { id, amount } = req.body;

    if (!accounts[id]) {
        return res.json({ success: false, message: 'Account not found' });
    }

    accounts[id].balance += amount;
    res.json({ success: true });
});

// Удаление средств (админ)
app.post('/remove-funds', (req, res) => {
    const { id, amount } = req.body;

    if (!accounts[id]) {
        return res.json({ success: false, message: 'Account not found' });
    }

    if (accounts[id].balance < amount) {
        return res.json({ success: false, message: 'Insufficient balance' });
    }

    accounts[id].balance -= amount;
    res.json({ success: true });
});

// Переименование аккаунта (админ)
app.post('/rename-account', (req, res) => {
    const { id, newName } = req.body;

    if (!accounts[id]) {
        return res.json({ success: false, message: 'Account not found' });
    }

    if (accounts[newName]) {
        return res.json({ success: false, message: 'New name already in use' });
    }

    accounts[newName] = accounts[id];
    delete accounts[id];
    res.json({ success: true });
});

// Просмотр всех аккаунтов (админ)
app.get('/view-accounts', (req, res) => {
    const allAccounts = Object.keys(accounts).map(id => ({
        id,
        balance: accounts[id].balance,
        password: accounts[id].password
    }));
    res.json({ success: true, accounts: allAccounts });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
