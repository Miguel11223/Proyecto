const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf');
const { check, validationResult } = require('express-validator');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'anime_db',
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos.');
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = path.join(__dirname, 'archivos');
        if (!fs.existsSync(folder)) fs.mkdirSync(folder);
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif).'));
    },
    limits: { fileSize: 5 * 1024 * 1024 }, 
});

const validateForm = [
    check('nombre').notEmpty().withMessage('El nombre es obligatorio.'),
    check('anime').notEmpty().withMessage('El anime es obligatorio.'),
];



/* 
app.post('/formulario', upload.single('archivo'), validateForm, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    try {
        const { nombre, anime } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No se subió un archivo o el archivo no es válido.' });
        }

        const archivoPath = req.file.path;

        if (!fs.existsSync(archivoPath)) {
            return res.status(400).json({ error: 'El archivo no existe en la ruta especificada.' });
        }

        const query = 'INSERT INTO animes (nombre, anime, archivo) VALUES (?, ?, ?)';
        db.query(query, [nombre, anime, archivoPath], (err, result) => {
            if (err) {
                console.error('Error al guardar los datos en la base de datos:', err.message);
                return res.status(500).send('Error al guardar los datos en la base de datos.');
            }

            res.status(200).json({ mensaje: 'Formulario guardado correctamente.' });
        });
    } catch (error) {
        console.error('Error al procesar el formulario:', error.message);
        res.status(500).send('Error al procesar el formulario.');
    }
});  */




app.post('/formulario', upload.single('archivo'), validateForm, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    try {
        const { nombre, anime } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No se subió un archivo o el archivo no es válido.' });
        }

        const archivoPath = req.file.path;

        if (!fs.existsSync(archivoPath)) {
            return res.status(400).json({ error: 'El archivo no existe en la ruta especificada.' });
        }

        const imageBuffer = fs.readFileSync(archivoPath);
        const imageBase64 = imageBuffer.toString('base64');

        const query = 'INSERT INTO animes (nombre, anime, archivo) VALUES (?, ?, ?)';
        db.query(query, [nombre, anime, imageBase64], (err, result) => {
            if (err) {
                console.error('Error al guardar los datos en la base de datos:', err.message);
                return res.status(500).send('Error al guardar los datos en la base de datos.');
            }

            res.status(200).json({ mensaje: 'Formulario guardado correctamente.' });
        });
    } catch (error) {
        console.error('Error al procesar el formulario:', error.message);
        res.status(500).send('Error al procesar el formulario.');
    }
}); 





app.get('/personajes', (req, res) => {
    const query = 'SELECT * FROM animes';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err.message);
            return res.status(500).json({ mensaje: 'Error al obtener los datos.' });
        }

        res.status(200).json(results);
    });
});




app.delete('/eliminar', (req, res) => {
    const { nombre } = req.query;

    const query = 'DELETE FROM animes WHERE nombre = ?';
    db.query(query, [nombre], (err, result) => {
        if (err) {
            console.error('Error al eliminar el personaje:', err.message);
            return res.status(500).json({ mensaje: 'Error al eliminar el personaje.' });
        }

        res.status(200).json({ mensaje: 'Personaje eliminado correctamente.' });
    });
});




app.get('/consulta-pdf', async (req, res) => {
     const { nombre } = req.query; 
  
    if (!nombre) {
        return res.status(400).json({ error: 'El parámetro "nombre" es obligatorio.' });
    }

    const query = 'SELECT * FROM animes WHERE nombre = ?';
    db.query(query, [nombre], (err, results) => {
        if (err) {
            console.error('Error al realizar la consulta:', err.message);
            return res.status(500).json({ error: 'Error al realizar la consulta.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para el nombre proporcionado.' });
        }

        try {
            const data = results[0];
            const doc = new jsPDF();

            doc.text(`Datos Consultados`, 10, 10);
            doc.text(`Nombre: ${data.nombre}`, 10, 20);
            doc.text(`Anime: ${data.anime}`, 10, 30);

            if (data.archivo) {
                const imageData = fs.readFileSync(data.archivo, { encoding: 'base64' });
                const extname = path.extname(data.archivo).toLowerCase();
                let imageType = 'JPEG';               
                if (extname === '.png') {
                    imageType = 'PNG';
                } else if (extname === '.gif') {
                    imageType = 'GIF';
                }

                const imgData = `data:image/${imageType.toLowerCase()};base64,${imageData}`;
                doc.addImage(imgData, imageType, 10, 40, 100, 100);


            }

            const pdfFolder = path.join(__dirname, 'archivosgen');
            if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder);

            const pdfPath = path.join(pdfFolder, `${data.nombre}-output.pdf`);
            const pdfOutput = doc.output();

            fs.writeFileSync(pdfPath, pdfOutput);

            res.sendFile(pdfPath, (err) => {
                if (err) {
                    console.error('Error al enviar el PDF:', err.message);
                    return res.status(500).send('Error al enviar el PDF.');
                }

                fs.unlink(pdfPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error al eliminar el archivo PDF:', unlinkErr.message);
                    }
                });
            });
        } catch (error) {
            console.error('Error al generar el PDF de la consulta:', error.message);
            res.status(500).send('Error al generar el PDF.');
        }
    });
}); 



app.get('/consulta-pdf', async (req, res) => {
    const { nombre } = req.query; 
    if (!nombre) {
        return res.status(400).json({ error: 'El parámetro "nombre" es obligatorio.' });
    }

    const query = 'SELECT * FROM animes WHERE nombre = ?';
    db.query(query, [nombre], (err, results) => {
        if (err) {
            console.error('Error al realizar la consulta:', err.message);
            return res.status(500).json({ error: 'Error al realizar la consulta.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para el nombre proporcionado.' });
        }

        try {
            const data = results[0];
            const doc = new jsPDF();

            doc.text(`Datos Consultados`, 10, 10);
            doc.text(`Nombre: ${data.nombre}`, 10, 20);
            doc.text(`Anime: ${data.anime}`, 10, 30);

            if (data.archivo) {
                const imageData = fs.readFileSync(data.archivo, { encoding: 'base64' });
                const extname = path.extname(data.archivo).toLowerCase();
                let imageType = 'JPEG';               
                if (extname === '.png') {
                    imageType = 'PNG';
                } else if (extname === '.gif') {
                    imageType = 'GIF';
                }

                const imgData = `data:image/${imageType.toLowerCase()};base64,${imageData}`;
                doc.addImage(imgData, imageType, 10, 40, 100, 100);
            }

            const pdfFolder = path.join(__dirname, 'archivosgen');
            if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder);

            // En lugar de output, usamos save para guardar el archivo
            const pdfPath = path.join(pdfFolder, `${data.nombre}-output.pdf`);

            // El método save guardará el archivo en el disco directamente
            doc.save(pdfPath, { returnPromise: true }).then(() => {
                // Enviar el archivo PDF al cliente
                res.sendFile(pdfPath, (err) => {
                    if (err) {
                        console.error('Error al enviar el PDF:', err.message);
                        return res.status(500).send('Error al enviar el PDF.');
                    }

                    // Eliminar el archivo después de enviarlo
                    fs.unlink(pdfPath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Error al eliminar el archivo PDF:', unlinkErr.message);
                        }
                    });
                });
            }).catch((saveErr) => {
                console.error('Error al guardar el PDF:', saveErr.message);
                res.status(500).send('Error al generar el PDF.');
            });
        } catch (error) {
            console.error('Error al generar el PDF de la consulta:', error.message);
            res.status(500).send('Error al generar el PDF.');
        }
    });
}); 



app.listen(8080, () => {
    console.log('Servidor corriendo en puerto 8080');
});
