const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');

const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const swaggerSpecs = require('./docs/swagger');

const app = express();

app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a la API del Sistema de Gestión Escolar',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            alumnos: '/api/alumnos',
            inventario: '/api/inventario',
            prestamos: '/api/prestamos',
            usuarios: '/api/usuarios',
            documentation: '/api-docs'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'escuela-api'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;