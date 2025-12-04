const { pool } = require('../config/database');

// Obtener todos los items del inventario
exports.getAllItems = async (req, res) => {
    try {
        const [items] = await pool.execute(`
            SELECT * FROM inventario 
            ORDER BY nombre_item ASC
        `);

        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error al obtener items:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener items del inventario'
        });
    }
};

// Obtener item por ID
exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [items] = await pool.execute(
            'SELECT * FROM inventario WHERE id_item = ?',
            [id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }

        res.json({
            success: true,
            data: items[0]
        });
    } catch (error) {
        console.error('Error al obtener item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener item'
        });
    }
};

// Crear nuevo item
exports.createItem = async (req, res) => {
    try {
        const { 
            nombre_item, 
            description, 
            cantidad_disponible 
        } = req.body;

        // Validar cantidad disponible
        if (cantidad_disponible < 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad disponible no puede ser negativa'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO inventario 
            (nombre_item, description, cantidad_disponible) 
            VALUES (?, ?, ?)`,
            [nombre_item, description, cantidad_disponible]
        );

        res.status(201).json({
            success: true,
            message: 'Item creado exitosamente',
            id_item: result.insertId
        });
    } catch (error) {
        console.error('Error al crear item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear item'
        });
    }
};

// Actualizar item
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre_item, 
            description, 
            cantidad_disponible 
        } = req.body;

        // Verificar si el item existe
        const [existing] = await pool.execute(
            'SELECT id_item FROM inventario WHERE id_item = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }

        // Validar cantidad disponible
        if (cantidad_disponible < 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad disponible no puede ser negativa'
            });
        }

        await pool.execute(
            `UPDATE inventario 
            SET nombre_item = ?, description = ?, cantidad_disponible = ?
            WHERE id_item = ?`,
            [nombre_item, description, cantidad_disponible, id]
        );

        res.json({
            success: true,
            message: 'Item actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar item'
        });
    }
};

// Eliminar item
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el item existe
        const [existing] = await pool.execute(
            'SELECT id_item FROM inventario WHERE id_item = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }

        // Verificar si hay préstamos activos para este item
        const [prestamosActivos] = await pool.execute(
            'SELECT id_prestamo FROM prestamos WHERE id_item = ? AND estado = "activo"',
            [id]
        );

        if (prestamosActivos.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'No se puede eliminar el item porque tiene préstamos activos'
            });
        }

        await pool.execute(
            'DELETE FROM inventario WHERE id_item = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Item eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar item'
        });
    }
};

// Actualizar cantidad disponible
exports.updateCantidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { operacion, cantidad } = req.body;

        if (!['incrementar', 'decrementar'].includes(operacion)) {
            return res.status(400).json({
                success: false,
                message: 'Operación no válida. Use "incrementar" o "decrementar"'
            });
        }

        if (cantidad <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser mayor a 0'
            });
        }

        // Obtener cantidad actual
        const [items] = await pool.execute(
            'SELECT cantidad_disponible FROM inventario WHERE id_item = ?',
            [id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }

        let nuevaCantidad = items[0].cantidad_disponible;

        if (operacion === 'incrementar') {
            nuevaCantidad += cantidad;
        } else {
            nuevaCantidad -= cantidad;
            
            if (nuevaCantidad < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No hay suficiente cantidad disponible'
                });
            }
        }

        await pool.execute(
            'UPDATE inventario SET cantidad_disponible = ? WHERE id_item = ?',
            [nuevaCantidad, id]
        );

        res.json({
            success: true,
            message: `Cantidad ${operacion === 'incrementar' ? 'incrementada' : 'decrementada'} exitosamente`,
            nueva_cantidad: nuevaCantidad
        });
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar cantidad'
        });
    }
};

// Buscar items
exports.searchItems = async (req, res) => {
    try {
        const { query } = req.query;

        const [items] = await pool.execute(
            `SELECT * FROM inventario 
            WHERE nombre_item LIKE ? OR description LIKE ?
            ORDER BY nombre_item ASC`,
            [`%${query}%`, `%${query}%`]
        );

        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error al buscar items:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar items'
        });
    }
};