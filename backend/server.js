const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Load database connection
const db = require('./src/database');

// Register route
app.post('/register', (req, res) => {
  const { username, email, pwd } = req.body;
  
  // Call Lumx API
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicHJvamVjdElkIjoiMDdkOTI2N2ItMGMyNS00NmUxLTgxMmQtYzM3NDUyZjZkOGJkIiwic2NvcGVzIjpbIlJFQURfV0FMTEVUUyIsIlJFQURfQ09OVFJBQ1RTIiwiUkVBRF9UT0tFTl9UWVBFUyIsIlJFQURfVFJBTlNBQ1RJT05TIiwiREVQTE9ZX0NPTlRSQUNUUyIsIldSSVRFX0NPTlRSQUNUUyIsIldSSVRFX0NVU1RPTV9UUkFOU0FDVElPTlMiLCJXUklURV9NSU5UUyIsIldSSVRFX01JTlRTIiwiV1JJVEVfVE9LRU5fVFlQRVMiLCJXUklURV9UUkFOU0ZFUlMiLCJXUklURV9XQUxMRVRTIl0sImlhdCI6MTcxNDg1NTA0MX0.Y-Fa0FM5GvE98rtDHS7Xniz49uWoYFyRLWRV8A4awDQkITKZOZMAJDo8q0cXiY0hpNz5Og2ZWaLxurmxuLIIAkDOxU9N3Rtq1ys2xzEpvHHsCQWiqLyz_YMRsDHzJQ6LVIhYuPIv5aUzav-RaLWS-1hmKMktjp1dqP9GDgeL36s0hH7tmpvH03qYiKOiKa8QPOndZYvD_YSK70QN9gnidSVKYc7G9B07RmvGdE0JZ5llhXv-945tQh1BYC6dGf9wxPgnfqSJzotT3yaJ8HMG1LDQgpcy-4UjbQdY2GGluMSwzuIsPzkECcA0_M3IsdqfgBJIgn3OP4heF3QAGZrwJOuWBPB_C8i0YqvWIakugWYA2xr8jyH0OXTl_B29HT9pNIo9oTW9l3Rv12TKqHWB8noJw4ErV5m7VfuY9MlKfEB5YstYTdfOFJ5WUBBU3-bDUzgA2DwRUehGPG4y75WvRhdOD-tOaB7NQxUkxW3xeEGgB840V2q7wP4s1yRds44wTOGHPbD_SIYUC0m4Ublmp5akTfyT8YpgUj0iRPYLjeHfnHHG3KHRJwQI-FTuCn1kOA6N4Y95kX0vkxCRZop2e-96KmRrZ4mP5YnYT766wOykN8fTfiz9CvcZzs9_8JZvQO6JH2euNIsHCaFgbBus5R6WAxqsimd3mJq9EaNkMOw'
    }
  };
  
  fetch('https://protocol-sandbox.lumx.io/v2/wallets', options)

  .then(response => response.json())

  .then(data => {
    // Insert user into database
    const query = `
    INSERT INTO clientes (username, email, senha, id_lumx, wallet_address)
    VALUES (?, ?, ?, ?, ?)
    `;
    const params = [username, email, pwd, data.id, data.address];

    db.run(query, params, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error registering user');
      } else {
        res.send(data.id);
      }
    });
  })

  // .then(() => {
  //   const query = 'SELECT * FROM clientes';
  //   db.all(query, [], (err, rows) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send('Error fetching users');
  //     } else {
  //       console.log('Users:', rows);
  //       res.json(rows);
  //     }
  //   });
  // })

  .catch(err => {
    console.error(err);
    res.status(500).send('Error registering user');
  });
});

// Check register route
app.post('/checkregister', (req, res) => {
  const { email, username } = req.body;

  const query = `
    SELECT * FROM clientes WHERE email = ? OR username = ?
  `;
  const params = [email, username];

  db.get(query, params, (err, row) => {
    if (err) {
      console.error(err);
      res.send(false);
    } else if (row) {
      if (row.email === email) {
        res.send('email');
      } else {
        res.send('username');
      }
    } else {
      res.send(false);
    }
  });
});

// Check user route
app.post('/checkuser', (req, res) => {
  const { user } = req.body;

  const query = `
    SELECT * FROM clientes WHERE email = ? OR username = ?
  `;
  const params = [user, user];

  db.get(query, params, (err, row) => {
    if (err) {
      console.error(err);
      res.send(false);
    } else if (row) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});

app.post('/getinfo', (req, res) => {
  const { user } = req.body;

  const query = `
    SELECT username, email, id_lumx, wallet_address FROM clientes WHERE email = ? OR username = ?
  `;
  const params = [user, user];

  db.get(query, params, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else if (row) {
      res.send(row);
    } else {
      res.send({});
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log('Backend is running...');
});