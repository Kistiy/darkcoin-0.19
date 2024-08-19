const fs = require('fs');

// Ёмул€ци€ базы данных из server.js
const accounts = {
    master: { password: 'masterpassword', balance: 805.5, transactions: [] },
    404135: { password: 'aKh888', balance: 31.11, transactions: [] },
    759151: { password: 'kZv2024', balance: 19, transactions: [] },
    770425: { password: 'pOlr759', balance: 95, transactions: [] },
    825935: { password: 'LpSbQQ302', balance: 0, transactions: [] },
    902681: { password: 'yLnD932', balance: 73.39, transactions: [] },
};

// Ёкспорт данных в JSON-файл
fs.writeFile('accounts.json', JSON.stringify(accounts, null, 2), (err) => {
    if (err) throw err;
    console.log('Accounts have been saved to accounts.json');
});
