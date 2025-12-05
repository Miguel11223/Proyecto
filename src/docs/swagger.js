const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Sistema de Gestión Escolar',
            version: '1.0.0',
            description: 'API RESTful para gestión de alumnos, inventario y préstamos en una institución educativa',
            contact: {
                name: 'Desarrollador',
                email: 'developer@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'https://proyecto-le7b.onrender.com',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Introduce el token JWT con el prefijo Bearer'
                }
            },
            schemas: {
                Alumno: {
                    type: 'object',
                    required: ['nombre', 'apellido', 'semestre', 'carrera'],
                    properties: {
                        id_alumno: {
                            type: 'integer',
                            description: 'ID único del alumno'
                        },
                        nombre: {
                            type: 'string',
                            description: 'Nombre del alumno'
                        },
                        apellido: {
                            type: 'string',
                            description: 'Apellido del alumno'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Correo electrónico del alumno'
                        },
                        semestre: {
                            type: 'string',
                            description: 'Semestre que cursa el alumno'
                        },
                        num_control: {
                            type: 'string',
                            description: 'Número de control del alumno'
                        },
                        carrera: {
                            type: 'string',
                            description: 'Carrera que estudia el alumno'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación del registro'
                        }
                    }
                },
                Item: {
                    type: 'object',
                    required: ['nombre_item', 'cantidad_disponible'],
                    properties: {
                        id_item: {
                            type: 'integer',
                            description: 'ID único del item'
                        },
                        nombre_item: {
                            type: 'string',
                            description: 'Nombre del item'
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción detallada del item'
                        },
                        cantidad_disponible: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Cantidad disponible para préstamo'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación del registro'
                        }
                    }
                },
                Prestamo: {
                    type: 'object',
                    required: ['id_alumno', 'id_item'],
                    properties: {
                        id_prestamo: {
                            type: 'integer',
                            description: 'ID único del préstamo'
                        },
                        id_alumno: {
                            type: 'integer',
                            description: 'ID del alumno que realiza el préstamo'
                        },
                        id_item: {
                            type: 'integer',
                            description: 'ID del item prestado'
                        },
                        fecha_prestamo: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha en que se realizó el préstamo'
                        },
                        fecha_devolucion: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha en que se devolvió el item'
                        },
                        estado: {
                            type: 'string',
                            enum: ['activo', 'devuelto'],
                            description: 'Estado actual del préstamo'
                        }
                    }
                },
                Usuario: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        id_usuario: {
                            type: 'integer',
                            description: 'ID único del usuario'
                        },
                        username: {
                            type: 'string',
                            description: 'Nombre de usuario para login'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Contraseña encriptada'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación del usuario'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            description: 'Descripción del error'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            description: 'Mensaje de éxito'
                        },
                        data: {
                            type: 'object',
                            description: 'Datos de respuesta'
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Token de acceso no proporcionado o inválido',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Token de autenticación requerido'
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'No tiene permisos para acceder al recurso',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Se requieren privilegios de administrador'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Recurso no encontrado',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Recurso no encontrado'
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Error de validación de datos',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                success: false,
                                message: 'Error de validación',
                                errors: [
                                    {
                                        msg: 'El nombre es requerido',
                                        param: 'nombre',
                                        location: 'body'
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Autenticación',
                description: 'Endpoints para autenticación de usuarios'
            },
            {
                name: 'Alumnos',
                description: 'Gestión de alumnos del sistema'
            },
            {
                name: 'Inventario',
                description: 'Gestión de items del inventario'
            },
            {
                name: 'Préstamos',
                description: 'Gestión de préstamos de items'
            },
            {
                name: 'Usuarios',
                description: 'Gestión de usuarios del sistema (Admin)'
            }
        ]
    },
    apis: [
        './src/routes/*.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;