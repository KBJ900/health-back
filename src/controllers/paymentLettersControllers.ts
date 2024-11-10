import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from '../../awsConfig';
import { PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';
import { Console } from 'console';

const prisma = new PrismaClient();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar el tamaño del archivo a 10MB
}).single('urlFile'); // Solo un archivo llamado 'urlFile'

const uploadFileToS3 = async (file: Express.Multer.File, uid: string) => {
  const fileName = `${uuidv4()}-${file.originalname}`;
  const key = `${uid}/${fileName}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return key; // Return the key instead of the full URL
};

const generatePresignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL válida por 1 hora
  return url;
};

/**
 * @route GET /api/doctors
 * @desc Get all doctors
 * @access Public
 */

export const getAllPaymentLetters = async (req: Request, res: Response) => {
  try {
    const paymentLetters = await prisma.paymentLetters.findMany({
      include: {
        patient: true, // Incluye todos los datos del paciente
        doctor: true, // Incluye todos los datos de los doctores
        insuranceCompany: true, // Incluye todos los datos de la compañía de seguros
      },
    });

    // Generar URLs pre-firmadas para cada archivo
    const paymentLettersWithUrls = await Promise.all(paymentLetters.map(async (letter) => {
      if (letter.urlFile) {
        letter.urlFile = await generatePresignedUrl(letter.urlFile);
      }
      return letter;
    }));
    console.log("paymentLettersWithUrls",paymentLettersWithUrls);
    res.json(paymentLettersWithUrls);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener PaymentLetters:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const getPaymentLettersByDoctorId = async (req: Request, res: Response) => {
  const { doctor_id } = req.params;

  try {
    const paymentLetters = await prisma.paymentLetters.findMany({
      where: {
        doctor_id: Number(doctor_id),
      },
      include: {
        patient: true, // Incluye todos los datos del paciente
        doctor: true, // Incluye todos los datos del doctor
        insuranceCompany: true, // Incluye todos los datos de la compañía de seguros
      },
    });

    if (paymentLetters.length === 0) {
      console.log(`No se encontraron PaymentLetters para el doctor_id: ${doctor_id}`);
    }

    res.json(paymentLetters);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener PaymentLetters:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Error desconocido al obtener PaymentLetters');
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/**
 * @route POST /api/doctors
 * @desc Create a new doctor profile*/
export const createPaymentLetter = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ error: "Error al subir el archivo" });
    }

    try {
      const {
        letter_number,
        doctor_id,
        insurance_id,
        patient_id,
        service_date,
        status,
        total_commission,
      } = req.body;

      // Obtener el archivo subido
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No se ha subido ningún archivo" });
      }

      // Subir el archivo a S3
      const fileKey = await uploadFileToS3(file, uuidv4());

      // Crear la carta de pago en la base de datos
      const newPaymentLetter = await prisma.paymentLetters.create({
        data: {
          letter_number,
          doctor_id: parseInt(doctor_id, 10),
          insurance_id: parseInt(insurance_id, 10),
          patient_id: parseInt(patient_id, 10),
          service_date: new Date(service_date),
          status,
          total_commission: parseFloat(total_commission),
          urlFile: fileKey,
        },
      });

      res.json(newPaymentLetter);
    } catch (error) {
      console.error("Error al crear la carta de pago:", error); // Print error to console
      res.status(500).json({ error: "Error al crear la carta de pago" });
    }
  });
};
/**
 * @route GET /api/doctors/:uid
 * @desc Get a doctor profile
 */
export const getPaymentLetter = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const paymentLetter = await prisma.paymentLetters.findUnique({
      where: {
        payment_letter_id: parseInt(uid, 10), // Convert uid to number
      },
      include: {
        doctor: true,
        insuranceCompany: true,
        patient: true,
        Services: true,
        Payments: true,
        Commissions: true,
      },
    });

    if (paymentLetter) {
      // Generar URL pre-firmada para el archivo
      if (paymentLetter.urlFile) {
        paymentLetter.urlFile = await generatePresignedUrl(paymentLetter.urlFile);
      }
      console.log("paymentLetter",paymentLetter);
      return res.json(paymentLetter);
    } else {
      res.status(404).json({ error: "Factura no encontrada" });
    }
  } catch (error) {
    console.error(error); // Imprime el error en la consola
    res.status(500).json({ 
      error: "Error al obtener la factura", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};

/**
 * @route PUT /api/doctors/:uid
 * @desc Update a payment letter
 */
export const updatePaymentLetter = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ error: "Error al subir el archivo" });
    }

    try {
      const { uid } = req.params;
      const {
        letter_number,
        doctor_id,
        insurance_id,
        patient_id,
        service_date,
        status,
        total_commission,
      } = req.body;

      // Construir el objeto data dinámicamente
      const data: any = {};
      if (letter_number !== undefined) data.letter_number = letter_number;
      if (doctor_id !== undefined) data.doctor_id = parseInt(doctor_id, 10);
      if (insurance_id !== undefined) data.insurance_id = parseInt(insurance_id, 10);
      if (patient_id !== undefined) data.patient_id = parseInt(patient_id, 10);
      if (service_date !== undefined) data.service_date = new Date(service_date);
      if (status !== undefined) data.status = status;
      if (total_commission !== undefined) data.total_commission = parseFloat(total_commission);

      // Agregar URL del archivo subido al objeto data
      if (req.file) {
        data.urlFile = await uploadFileToS3(req.file, uid);
      }

      const updatedPaymentLetter = await prisma.paymentLetters.update({
        where: {
          payment_letter_id: parseInt(uid, 10),
        },
        data,
      });

      res.json(updatedPaymentLetter);
    } catch (error) {
      console.error("Error al actualizar la carta de pago:", error); // Print error to console
      res.status(500).json({ error: "Error al actualizar la carta de pago" });
    }
  });
};