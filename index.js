const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf');
const { check, validationResult } = require('express-validator');
const mysql = require('mysql2');

const app = express();
app.use(cors({
    origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'],
}

));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'junction.proxy.rlwy.net',
    user: 'root',
    password: 'GvpeoGkDtGbWGjDchFcwVzMFznHkSpvl',
    database: 'railway',
    port: 16571,

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
}); 







app.get('/personajes', (req, res) => {
    const query = 'SELECT * FROM animes';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err.message);
            return res.status(500).json({ mensaje: 'Error al obtener los datos.' });
            
        }
        results.forEach(personaje => {
            // Leer la imagen y convertirla en base64
            const imageData = fs.readFileSync(personaje.archivo, { encoding: 'base64' });
            const extname = path.extname(personaje.archivo).toLowerCase();
            let imageType = 'JPEG';
            if (extname === '.png') {
                imageType = 'PNG';
            } else if (extname === '.gif') {
                imageType = 'GIF';
            }

            personaje.archivo = `data:image/${imageType.toLowerCase()};base64,${imageData}`;
        });
        
  /*      const imgf=results[0];
        const imageData = fs.readFileSync(imgf.archivo, { encoding: 'base64' });
                const extname = path.extname(imgf.archivo).toLowerCase();
                let imageType = 'JPEG';               
                if (extname === '.png') {
                    imageType = 'PNG';
                } else if (extname === '.gif') {
                    imageType = 'GIF';
                }

                const imgData = `data:image/${imageType.toLowerCase()};base64,${imageData}`;
                results[0].archivo=imgData; */

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

            doc.setFillColor(0, 123, 255); // Fondo azul
            doc.rect(0, 0, 210, 20, 'F'); // Fondo para el título

            doc.setTextColor(255, 255, 255); // Texto blanco
            doc.setFontSize(16);
            doc.setFont("helvetica", "normal");  // Establece la fuente helvetica y el estilo normal
            doc.setFontSize(22);
            doc.text('Datos del Personaje Anime', 15, 20);

            doc.setTextColor(255, 0, 0);  // Rojo
            doc.setFont("helvetica", "italic"); // Cursiva
            doc.setFontSize(16);
            doc.text(`Datos Consultados`, 20, 40);
            doc.text(`Nombre: ${data.nombre}`, 20, 50);
            doc.text(`Anime: ${data.anime}`, 20, 60);

            doc.setLineWidth(0.5);
            doc.line(20, 100, 190, 150);

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

                const imgWidth = 100; // Ancho de la imagen
                const imgHeight = 100; // Altura de la imagen
                const pageWidth = doc.internal.pageSize.width; // Ancho total de la página
                const xPosition = (pageWidth - imgWidth) / 2;

                doc.addImage(imgData, imageType, xPosition, 130, imgWidth, imgHeight);

            }

            const pdfFolder = path.join(__dirname, 'archivosgen');
            if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder);

            const pdfPath = path.join(pdfFolder, `${data.nombre}-output.pdf`);

 
            doc.save(pdfPath);
           // const pdfOutput = doc.output();

          //  fs.writeFileSync(pdfPath, pdfOutput);

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





app.post('/actualizar-personaje', upload.single('archivo'), (req, res) => {
    const { nombre, anime } = req.body;
    const archivoNuevo = req.file ? req.file.path : null;  

    if (!nombre || !anime) {
        return res.status(400).json({ mensaje: 'El nombre y el anime son obligatorios.' });
    }

    
    let query = 'UPDATE animes SET nombre = ?, anime = ?';
    let queryParams = [nombre, anime];

    if (archivoNuevo) {
        query += ', archivo = ?';
        queryParams.push(archivoNuevo);
    }

    query += ' WHERE nombre = ?';
    queryParams.push(nombre);  
    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error('Error al actualizar los datos en la base de datos:', err.message);
            return res.status(500).json({ mensaje: 'Error al actualizar los datos.' });
        }

        res.status(200).json({ mensaje: 'Personaje actualizado correctamente.' });
    });
});





app.listen(3306, () => {
    console.log('Servidor corriendo en puerto 8081');
});
