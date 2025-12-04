const { pool } = require('../config/database');

// Obtener todos los usuarios (solo admin)
exports.getAllUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.execute(`
            SELECT id_usuario, username, created_at 
            FROM usuarios 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            count: usuarios.length,
            data: usuarios
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [usuarios] = await pool.execute(
            'SELECT id_usuario, username, created_at FROM usuarios WHERE id_usuario = ?',
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: usuarios[0]
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario'
        });
    }
};

// Actualizar usuario
exports.updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        // Verificar si el usuario existe
        const [existing] = await pool.execute(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el nuevo username ya existe
        if (username) {
            const [existingUsername] = await pool.execute(
                'SELECT id_usuario FROM usuarios WHERE username = ? AND id_usuario != ?',
                [username, id]
            );

            if (existingUsername.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'El nombre de usuario ya está en uso'
                });
            }
        }

        await pool.execute(
            'UPDATE usuarios SET username = ? WHERE id_usuario = ?',
            [username, id]
        );

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario'
        });
    }
};

// Eliminar usuario
exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir eliminar al usuario actual
        if (parseInt(id) === req.user.id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }

        // Verificar si el usuario existe
        const [existing] = await pool.execute(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        await pool.execute(
            'DELETE FROM usuarios WHERE id_usuario = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
};