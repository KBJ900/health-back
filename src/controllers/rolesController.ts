import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @route GET /api/roles
 * @desc Get all roles
 * @access Public
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los roles" });
  }
};

/**
 * @route GET /api/roles/:id
 * @desc Get a role by ID
 * @access Public
 */
export const getRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await prisma.roles.findUnique({
      where: {
        role_id: parseInt(id, 10),
      },
    });

    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ error: "Rol no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener el rol", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};

/**
 * @route POST /api/roles
 * @desc Create a new role
 * @access Public
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { role_name, description } = req.body;

    const newRole = await prisma.roles.create({
      data: {
        role_name,
        description,
      },
    });

    res.json(newRole);
  } catch (error) {
    console.error("Error al crear el rol:", error);
    res.status(500).json({ error: "Error al crear el rol" });
  }
};

/**
 * @route PUT /api/roles/:id
 * @desc Update a role by ID
 * @access Public
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role_name, description } = req.body;

    const updatedRole = await prisma.roles.update({
      where: {
        role_id: parseInt(id, 10),
      },
      data: {
        role_name,
        description,
      },
    });

    res.json(updatedRole);
  } catch (error) {
    console.error("Error al actualizar el rol:", error);
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

/**
 * @route DELETE /api/roles/:id
 * @desc Delete a role by ID
 * @access Public
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.roles.delete({
      where: {
        role_id: parseInt(id, 10),
      },
    });

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ 
      error: "Error al eliminar el rol", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};