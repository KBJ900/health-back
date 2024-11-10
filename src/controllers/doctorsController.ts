import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../../awsConfig";


const prisma = new PrismaClient();

// Configurar multer para manejar form-data
const storage = multer.memoryStorage(); // Usar memoryStorage para manejar archivos en memoria
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar el tamaño del archivo a 10MB
}).fields([
  { name: 'urlIne', maxCount: 1 },
  { name: 'urlCedula', maxCount: 1 },
  { name: 'urlConstancia', maxCount: 1 },
  { name: 'urlBanco', maxCount: 1 },
  { name: 'urlDomicilio', maxCount: 1 },
]);

interface MulterRequest extends Request {
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
}

// Helper function to upload file to S3
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
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctors.findMany();

    // Generar URLs pre-firmadas para los archivos
    for (const doctor of doctors) {
      if (doctor.urlIne) {
        doctor.urlIne = await generatePresignedUrl(doctor.urlIne);
      } else {
        doctor.urlIne = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlCedula) {
        doctor.urlCedula = await generatePresignedUrl(doctor.urlCedula);
      } else {
        doctor.urlCedula = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlConstancia) {
        doctor.urlConstancia = await generatePresignedUrl(doctor.urlConstancia);
      } else {
        doctor.urlConstancia = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlBanco) {
        doctor.urlBanco = await generatePresignedUrl(doctor.urlBanco);
      } else {
        doctor.urlBanco = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlDomicilio) {
        doctor.urlDomicilio = await generatePresignedUrl(doctor.urlDomicilio);
      } else {
        doctor.urlDomicilio = null; // O maneja el caso de manera adecuada
      }
    }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
};
/**
 * @route POST /api/doctors
 * @desc Create a new doctor
 * @access Public
 */
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { email, isActive, uid } = req.body;

    const newDoctor = await prisma.doctors.create({
      data: {
        email,
        isActive,
        uid,
      },
    });

    res.json(newDoctor);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Error desconocido" });
    }
  }
};

export const createDoctorForm = [
  upload, // Middleware para manejar form-data con archivos
  async (req: MulterRequest, res: Response) => {
    try {
      const {
        first_name,
        last_name,
        specialty,
        contact_number,
        email,
        clinic_address,
        isActive,
        uid
      } = req.body;

      // Construir el objeto data dinámicamente
      const data: any = {
        first_name,
        last_name,
        specialty,
        contact_number,
        email,
        clinic_address,
        isActive: isActive === 'true',
        uid
      };

      // Agregar claves de archivos subidos al objeto data
      if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlIne']) {
        data.urlIne = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlIne'][0], uid);
      }
      if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlCedula']) {
        data.urlCedula = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlCedula'][0], uid);
      }
      if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlConstancia']) {
        data.urlConstancia = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlConstancia'][0], uid);
      }
      if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlBanco']) {
        data.urlBanco = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlBanco'][0], uid);
      }
      if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlDomicilio']) {
        data.urlDomicilio = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlDomicilio'][0], uid);
      }

      const newDoctor = await prisma.doctors.create({
        data
      });

      res.json(newDoctor);
    } catch (error) {
      console.error("Error al crear el doctor:", error); // Print error to console
      res.status(500).json({ error: "Error al crear el doctor" });
    }
  }
];

/**
 * @route GET /api/doctors/:id
 * @desc Get a doctor by ID
 * @access Public
 */
export const getDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctors.findUnique({
      where: {
        doctor_id: parseInt(id, 10),
      },
    });

    if (doctor) {
      // Generar URLs pre-firmadas para los archivos
      if (doctor.urlIne) {
        doctor.urlIne = await generatePresignedUrl(doctor.urlIne);
      } else {
        doctor.urlIne = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlCedula) {
        doctor.urlCedula = await generatePresignedUrl(doctor.urlCedula);
      } else {
        doctor.urlCedula = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlConstancia) {
        doctor.urlConstancia = await generatePresignedUrl(doctor.urlConstancia);
      } else {
        doctor.urlConstancia = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlBanco) {
        doctor.urlBanco = await generatePresignedUrl(doctor.urlBanco);
      } else {
        doctor.urlBanco = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlDomicilio) {
        doctor.urlDomicilio = await generatePresignedUrl(doctor.urlDomicilio);
      } else {
        doctor.urlDomicilio = null; // O maneja el caso de manera adecuada
      }

      res.json(doctor);
    } else {
      res.status(404).json({ error: "Doctor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener el doctor", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};

export const getDoctorByUid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctors.findFirst({
      where: {
        uid: id,
      },
    });

    if (doctor) {
      // Generar URLs pre-firmadas para los archivos
      if (doctor.urlIne) {
        doctor.urlIne = await generatePresignedUrl(doctor.urlIne);
      } else {
        doctor.urlIne = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlCedula) {
        doctor.urlCedula = await generatePresignedUrl(doctor.urlCedula);
      } else {
        doctor.urlCedula = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlConstancia) {
        doctor.urlConstancia = await generatePresignedUrl(doctor.urlConstancia);
      } else {
        doctor.urlConstancia = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlBanco) {
        doctor.urlBanco = await generatePresignedUrl(doctor.urlBanco);
      } else {
        doctor.urlBanco = null; // O maneja el caso de manera adecuada
      }

      if (doctor.urlDomicilio) {
        doctor.urlDomicilio = await generatePresignedUrl(doctor.urlDomicilio);
      } else {
        doctor.urlDomicilio = null; // O maneja el caso de manera adecuada
      }

      res.json(doctor);
    } else {
      res.status(404).json({ error: "Doctor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener el doctor", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};

/**
 * @route PUT /api/doctors/:id
 * @desc Update a doctor by ID
 * @access Public
 */
export const updateDoctor = [
  upload, // Middleware para manejar form-data con archivos
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        specialty,
        contact_number,
        email,
        clinic_address,
        isActive
      } = req.body;

      // Construir el objeto data dinámicamente
      const data: any = {};
      if (first_name !== undefined || first_name !== '') data.first_name = first_name;
      if (last_name !== undefined || first_name !== '') data.last_name = last_name;
      if (specialty !== undefined || first_name !== '') data.specialty = specialty;
      if (contact_number !== undefined || first_name !== '') data.contact_number = contact_number;
      if (email !== undefined || first_name !== '') data.email = email;
      if (clinic_address !== undefined || first_name !== '') data.clinic_address = clinic_address;
      if (isActive !== undefined) data.isActive = isActive === 'true';

      // Agregar URLs de archivos subidos al objeto data
      if (req.files) {
        if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlIne']) {
          data.urlIne = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlIne'][0], id);
        }
        if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlCedula']) {
          data.urlCedula = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlCedula'][0], id);
        }
        if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlConstancia']) {
          data.urlConstancia = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlConstancia'][0], id);
        }
        if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlBanco']) {
          data.urlBanco = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlBanco'][0], id);
        }
        if ((req.files as { [fieldname: string]: Express.Multer.File[] })['urlDomicilio']) {
          data.urlDomicilio = await uploadFileToS3((req.files as { [fieldname: string]: Express.Multer.File[] })['urlDomicilio'][0], id);
        }
      }

      const updatedDoctor = await prisma.doctors.update({
        where: {
          doctor_id: parseInt(id, 10),
        },
        data,
      });

      res.json(updatedDoctor);
    } catch (error) {
      console.error("Error al actualizar el doctor:", error); // Imprime el error en la consola
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error desconocido" });
      }
    }
  }
];

/**
 * @route DELETE /api/doctors/:id
 * @desc Delete a doctor by ID
 * @access Public
 */
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.doctors.delete({
      where: {
        doctor_id: parseInt(id, 10),
      },
    });

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ 
      error: "Error al eliminar el doctor", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};