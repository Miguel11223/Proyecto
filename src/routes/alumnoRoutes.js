const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { body } = require('express-validator');

const alumnoValidation = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('semestre').notEmpty().withMessage('El semestre es requerido'),
    body('num_control').optional().notEmpty().withMessage('El número de control es requerido'),
    body('carrera').notEmpty().withMessage('La carrera es requerida')
];

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Alumnos
 *   description: Gestión de alumnos
 */

/**
 * @swagger
 * /api/alumnos:
 *   get:
 *     summary: Obtener todos los alumnos
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de alumnos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_alumno:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       apellido:
 *                         type: string
 *                       email:
 *                         type: string
 *                       semestre:
 *                         type: string
 *                       num_control:
 *                         type: string
 *                       carrera:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', alumnoController.getAllAlumnos);

/**
 * @swagger
 * /api/alumnos/search:
 *   get:
 *     summary: Buscar alumnos
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Parámetro de búsqueda requerido
 *       401:
 *         description: No autorizado
 */
router.get('/search', alumnoController.searchAlumnos);

/**
 * @swagger
 * /api/alumnos/{id}:
 *   get:
 *     summary: Obtener alumno por ID
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del alumno
 *     responses:
 *       200:
 *         description: Alumno encontrado
 *       404:
 *         description: Alumno no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', alumnoController.getAlumnoById);

/**
 * @swagger
 * /api/alumnos:
 *   post:
 *     summary: Crear nuevo alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - semestre
 *               - carrera
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               semestre:
 *                 type: string
 *                 example: "5"
 *               num_control:
 *                 type: string
 *                 example: "20240001"
 *               carrera:
 *                 type: string
 *                 example: "Ingeniería en Sistemas"
 *     responses:
 *       201:
 *         description: Alumno creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', validate(alumnoValidation), alumnoController.createAlumno);

/**
 * @swagger
 * /api/alumnos/{id}:
 *   put:
 *     summary: Actualizar alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del alumno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               semestre:
 *                 type: string
 *               num_control:
 *                 type: string
 *               carrera:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alumno actualizado
 *       404:
 *         description: Alumno no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/:id', validate(alumnoValidation), alumnoController.updateAlumno);

/**
 * @swagger
 * /api/alumnos/{id}:
 *   delete:
 *     summary: Eliminar alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del alumno
 *     responses:
 *       200:
 *         description: Alumno eliminado
 *       404:
 *         description: Alumno no encontrado
 *       409:
 *         description: No se puede eliminar (tiene préstamos)
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', alumnoController.deleteAlumno);

module.exports = router;