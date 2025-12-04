const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { body } = require('express-validator');

const itemValidation = [
    body('nombre_item').notEmpty().withMessage('El nombre del item es requerido'),
    body('cantidad_disponible')
        .isInt({ min: 0 }).withMessage('La cantidad disponible debe ser un número mayor o igual a 0')
        .notEmpty().withMessage('La cantidad disponible es requerida')
];

const cantidadValidation = [
    body('operacion').isIn(['incrementar', 'decrementar']).withMessage('Operación inválida'),
    body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser un número mayor a 0')
];

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión de items del inventario
 */

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Obtener todos los items del inventario
 *     tags: [Inventario]
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
 *         description: Lista de items del inventario
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
 *                       id_item:
 *                         type: integer
 *                       nombre_item:
 *                         type: string
 *                       description:
 *                         type: string
 *                       cantidad_disponible:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', inventarioController.getAllItems);

/**
 * @swagger
 * /api/inventario/search:
 *   get:
 *     summary: Buscar items en el inventario
 *     tags: [Inventario]
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
 *       400:
 *         description: Parámetro de búsqueda requerido
 *       401:
 *         description: No autorizado
 */
router.get('/search', inventarioController.searchItems);

/**
 * @swagger
 * /api/inventario/{id}:
 *   get:
 *     summary: Obtener item por ID
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item
 *     responses:
 *       200:
 *         description: Item encontrado
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
 *                     id_item:
 *                       type: integer
 *                     nombre_item:
 *                       type: string
 *                     description:
 *                       type: string
 *                     cantidad_disponible:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Item no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', inventarioController.getItemById);

/**
 * @swagger
 * /api/inventario:
 *   post:
 *     summary: Crear nuevo item en el inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_item
 *               - cantidad_disponible
 *             properties:
 *               nombre_item:
 *                 type: string
 *                 example: "Libro de Matemáticas"
 *               description:
 *                 type: string
 *                 example: "Libro de cálculo diferencial e integral"
 *               cantidad_disponible:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Item creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id_item:
 *                   type: integer
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', validate(itemValidation), inventarioController.createItem);

/**
 * @swagger
 * /api/inventario/{id}:
 *   put:
 *     summary: Actualizar item del inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_item:
 *                 type: string
 *               description:
 *                 type: string
 *               cantidad_disponible:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *       404:
 *         description: Item no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/:id', validate(itemValidation), inventarioController.updateItem);

/**
 * @swagger
 * /api/inventario/{id}:
 *   delete:
 *     summary: Eliminar item del inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item
 *     responses:
 *       200:
 *         description: Item eliminado exitosamente
 *       404:
 *         description: Item no encontrado
 *       409:
 *         description: No se puede eliminar (tiene préstamos activos)
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', inventarioController.deleteItem);

/**
 * @swagger
 * /api/inventario/{id}/cantidad:
 *   patch:
 *     summary: Actualizar cantidad disponible de un item
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operacion
 *               - cantidad
 *             properties:
 *               operacion:
 *                 type: string
 *                 enum: [incrementar, decrementar]
 *                 example: incrementar
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cantidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 nueva_cantidad:
 *                   type: integer
 *       400:
 *         description: Datos inválidos o cantidad insuficiente
 *       404:
 *         description: Item no encontrado
 *       401:
 *         description: No autorizado
 */
router.patch('/:id/cantidad', validate(cantidadValidation), inventarioController.updateCantidad);

module.exports = router;