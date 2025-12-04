const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
    development: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    test: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_TEST || 'escuela_test',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    production: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    }
};

const env = process.env.NODE_ENV || 'development';
const poolConfig = config[env];

const pool = mysql.createPool(poolConfig);

async function initializeDatabase() {
    try {
        if (env === 'test') {
            console.log('Usando base de datos de prueba');
            return pool;
        }

        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos establecida');
        
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`Tablas encontradas: ${tables.length}`);
        
        connection.release();
        return pool;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1);
    }
}

module.exports = { pool, initializeDatabase };