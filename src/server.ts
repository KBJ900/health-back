import express from 'express';
import paymentLettersRoutes from "./routes/paymentLettersRoutes";
import patientsRoutes from "./routes/patientRoutes";
import doctorsRoutes from "./routes/doctorRoutes";
import insuranceCompanyRoutes from "./routes/insuranceCompanyRoutes";
import authRoutes from "./routes/authRoutes";
import webUserRoutes from "./routes/webUserRoutes";
import rolesRoutes from "./routes/rolesRoutes"; // Importar las rutas de Roles
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const app = express();
app.use(express.json());

// Configurar CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? 'https://mediclaim-a6331.web.app' : '*', // Permitir cualquier origen en desarrollo
  optionsSuccessStatus: 200, // Para soportar navegadores antiguos
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hola, mundo!');
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/paymentLetters', paymentLettersRoutes);
app.use('/api/users/patients', patientsRoutes);
app.use('/api/users/doctors', doctorsRoutes);
app.use('/api/companies', insuranceCompanyRoutes);
app.use('/api/webUsers', webUserRoutes);
app.use('/api/roles', rolesRoutes);

if (process.env.NODE_ENV === 'production') {
  // Leer los certificados SSL
  const sslOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../certificates/privkey.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../certificates/fullchain.pem')),
  };

  // Crear el servidor HTTPS
  const httpsServer = https.createServer(sslOptions, app);

  // Escuchar en el puerto 443 (HTTPS)
  httpsServer.listen(3000, () => {
    console.log('HTTPS Server running on port 443');
  });
} else {
  // Crear el servidor HTTP
  const httpServer = http.createServer(app);

  // Escuchar en el puerto 3000 (HTTP)
  httpServer.listen(3000, '192.168.100.5', () => {
    console.log('HTTP Server running on http://192.168.100.5:3000');
  });
}