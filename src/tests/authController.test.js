const request = require('supertest');
const express = require('express');

// PRIMERO el mock (esto se "eleva" al inicio por Jest)
jest.mock('../controllers/authController', () => ({
    login: jest.fn((req, res) => {
        const { username, password } = req.body;
        
        if (username === 'testuser' && password === 'password123') {
            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                token: 'test-token-123',
                user: { id_usuario: 1, username: 'testuser' }
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Credenciales incorrectas'
        });
    }),
    
    register: jest.fn((req, res) => {
        const { username, password } = req.body;
        
        if (username && password.length >= 6) {
            return res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                id_usuario: 1
            });
        }
        
        return res.status(400).json({
            success: false,
            message: 'Datos inválidos'
        });
    })
}));

// LUEGO importas las rutas (después del mock)
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    let authController;

    beforeEach(() => {
        // Obtener referencia al mock
        authController = require('../controllers/authController');
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        test('debe retornar 200 con credenciales válidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBe('test-token-123');
            expect(authController.login).toHaveBeenCalled();
        });

        test('debe retornar 400 con datos faltantes', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser'
                    // password faltante
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/register', () => {
        test('debe retornar 201 con datos válidos', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.id_usuario).toBe(1);
            expect(authController.register).toHaveBeenCalled();
        });

        test('debe retornar 400 con contraseña muy corta', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    password: '123' // demasiado corta
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});