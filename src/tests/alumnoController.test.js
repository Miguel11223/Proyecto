const request = require('supertest');
const express = require('express');

jest.mock('../middlewares/auth', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { id_usuario: 1, username: 'testuser' };
        next();
    })
}));

jest.mock('../controllers/alumnoController', () => ({
    getAllAlumnos: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            count: 2,
            data: [
                { id_alumno: 1, nombre: 'Juan', apellido: 'Pérez' },
                { id_alumno: 2, nombre: 'María', apellido: 'Gómez' }
            ]
        });
    }),
    getAlumnoById: jest.fn((req, res) => {
        const { id } = req.params;
        if (id === '1') {
            res.status(200).json({
                success: true,
                data: { id_alumno: 1, nombre: 'Juan', apellido: 'Pérez' }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
    }),
    createAlumno: jest.fn((req, res) => {
        res.status(201).json({
            success: true,
            message: 'Alumno creado',
            id_alumno: 3
        });
    }),
    updateAlumno: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            message: 'Alumno actualizado'
        });
    }),
    deleteAlumno: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            message: 'Alumno eliminado'
        });
    }),
    searchAlumnos: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            count: 1,
            data: [{ id_alumno: 1, nombre: 'Juan' }]
        });
    })
}));

// LUEGO importas las rutas
const alumnoRoutes = require('../routes/alumnoRoutes');

const app = express();
app.use(express.json());
app.use('/api/alumnos', alumnoRoutes);

describe('Alumno Routes', () => {
    let alumnoController;
    let authMiddleware;

    beforeEach(() => {
        // Obtener referencias a los mocks
        alumnoController = require('../controllers/alumnoController');
        authMiddleware = require('../middlewares/auth');
        jest.clearAllMocks();
    });

    describe('GET /api/alumnos', () => {
        test('debe retornar lista de alumnos autenticado', async () => {
            const response = await request(app)
                .get('/api/alumnos');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(authMiddleware.authenticateToken).toHaveBeenCalled();
            expect(alumnoController.getAllAlumnos).toHaveBeenCalled();
        });
    });

    describe('GET /api/alumnos/:id', () => {
        test('debe retornar alumno por ID', async () => {
            const response = await request(app)
                .get('/api/alumnos/1');

            expect(response.status).toBe(200);
            expect(response.body.data.id_alumno).toBe(1);
            expect(alumnoController.getAlumnoById).toHaveBeenCalled();
        });

        test('debe retornar 404 para ID no existente', async () => {
            const response = await request(app)
                .get('/api/alumnos/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/alumnos', () => {
        test('debe crear nuevo alumno con datos válidos', async () => {
            const alumnoData = {
                nombre: 'Carlos',
                apellido: 'López',
                email: 'carlos@example.com',
                semestre: '4',
                num_control: '20240003',
                carrera: 'Ingeniería'
            };

            const response = await request(app)
                .post('/api/alumnos')
                .send(alumnoData);

            expect(response.status).toBe(201);
            expect(response.body.id_alumno).toBe(3);
            expect(alumnoController.createAlumno).toHaveBeenCalled();
        });

        test('debe retornar 400 con datos inválidos', async () => {
            const response = await request(app)
                .post('/api/alumnos')
                .send({
                    // nombre faltante
                    apellido: 'López',
                    semestre: '4',
                    carrera: 'Ingeniería'
                });

            expect(response.status).toBe(400);
        });
    });
});