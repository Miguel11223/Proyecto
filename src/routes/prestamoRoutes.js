const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { body } = require('express-validator');

// Validaciones
const prestamoValidation = [
    body('id_alumno').isInt().withMessage('ID de alumno inválido'),
    body('id_item').isInt().withMessage('ID de item inválido')
];

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Préstamos
 *   description: Gestión de préstamos de items del inventario
 */

/**
 * @swagger
 * /api/prestamos:
 *   get:
 *     summary: Obtener todos los préstamos
 *     tags: [Préstamos]
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
 *         description: Lista de préstamos
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
 *                       id_prestamo:
 *                         type: integer
 *                       id_alumno:
 *                         type: integer
 *                       id_item:
 *                         type: integer
 *                       alumno_nombre:
 *                         type: string
 *                       alumno_apellido:
 *                         type: string
 *                       item_nombre:
 *                         type: string
 *                       fecha_prestamo:
 *                         type: string
 *                         format: date-time
 *                       fecha_devolucion:
 *                         type: string
 *                         format: date-time
 *                       estado:
 *                         type: string
 *                         enum: [activo, devuelto]
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', prestamoController.getAllPrestamos);

/**
 * @swagger
 * /api/prestamos/activos:
 *   get:
 *     summary: Obtener préstamos activos
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de préstamos activos
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
 *       401:
 *         description: No autorizado
 */
router.get('/activos', prestamoController.getPrestamosActivos);

/**
 * @swagger
 * /api/prestamos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de préstamos
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de préstamos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     activos:
 *                       type: integer
 *                     devueltos:
 *                       type: integer
 *                     items_mas_prestados:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           nombre_item:
 *                             type: string
 *                           veces_prestado:
 *                             type: integer
 *       401:
 *         description: No autorizado
 */
router.get('/estadisticas', prestamoController.getEstadisticas);

/**
 * @swagger
 * /api/prestamos/alumno/{id_alumno}:
 *   get:
 *     summary: Obtener préstamos por alumno
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_alumno
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del alumno
 *     responses:
 *       200:
 *         description: Lista de préstamos del alumno
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
 *       404:
 *         description: Alumno no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/alumno/:id_alumno', prestamoController.getPrestamosByAlumno);

/**
 * @swagger
 * /api/prestamos/item/{id_item}:
 *   get:
 *     summary: Obtener préstamos por item
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_item
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item
 *     responses:
 *       200:
 *         description: Lista de préstamos del item
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
 *       404:
 *         description: Item no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/item/:id_item', prestamoController.getPrestamosByItem);

/**
 * @swagger
 * /api/prestamos/{id}:
 *   get:
 *     summary: Obtener préstamo por ID
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del préstamo
 *     responses:
 *       200:
 *         description: Préstamo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_prestamo:
 *                       type: integer
 *                     id_alumno:
 *                       type: integer
 *                     id_item:
 *                       type: integer
 *                     alumno_nombre:
 *                       type: string
 *                     alumno_apellido:
 *                       type: string
 *                     num_control:
 *                       type: string
 *                     item_nombre:
 *                       type: string
 *                     item_descripcion:
 *                       type: string
 *                     fecha_prestamo:
 *                       type: string
 *                       format: date-time
 *                     fecha_devolucion:
 *                       type: string
 *                       format: date-time
 *                     estado:
 *                       type: string
 *       404:
 *         description: Préstamo no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', prestamoController.getPrestamoById);

/**
 * @swagger
 * /api/prestamos:
 *   post:
 *     summary: Crear nuevo préstamo
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_alumno
 *               - id_item
 *             properties:
 *               id_alumno:
 *                 type: integer
 *                 example: 1
 *               id_item:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Préstamo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id_prestamo:
 *                   type: integer
 *       400:
 *         description: Datos inválidos o item no disponible
 *       404:
 *         description: Alumno o item no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/', validate(prestamoValidation), prestamoController.createPrestamo);

/**
 * @swagger
 * /api/prestamos/{id}/devolver:
 *   patch:
 *     summary: Devolver un préstamo
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del préstamo
 *     responses:
 *       200:
 *         description: Préstamo devuelto exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Préstamo activo no encontrado
 *       401:
 *         description: No autorizado
 */
router.patch('/:id/devolver', prestamoController.devolverPrestamo);

module.exports = router;