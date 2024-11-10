import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

/**
 * @route GET /api/insurance-companies
 * @desc Get all insurance companies
 * @access Public
 */
export const getAllInsuranceCompanies = async (req: Request, res: Response) => {
  try {
    const insuranceCompanies = await prisma.insuranceCompanies.findMany();
    res.json(insuranceCompanies);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

/**
 * @route POST /api/insurance-companies
 * @desc Create a new insurance company
 * @access Public
 */
export const createInsuranceCompany = async (req: Request, res: Response) => {
  try {
    const {
      company_name,
      contact_number,
      email,
      address,
    } = req.body;

    const newInsuranceCompany = await prisma.insuranceCompanies.create({
      data: {
        company_name,
        contact_number,
        email,
        address,
      },
    });

    res.json(newInsuranceCompany);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: "Error al crear la compañía de seguros", details: error.message });
    } else {
      res.status(500).json({ error: "Error al crear la compañía de seguros", details: "An unknown error occurred" });
    }
  }
};

/**
 * @route GET /api/insurance-companies/:id
 * @desc Get an insurance company by ID
 * @access Public
 */
export const getInsuranceCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const insuranceCompany = await prisma.insuranceCompanies.findUnique({
      where: {
        insurance_id: parseInt(id, 10), // Convert id to number
      },
    });
    if (insuranceCompany) {
      return res.json(insuranceCompany);
    } else {
      res.status(404).json({ error: "Compañía de seguros no encontrada" });
    }
  } catch (error) {
    console.error("Error al obtener la compañía de seguros:", error); // Imprime el error en la consola
    res.status(500).json({ 
      error: "Error al obtener la compañía de seguros", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};

/**
 * @route PUT /api/insurance-companies/:id
 * @desc Update an insurance company by ID
 * @access Public
 */
export const updateInsuranceCompany = async (req: Request, res: Response) => {
  try {
    console.log("Request body:", req.body);
    
    const { id } = req.params;
    const {
      company_name,
      contact_number,
      email,
      address,
    } = req.body;
    console.log("ID:", id);
    
    // Construir el objeto data dinámicamente
    const data: any = {};
    if (company_name !== undefined) data.company_name = company_name;
    if (contact_number !== undefined) data.contact_number = contact_number;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;

    const updatedInsuranceCompany = await prisma.insuranceCompanies.update({
      where: {
        insurance_id: parseInt(id, 10), // Convert id to number
      },
      data,
    });

    res.json(updatedInsuranceCompany);
  } catch (error) {
    console.error("Error al actualizar la compañía de seguros:", error); // Imprime el error en la consola
    if (error instanceof Error) {
      res.status(500).json({ error: "Error al actualizar la compañía de seguros", details: error.message });
    } else {
      res.status(500).json({ error: "Error al actualizar la compañía de seguros", details: "An unknown error occurred" });
    }
  }
};

/**
 * @route DELETE /api/insurance-companies/:id
 * @desc Delete an insurance company by ID
 * @access Public
 */
export const deleteInsuranceCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.insuranceCompanies.delete({
      where: {
        insurance_id: parseInt(id, 10), // Convert id to number
      },
    });

    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Error al eliminar la compañía de seguros:", error); // Imprime el error en la consola
    if (error instanceof Error) {
      res.status(500).json({ error: "Error al eliminar la compañía de seguros", details: error.message });
    } else {
      res.status(500).json({ error: "Error al eliminar la compañía de seguros", details: "An unknown error occurred" });
    }
  }
};