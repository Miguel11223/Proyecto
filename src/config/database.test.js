const mysql = require('mysql2/promise');


const testPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'escuela_test',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function setupTestDatabase() {
    try {
        const connection = await testPool.getConnection();
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS escuela_test`);
        await connection.query(`USE escuela_test`);
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS alumno (
                id_alumno INT PRIMARY KEY AUTO_INCREMENT,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                semestre VARCHAR(100) NOT NULL,
                num_control VARCHAR(20),
                carrera VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inventario (
                id_item INT PRIMARY KEY AUTO_INCREMENT,
                nombre_item VARCHAR(100) NOT NULL,
                description TEXT,
                cantidad_disponible INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS prestamos (
                id_prestamo INT PRIMARY KEY AUTO_INCREMENT,
                id_alumno INT,
                id_item INT,
                fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_devolucion TIMESTAMP NULL,
                estado VARCHAR(20) DEFAULT 'activo',
                FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
                FOREIGN KEY (id_item) REFERENCES inventario(id_item)
            )
        `);
        
        connection.release();
        console.log('Base de datos de prueba configurada');
        return testPool;
    } catch (error) {
        console.error('Error al configurar base de datos de prueba:', error);
        throw error;
    }
}

async function cleanupTestDatabase() {
    try {
        const connection = await testPool.getConnection();
        
        await connection.query('DELETE FROM prestamos');
        await connection.query('DELETE FROM inventario');
        await connection.query('DELETE FROM alumno');
        await connection.query('DELETE FROM usuarios');
        
        await connection.query('ALTER TABLE usuarios AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE alumno AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE inventario AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE prestamos AUTO_INCREMENT = 1');
        
        connection.release();
        console.log('Base de datos de prueba limpiada');
    } catch (error) {
        console.error('Error al limpiar base de datos de prueba:', error);
        throw error;
    }
}

module.exports = { testPool, setupTestDatabase, cleanupTestDatabase };