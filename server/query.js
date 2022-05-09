const mysql = require("mysql2");
const fs = require("fs");


// Создаем пул
const poolWithoutPromise = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    password: "",
    database: "analysis"
});

// Создаем промис для пула, чтобы можно было удобно совершать асинхронные запросы к бд
const pool = poolWithoutPromise.promise();

// Получение всех строк из таблицы
selectAllFromTable = async (tableName) => {
    let result = await pool.query(`SELECT * FROM ${tableName}`);
    return result[0];
};

// Получение конкретных строк из таблицы с условием
selectFromTable = async (tableName, value, where) => {
    let result;
    if(where)
        result = await pool.query(`SELECT ${value} FROM ${tableName} WHERE ${where}`);
    else
        result = await pool.query(`SELECT ${value} FROM ${tableName}`);
    return result[0];
};


module.exports = {selectAllFromTable, selectFromTable};