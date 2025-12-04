const { pool } = require('../config/database');

// Obtener todos los préstamos
exports.getAllPrestamos = async (req, res) => {
    try {
        const [prestamos] = await pool.execute(`
            SELECT p.*, 
                   a.nombre as alumno_nombre, 
                   a.apellido as alumno_apellido,
                   i.nombre_item as item_nombre
            FROM prestamos p
            LEFT JOIN alumno a ON p.id_alumno = a.id_alumno
            LEFT JOIN inventario i ON p.id_item = i.id_item
            ORDER BY p.fecha_prestamo DESC
        `);

        res.json({
            success: true,
            count: prestamos.length,
            data: prestamos
        });
    } catch (error) {
        console.error('Error al obtener préstamos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener préstamos'
        });
    }
};

// Obtener préstamo por ID
exports.getPrestamoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [prestamos] = await pool.execute(
            `SELECT p.*, 
                    a.nombre as alumno_nombre, 
                    a.apellido as alumno_apellido,
                    a.num_control,
                    i.nombre_item as item_nombre,
                    i.description as item_descripcion
            FROM prestamos p
            LEFT JOIN alumno a ON p.id_alumno = a.id_alumno
            LEFT JOIN inventario i ON p.id_item = i.id_item
            WHERE p.id_prestamo = ?`,
            [id]
        );

        if (prestamos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Préstamo no encontrado'
            });
        }

        res.json({
            success: true,
            data: prestamos[0]
        });
    } catch (error) {
        console.error('Error al obtener préstamo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener préstamo'
        });
    }
};

// Crear nuevo préstamo
exports.createPrestamo = async (req, res) => {
    try {
        const { id_alumno, id_item } = req.body;

        // Verificar si el alumno existe
        const [alumno] = await pool.execute(
            'SELECT id_alumno FROM alumno WHERE id_alumno = ?',
            [id_alumno]
        );

        if (alumno.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        // Verificar si el item existe y tiene disponibilidad
        const [item] = await pool.execute(
            'SELECT id_item, cantidad_disponible FROM inventario WHERE id_item = ?',
            [id_item]
        );

        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }

        if (item[0].cantidad_disponible <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Item no disponible para préstamo'
            });
        }

        // Crear el préstamo
        const [result] = await pool.execute(
            `INSERT INTO prestamos (id_alumno, id_item, estado) 
            VALUES (?, ?, 'activo')`,
            [id_alumno, id_item]
        );

        // Actualizar cantidad disponible del item
        await pool.execute(
            'UPDATE inventario SET cantidad_disponible = cantidad_disponible - 1 WHERE id_item = ?',
            [id_item]
        );

        res.status(201).json({
            success: true,
            message: 'Préstamo creado exitosamente',
            id_prestamo: result.insertId
        });
    } catch (error) {
        console.error('Error al crear préstamo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear préstamo'
        });
    }
};

// Devolver préstamo
exports.devolverPrestamo = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el préstamo existe y está activo
        const [prestamo] = await pool.execute(
            `SELECT p.*, i.id_item 
            FROM prestamos p
            LEFT JOIN inventario i ON p.id_item = i.id_item
            WHERE p.id_prestamo = ? AND p.estado = 'activo'`,
            [id]
        );

        if (prestamo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Préstamo activo no encontrado'
            });
        }

        // Actualizar préstamo
        await pool.execute(
            `UPDATE prestamos 
            SET estado = 'devuelto', fecha_devolucion = CURRENT_TIMESTAMP 
            WHERE id_prestamo = ?`,
            [id]
        );

        // Actualizar cantidad disponible del item
        await pool.execute(
            'UPDATE inventario SET cantidad_disponible = cantidad_disponible + 1 WHERE id_item = ?',
            [prestamo[0].id_item]
        );

        res.json({
            success: true,
            message: 'Préstamo devuelto exitosamente'
        });
    } catch (error) {
        console.error('Error al devolver préstamo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al devolver préstamo'
        });
    }
};

// Obtener préstamos por alumno
exports.getPrestamosByAlumno = async (req, res) => {
    try {
        const { id_alumno } = req.params;

        const [prestamos] = await pool.execute(
            `SELECT p.*, i.nombre_item as item_nombre
            FROM prestamos p
            LEFT JOIN inventario i ON p.id_item = i.id_item
            WHERE p.id_alumno = ?
            ORDER BY p.fecha_prestamo DESC`,
            [id_alumno]
        );

        res.json({
            success: true,
            count: prestamos.length,
            data: prestamos
        });
    } catch (error) {
        console.error('Error al obtener préstamos del alumno:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener préstamos del alumno'
        });
    }
};

// Obtener préstamos por item
exports.getPrestamosByItem = async (req, res) => {
    try {
        const { id_item } = req.params;

        const [prestamos] = await pool.execute(
            `SELECT p.*, 
                    a.nombre as alumno_nombre, 
                    a.apellido as alumno_apellido,
                    a.num_control
            FROM prestamos p
            LEFT JOIN alumno a ON p.id_alumno = a.id_alumno
            WHERE p.id_item = ?
            ORDER BY p.fecha_prestamo DESC`,
            [id_item]
        );

        res.json({
            success: true,
            count: prestamos.length,
            data: prestamos
        });
    } catch (error) {
        console.error('Error al obtener préstamos del item:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener préstamos del item'
        });
    }
};

// Obtener préstamos activos
exports.getPrestamosActivos = async (req, res) => {
    try {
        const [prestamos] = await pool.execute(
            `SELECT p.*, 
                    a.nombre as alumno_nombre, 
                    a.apellido as alumno_apellido,
                    i.nombre_item as item_nombre
            FROM prestamos p
            LEFT JOIN alumno a ON p.id_alumno = a.id_alumno
            LEFT JOIN inventario i ON p.id_item = i.id_item
            WHERE p.estado = 'activo'
            ORDER BY p.fecha_prestamo DESC`
        );

        res.json({
            success: true,
            count: prestamos.length,
            data: prestamos
        });
    } catch (error) {
        console.error('Error al obtener préstamos activos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener préstamos activos'
        });
    }
};

// Obtener estadísticas de préstamos
exports.getEstadisticas = async (req, res) => {
    try {
        const [totalPrestamos] = await pool.execute(
            'SELECT COUNT(*) as total FROM prestamos'
        );

        const [prestamosActivos] = await pool.execute(
            'SELECT COUNT(*) as activos FROM prestamos WHERE estado = "activo"'
        );

        const [prestamosDevueltos] = await pool.execute(
            'SELECT COUNT(*) as devueltos FROM prestamos WHERE estado = "devuelto"'
        );

        const [itemsMasPrestados] = await pool.execute(`
            SELECT i.nombre_item, COUNT(p.id_prestamo) as veces_prestado
            FROM prestamos p
            LEFT JOIN inventario i ON p.id_item = i.id_item
            GROUP BY p.id_item
            ORDER BY veces_prestado DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                total: totalPrestamos[0].total,
                activos: prestamosActivos[0].activos,
                devueltos: prestamosDevueltos[0].devueltos,
                items_mas_prestados: itemsMasPrestados
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};