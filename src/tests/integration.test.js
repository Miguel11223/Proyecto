const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { testPool, setupTestDatabase, cleanupTestDatabase } = require('../config/database.test');

const app = require('../../app');

let server;

describe('Integration Tests', () => {
    let authToken;
    let testUserId;
    let testAlumnoId;
    let testItemId;

    beforeAll(async () => {
        await setupTestDatabase();
        const connection = await testPool.getConnection();
        
        const hashedPassword = await bcrypt.hash('password123', 10);
        const [userResult] = await connection.query(
            'INSERT INTO usuarios (username, password) VALUES (?, ?)',
            ['testuser', hashedPassword]
        );
        testUserId = userResult.insertId;
        
        const [alumnoResult] = await connection.query(
            'INSERT INTO alumno (nombre, apellido, semestre, carrera) VALUES (?, ?, ?, ?)',
            ['Test', 'Alumno', '5', 'Ingeniería']
        );
        testAlumnoId = alumnoResult.insertId;
        
        const [itemResult] = await connection.query(
            'INSERT INTO inventario (nombre_item, cantidad_disponible) VALUES (?, ?)',
            ['Libro de Matemáticas', 10]
        );
        testItemId = itemResult.insertId;
        
        connection.release();
        
        authToken = jwt.sign(
            { id_usuario: testUserId, username: 'testuser' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await cleanupTestDatabase();
        await testPool.end();
        if (server) {
            server.close();
        }
    });

    describe('Autenticación', () => {
        test('debe permitir login con credenciales válidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
        });

        test('debe rechazar login con credenciales inválidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('Gestión de Alumnos', () => {
        test('debe obtener lista de alumnos', async () => {
            const response = await request(app)
                .get('/api/alumnos')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('debe crear un nuevo alumno', async () => {
            const nuevoAlumno = {
                nombre: 'Nuevo',
                apellido: 'Estudiante',
                email: 'nuevo@example.com',
                semestre: '3',
                num_control: '20240050',
                carrera: 'Medicina'
            };

            const response = await request(app)
                .post('/api/alumnos')
                .set('Authorization', `Bearer ${authToken}`)
                .send(nuevoAlumno);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Gestión de Inventario', () => {
        test('debe obtener items del inventario', async () => {
            const response = await request(app)
                .get('/api/inventario')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('debe crear un nuevo item', async () => {
            const nuevoItem = {
                nombre_item: 'Nuevo Libro',
                description: 'Descripción del nuevo libro',
                cantidad_disponible: 5
            };

            const response = await request(app)
                .post('/api/inventario')
                .set('Authorization', `Bearer ${authToken}`)
                .send(nuevoItem);

            expect(response.status).toBe(201);
        });
    });

    describe('Préstamos', () => {
        test('debe crear un préstamo', async () => {
            const prestamoData = {
                id_alumno: testAlumnoId,
                id_item: testItemId
            };

            const response = await request(app)
                .post('/api/prestamos')
                .set('Authorization', `Bearer ${authToken}`)
                .send(prestamoData);

            expect(response.status).toBe(201);
        });

        test('debe obtener préstamos activos', async () => {
            const response = await request(app)
                .get('/api/prestamos/activos')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });
});