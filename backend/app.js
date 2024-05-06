const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const db = new sqlite3.Database('./base.db');

db.run("CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(30), senha VARCHAR(24), id_lumx VARCHAR(40))", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Created the clientes table.');
});

const options = {method: 'POST', headers: {Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicHJvamVjdElkIjoiMDdkOTI2N2ItMGMyNS00NmUxLTgxMmQtYzM3NDUyZjZkOGJkIiwic2NvcGVzIjpbIlJFQURfV0FMTEVUUyIsIlJFQURfQ09OVFJBQ1RTIiwiUkVBRF9UT0tFTl9UWVBFUyIsIlJFQURfVFJBTlNBQ1RJT05TIiwiREVQTE9ZX0NPTlRSQUNUUyIsIldSSVRFX0NPTlRSQUNUUyIsIldSSVRFX0NVU1RPTV9UUkFOU0FDVElPTlMiLCJXUklURV9NSU5UUyIsIldSSVRFX01JTlRTIiwiV1JJVEVfVE9LRU5fVFlQRVMiLCJXUklURV9UUkFOU0ZFUlMiLCJXUklURV9XQUxMRVRTIl0sImlhdCI6MTcxNDg1NTA0MX0.Y-Fa0FM5GvE98rtDHS7Xniz49uWoYFyRLWRV8A4awDQkITKZOZMAJDo8q0cXiY0hpNz5Og2ZWaLxurmxuLIIAkDOxU9N3Rtq1ys2xzEpvHHsCQWiqLyz_YMRsDHzJQ6LVIhYuPIv5aUzav-RaLWS-1hmKMktjp1dqP9GDgeL36s0hH7tmpvH03qYiKOiKa8QPOndZYvD_YSK70QN9gnidSVKYc7G9B07RmvGdE0JZ5llhXv-945tQh1BYC6dGf9wxPgnfqSJzotT3yaJ8HMG1LDQgpcy-4UjbQdY2GGluMSwzuIsPzkECcA0_M3IsdqfgBJIgn3OP4heF3QAGZrwJOuWBPB_C8i0YqvWIakugWYA2xr8jyH0OXTl_B29HT9pNIo9oTW9l3Rv12TKqHWB8noJw4ErV5m7VfuY9MlKfEB5YstYTdfOFJ5WUBBU3-bDUzgA2DwRUehGPG4y75WvRhdOD-tOaB7NQxUkxW3xeEGgB840V2q7wP4s1yRds44wTOGHPbD_SIYUC0m4Ublmp5akTfyT8YpgUj0iRPYLjeHfnHHG3KHRJwQI-FTuCn1kOA6N4Y95kX0vkxCRZop2e-96KmRrZ4mP5YnYT766wOykN8fTfiz9CvcZzs9_8JZvQO6JH2euNIsHCaFgbBus5R6WAxqsimd3mJq9EaNkMOw'}};

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173', // Change this to your frontend origin
    credentials: true // Enable credentials (cookies, authorization headers, etc.)
  };
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.post('/already', (req, res) => {
  // Extrair os dados do corpo da requisição
  const { email } = req.body;

  db.get("SELECT email FROM clientes WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error(err.message);
    } 
    if (row) {
        res.send(row); 
    } else {
        res.send(false);
    };
  });
});

app.post('/register', (req, res) => {
    // Extrair os dados do corpo da requisição
    const { email, pwd } = req.body;

    let jsonData; // Variável externa para armazenar os dados JSON

    // Mandar post pra API da Lumx
    fetch('https://protocol-sandbox.lumx.io/v2/wallets', options)
        .then(response => response.json())
        .then(data => {
            jsonData = data;

            db.run("INSERT INTO clientes (email, senha, id_lumx) VALUES (?, ?, ?)", [email, pwd, jsonData.id], function(err) {
                if (err) {
                  return console.error(err.message);
                }
                console.log();
              });

            res.send(jsonData.id); 
        })
        .catch(err => console.error(err));
});

app.get('/', (req, res) => {
  res.send('Welcome to the root URL!');
});

app.post('/authorize', (req, res) => {
  // Extrair os dados do corpo da requisição
  const { email, pwd } = req.body;

  // Conferir se o email e a senha batem na db

    db.run("SELECT * FROM clientes WHERE email = ? AND senha = ?", [email, pwd], (err, row) => {
        if (err) {
          return console.error(err.message);
        }     
        if (row) {
          res.send(true); 
        } else {
          // Não foram encontrados o email e a senha na base de dados
          res.send(false);
        }
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
