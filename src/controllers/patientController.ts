import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import multer from 'multer';
const prisma = new PrismaClient();
// Configurar multer para manejar form-data
const upload = multer();
/**
 * @route GET /api/patients
 * @desc Get all patients
 * @access Public
 */
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patients.findMany();
    res.json(patients);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/**
 * @route POST /api/patients
 * @desc Create a new patient
 * @access Public
 */
export const createPatient = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      contact_number,
      email,
    } = req.body;

    const newPatient = await prisma.patients.create({
      data: {
        first_name,
        last_name,
        date_of_birth: new Date(date_of_birth),
        contact_number,
        email,
      },
    });

    res.json(newPatient);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Error al crear el paciente", details: error.message });
    } else {
      res.status(500).json({ error: "Error al crear el paciente", details: "An unknown error occurred" });
    }
  }
};

/**
 * @route GET /api/patients/:uid
 * @desc Get a patient by ID
 * @access Public
 */
export const getPatient = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const patient = await prisma.patients.findUnique({
      where: {
        patient_id: parseInt(uid, 10), // Convert uid to number
      },
    });
    if (patient) {
      return res.json(patient);
    } else {
      res.status(404).json({ error: "Paciente no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener el paciente:", error); // Imprime el error en la consola
    res.status(500).json({ 
      error: "Error al obtener el paciente", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};

/**
 * @route PUT /api/patients/:uid
 * @desc Update a patient by ID
 * @access Public
 */
export const updatePatient = [
  upload.none(), // Middleware para manejar form-data sin archivos
  async (req: Request, res: Response) => {
    try {
      const { uid } = req.params;
      const {
        first_name,
        last_name,
        date_of_birth,
        contact_number,
        email,
      } = req.body;

      // Construir el objeto data dinámicamente
      const data: any = {};
      if (first_name !== undefined) data.first_name = first_name;
      if (last_name !== undefined) data.last_name = last_name;
      if (date_of_birth !== undefined) data.date_of_birth = new Date(date_of_birth);
      if (contact_number !== undefined) data.contact_number = contact_number;
      if (email !== undefined) data.email = email;

      const updatedPatient = await prisma.patients.update({
        where: {
          patient_id: parseInt(uid, 10), // Convert uid to number
        },
        data,
      });

      res.json(updatedPatient);
    } catch (error) {
      console.error("Error al actualizar el paciente:", error); // Imprime el error en la consola
      if (error instanceof Error) {
        res.status(500).json({ error: "Error al actualizar el paciente", details: error.message });
      } else {
        res.status(500).json({ error: "Error al actualizar el paciente", details: "An unknown error occurred" });
      }
    }
  }
];

/**
 * @route DELETE /api/patients/:uid
 * @desc Delete a patient by ID
 * @access Public
 */
export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    await prisma.patients.delete({
      where: {
        patient_id: parseInt(uid, 10), // Convert uid to number
      },
    });

    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Error al eliminar el paciente:", error); // Imprime el error en la consola
    if (error instanceof Error) {
      res.status(500).json({ error: "Error al eliminar el paciente", details: error.message });
    } else {
      res.status(500).json({ error: "Error al eliminar el paciente", details: "An unknown error occurred" });
    }
  }
};