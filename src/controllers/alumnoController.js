const { pool } = require('../config/database');

// Obtener todos los alumnos
exports.getAllAlumnos = async (req, res) => {
    try {
        const [alumnos] = await pool.execute(`
            SELECT * FROM alumno 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            count: alumnos.length,
            data: alumnos
        });
    } catch (error) {
        console.error('Error al obtener alumnos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alumnos'
        });
    }
};

// Obtener alumno por ID
exports.getAlumnoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [alumnos] = await pool.execute(
            'SELECT * FROM alumno WHERE id_alumno = ?',
            [id]
        );

        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        res.json({
            success: true,
            data: alumnos[0]
        });
    } catch (error) {
        console.error('Error al obtener alumno:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alumno'
        });
    }
};

// Crear nuevo alumno
exports.createAlumno = async (req, res) => {
    try {
        const { 
            nombre, 
            apellido, 
            email, 
            semestre, 
            num_control, 
            carrera 
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO alumno 
            (nombre, apellido, email, semestre, num_control, carrera) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, email, semestre, num_control, carrera]
        );

        res.status(201).json({
            success: true,
            message: 'Alumno creado exitosamente',
            id_alumno: result.insertId
        });
    } catch (error) {
        console.error('Error al crear alumno:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear alumno'
        });
    }
};

// Actualizar alumno
exports.updateAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre, 
            apellido, 
            email, 
            semestre, 
            num_control, 
            carrera 
        } = req.body;

        // Verificar si el alumno existe
        const [existing] = await pool.execute(
            'SELECT id_alumno FROM alumno WHERE id_alumno = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        await pool.execute(
            `UPDATE alumno 
            SET nombre = ?, apellido = ?, email = ?, 
                semestre = ?, num_control = ?, carrera = ? 
            WHERE id_alumno = ?`,
            [nombre, apellido, email, semestre, num_control, carrera, id]
        );

        res.json({
            success: true,
            message: 'Alumno actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar alumno:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar alumno'
        });
    }
};

// Eliminar alumno
exports.deleteAlumno = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el alumno existe
        const [existing] = await pool.execute(
            'SELECT id_alumno FROM alumno WHERE id_alumno = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        await pool.execute(
            'DELETE FROM alumno WHERE id_alumno = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Alumno eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar alumno:', error);
        
        // Verificar si hay préstamos asociados
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'No se puede eliminar el alumno porque tiene préstamos asociados'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar alumno'
        });
    }
};

// Buscar alumnos
exports.searchAlumnos = async (req, res) => {
    try {
        const { query } = req.query;

        const [alumnos] = await pool.execute(
            `SELECT * FROM alumno 
            WHERE nombre LIKE ? OR apellido LIKE ? OR email LIKE ? 
            OR num_control LIKE ? OR carrera LIKE ?
            ORDER BY nombre ASC`,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
        );

        res.json({
            success: true,
            count: alumnos.length,
            data: alumnos
        });
    } catch (error) {
        console.error('Error al buscar alumnos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar alumnos'
        });
    }
};