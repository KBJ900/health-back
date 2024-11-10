import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

/**
 * @route GET /api/doctors
 * @desc Get all doctors
 * @access Public
 */
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctors.findMany();
    res.json(doctors);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/**
 * @route POST /api/doctors
 * @desc Create a new doctor profile
 */
export const createDoctorProfile = async (req: Request, res: Response) => {
  try {
    const {
      uid,
      first_name,
      last_name,
      specialty,
      contact_number,
      email,
      clinic_address,
    } = req.body;
    // TODO: Add validation
    const newDoctor = await prisma.doctors.create({
      data: {
        uid: uid.toString(), // Convert uid to string
        isActive: true,
        doctor_id: uid.toString(), // Convert uid to string
        first_name: first_name,
        last_name: last_name,
        specialty: specialty,
        contact_number: contact_number,
        email: email,
        clinic_address: clinic_address,
      },
    });
    res.json(newDoctor);
  } catch (error) {
    res.status(500).json({ error: "Error al hacer registro" });
  }
};

/**
 * @route GET /api/doctors/:uid
 * @desc Get a doctor profile
 */
export const getDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const doctor = await prisma.doctors.findUnique({
      where: {
        doctor_id: parseInt(uid, 10), // Convert uid to number
      },
    });
    if (doctor) {
      return res.json(doctor);
    } else {
      res.status(404).json({ error: "Doctor no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};