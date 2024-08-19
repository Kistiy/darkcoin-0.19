const firebase = require("firebase/app");
require("firebase/database");
const fs = require("fs");

// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyCwNipJZk5eSJHuQCBg1DjVaO6sFLP5mow",
    authDomain: "darkcoin-f035f.firebaseapp.com",
    databaseURL: "https://darkcoin-f035f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "darkcoin-f035f",
    storageBucket: "darkcoin-f035f.appspot.com",
    messagingSenderId: "524514859135",
    appId: "1:524514859135:web:94122386cd0f31a259474a"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Чтение данных из JSON файла
const data = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));

// Загрузка данных в Firebase
database.ref().set(data, (error) => {
    if (error) {
        console.error("Error uploading data to Firebase:", error);
    } else {
        console.log("Data successfully uploaded to Firebase!");
    }
});
