const request = require('supertest');
const express = require('express');

jest.mock('../middlewares/auth', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { id_usuario: 1, username: 'admin', role: 'admin' };
        next();
    }),
    isAdmin: jest.fn((req, res, next) => {
        next(); 
    })
}));

jest.mock('../controllers/usuarioController', () => ({
    getAllUsuarios: jest.fn(),
    getUsuarioById: jest.fn(),
    updateUsuario: jest.fn(),
    deleteUsuario: jest.fn()
}));

const usuarioRoutes = require('../routes/usuarioRoutes');
const usuarioController = require('../controllers/usuarioController');

const app = express();
app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);

describe('Usuario Routes', () => {
    beforeEach(() => {
        usuarioController.getAllUsuarios.mockImplementation((req, res) => {
            res.status(200).json({
                success: true,
                count: 2,
                data: [
                    { id_usuario: 1, username: 'admin', created_at: '2024-01-01T10:00:00.000Z' },
                    { id_usuario: 2, username: 'usuario1', created_at: '2024-01-02T11:00:00.000Z' }
                ]
            });
        });

        usuarioController.getUsuarioById.mockImplementation((req, res) => {
            const { id } = req.params;
            if (id === '1') {
                res.status(200).json({
                    success: true,
                    data: { id_usuario: 1, username: 'admin', created_at: '2024-01-01T10:00:00.000Z' }
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
        });

        usuarioController.updateUsuario.mockImplementation((req, res) => {
            res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente'
            });
        });

        usuarioController.deleteUsuario.mockImplementation((req, res) => {
            res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/usuarios/profile', () => {
        test('debe retornar perfil del usuario actual', async () => {
            const response = await request(app)
                .get('/api/usuarios/profile');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.id_usuario).toBe(1);
            expect(response.body.user.username).toBe('admin');
        });
    });

    describe('GET /api/usuarios', () => {
        test('debe retornar lista de usuarios (admin)', async () => {
            const response = await request(app)
                .get('/api/usuarios');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(2);
            expect(usuarioController.getAllUsuarios).toHaveBeenCalled();
        });
    });

    describe('GET /api/usuarios/:id', () => {
        test('debe retornar usuario por ID existente', async () => {
            const response = await request(app)
                .get('/api/usuarios/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id_usuario).toBe(1);
            expect(usuarioController.getUsuarioById).toHaveBeenCalled();
        });

        test('debe retornar 404 para usuario no existente', async () => {
            const response = await request(app)
                .get('/api/usuarios/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(usuarioController.getUsuarioById).toHaveBeenCalled();
        });
    });

    describe('PUT /api/usuarios/:id', () => {
        test('debe actualizar usuario existente', async () => {
            const updateData = {
                username: 'nuevo_usuario'
            };

            const response = await request(app)
                .put('/api/usuarios/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(usuarioController.updateUsuario).toHaveBeenCalled();
        });

        test('debe retornar 400 sin datos de actualización', async () => {
            const response = await request(app)
                .put('/api/usuarios/1')
                .send({}); // Datos vacíos

            expect(response.status).toBe(400);
            expect(usuarioController.updateUsuario).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/usuarios/:id', () => {
        test('debe eliminar usuario existente', async () => {
            const response = await request(app)
                .delete('/api/usuarios/2'); // No eliminar al usuario actual (id 1)

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(usuarioController.deleteUsuario).toHaveBeenCalled();
        });
    });
});