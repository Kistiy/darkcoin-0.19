const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://darkcoin-f035f-default-rtdb.europe-west1.firebasedatabase.app/" // замените на ваш URL базы данных
});

const db = admin.database();
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Поддержка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Этот маршрут отвечает на запросы к корневому URL "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Пример других маршрутов, если они есть
app.get('/about', (req, res) => {
    res.send('This is the about page');
});

// Логин
app.post('/login', async (req, res) => {
    const { id, password } = req.body;
    
    try {
        const snapshot = await db.ref(`accounts/${id}`).once('value');
        const account = snapshot.val();
        
        if (account && account.password === password) {
            res.json({ success: true, balance: account.balance });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Перевод DarkCoin
app.post('/transfer', async (req, res) => {
    const { fromId, toId, amount } = req.body;

    try {
        const fromSnapshot = await db.ref(`accounts/${fromId}`).once('value');
        const toSnapshot = await db.ref(`accounts/${toId}`).once('value');
        const fromAccount = fromSnapshot.val();
        const toAccount = toSnapshot.val();

        if (!fromAccount || !toAccount) {
            return res.json({ success: false, message: 'Account not found' });
        }

        const fee = Math.floor(amount * 0.05);  // 5% комиссия
        const netAmount = amount - fee;

        if (fromAccount.balance < amount) {
            return res.json({ success: false, message: 'Insufficient balance' });
        }

        await db.ref(`accounts/${fromId}`).update({
            balance: fromAccount.balance - amount
        });

        await db.ref(`accounts/${toId}`).update({
            balance: toAccount.balance + netAmount
        });

        await db.ref('accounts/master').transaction(masterAccount => {
            if (masterAccount) {
                masterAccount.balance += fee;
            }
            return masterAccount;
        });

        const transaction = {
            date: new Date().toISOString(),
            type: 'Transfer',
            amount,
            counterparty: toId,
        };
        await db.ref(`accounts/${fromId}/transactions`).push(transaction);

        const recipientTransaction = {
            date: new Date().toISOString(),
            type: 'Received',
            amount: netAmount,
            counterparty: fromId,
        };
        await db.ref(`accounts/${toId}/transactions`).push(recipientTransaction);

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Получение последних 10 транзакций
app.post('/transactions', async (req, res) => {
    const { id } = req.body;

    try {
        const snapshot = await db.ref(`accounts/${id}/transactions`).limitToLast(10).once('value');
        const transactions = snapshot.val() || [];
        res.json({ success: true, transactions });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Создание аккаунта (админ)
app.post('/create-account', async (req, res) => {
    const { id, password } = req.body;

    try {
        const snapshot = await db.ref(`accounts/${id}`).once('value');
        
        if (snapshot.exists()) {
            return res.json({ success: false, message: 'Account already exists' });
        }

        await db.ref(`accounts/${id}`).set({
            password,
            balance: 0,
            transactions: []
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Удаление аккаунта (админ)
app.post('/delete-account', async (req, res) => {
    const { id } = req.body;

    try {
        const snapshot = await db.ref(`accounts/${id}`).once('value');
        
        if (!snapshot.exists()) {
            return res.json({ success: false, message: 'Account not found' });
        }

        await db.ref(`accounts/${id}`).remove();
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Добавление средств (админ)
app.post('/add-funds', async (req, res) => {
    const { id, amount } = req.body;

    try {
        const snapshot = await db.ref(`accounts/${id}`).once('value');
        const account = snapshot.val();
        
        if (!account) {
            return res.json({ success: false, message: 'Account not found' });
        }

        await db.ref(`accounts/${id}`).update({
            balance: account.balance + amount
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Удаление средств (админ)
app.post('/remove-funds', async (req, res) => {
    const { id, amount } = req.body;

    try {
        const snapshot = await db.ref(`accounts/${id}`).once('value');
        const account = snapshot.val();
        
        if (!account) {
            return res.json({ success: false, message: 'Account not found' });
        }

        if (account.balance < amount) {
            return res.json({ success: false, message: 'Insufficient balance' });
        }

        await db.ref(`accounts/${id}`).update({
            balance: account.balance - amount
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Переименование аккаунта (админ)
app.post('/rename-account', async (req, res) => {
    const { id, newName } = req.body;

    try {
        const snapshot = await db.ref(`accounts/${id}`).once('value');
        const account = snapshot.val();
        
        if (!account) {
            return res.json({ success: false, message: 'Account not found' });
        }

        const newNameSnapshot = await db.ref(`accounts/${newName}`).once('value');
        if (newNameSnapshot.exists()) {
            return res.json({ success: false, message: 'New name already in use' });
        }

        await db.ref(`accounts/${newName}`).set(account);
        await db.ref(`accounts/${id}`).remove();

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Просмотр всех аккаунтов (админ)
app.get('/view-accounts', async (req, res) => {
    try {
        const snapshot = await db.ref('accounts').once('value');
        const accounts = snapshot.val() || {};
        const allAccounts = Object.keys(accounts).map(id => ({
            id,
            balance: accounts[id].balance,
            password: accounts[id].password
        }));
        res.json({ success: true, accounts: allAccounts });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
