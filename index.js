const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.post('/run', (req, res) => {
    const { code, language } = req.body;

    switch (language) {
        case 'javascript':
            exec(`node -e "${code.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
                if (err) {
                    return res.json({ output: stderr || 'Error occurred' });
                }
                res.json({ output: stdout });
            });
            break;

        case 'python':
            fs.writeFileSync('temp.py', code);
            exec('python temp.py', (err, stdout, stderr) => {
                fs.unlinkSync('temp.py');
                if (err) {
                    return res.json({ output: stderr || 'Error occurred' });
                }
                res.json({ output: stdout });
            });
            break;

        case 'java':
            const javaFile = 'Temp.java';
            fs.writeFileSync(javaFile, code);
            exec(`javac ${javaFile}`, (err) => {
                if (err) {
                    fs.unlinkSync(javaFile); // Clean up Java file
                    return res.json({ output: err.stderr || 'Compilation error' });
                }

                exec(`java Temp`, (err, stdout, stderr) => {
                    fs.unlinkSync(javaFile);
                    if (fs.existsSync('Temp.class')) {
                        fs.unlinkSync('Temp.class');
                    }
                    if (err) {
                        return res.json({ output: stderr || 'Error occurred' });
                    }
                    res.json({ output: stdout });
                });
            });
            break;

        case 'c':
            const cFile = 'temp.c';
            fs.writeFileSync(cFile, code);
            exec(`gcc ${cFile} -o temp && ./temp`, (err, stdout, stderr) => {
                fs.unlinkSync(cFile);
                fs.unlinkSync('temp');
                if (err) {
                    return res.json({ output: stderr || 'Error occurred' });
                }
                res.json({ output: stdout });
            });
            break;

        default:
            res.status(400).json({ error: 'Unsupported language' });
            break;
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
