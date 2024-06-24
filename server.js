const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Parser } = require('json2csv');
const json2xml = require('json2xml');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/convert/csv', (req, res) => {
    try {
        const json = req.body;
        const parser = new Parser();
        const csv = parser.parse(json);

        const filePath = path.join(__dirname, 'output.csv');
        fs.writeFileSync(filePath, csv);
        res.download(filePath, 'output.csv', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            }
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.error('Error converting to CSV:', err);
        res.status(500).send('Error converting to CSV');
    }
});

app.post('/convert/xml', (req, res) => {
    try {
        const json = req.body;
        const xml = json2xml(json);

        const filePath = path.join(__dirname, 'output.xml');
        fs.writeFileSync(filePath, xml);
        res.download(filePath, 'output.xml', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            }
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.error('Error converting to XML:', err);
        res.status(500).send('Error converting to XML');
    }
});

app.post('/convert/pdf', (req, res) => {
    try {
        const json = req.body;
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, 'output.pdf');
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const jsonString = JSON.stringify(json, null, 2);
        const lines = jsonString.split('\n');

        lines.forEach(line => {
            doc.text(line, {
                width: 410,
                align: 'left'
            });
        });

        doc.end();

        stream.on('finish', () => {
            res.download(filePath, 'output.pdf', (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).send('Error downloading file');
                }
                fs.unlinkSync(filePath);
            });
        });
    } catch (err) {
        console.error('Error converting to PDF:', err);
        res.status(500).send('Error converting to PDF');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
