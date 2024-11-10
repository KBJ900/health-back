import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from '../../awsConfig';

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
 * @route GET /api/webUsers
 * @desc Get all web users
 * @access Public
 */
export const getAllWebUsers = async (req: Request, res: Response) => {
  try {
    const webUsers = await prisma.webUser.findMany({include: {
        role: true,
      }});
    const webUsersWithUrls = await Promise.all(webUsers.map(async (user) => {
      if (user.urlFile) {
        user.urlFile = await generatePresignedUrl(user.urlFile);
      }
      return user;
    }));
    res.json(webUsersWithUrls);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios web" });
  }
};

/**
 * @route GET /api/webUsers/:id
 * @desc Get a web user by ID
 * @access Public
 */
export const getWebUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const webUser = await prisma.webUser.findFirst({
      where: {
        uid: id,
      },
      include: {
        role: true,
      }
    });

    if (webUser) {
      if (webUser.urlFile) {
        webUser.urlFile = await generatePresignedUrl(webUser.urlFile);
      }
      res.json(webUser);
    } else {
      res.status(404).json({ error: "Usuario web no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener el usuario web", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};

export const getWebUserId = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const webUser = await prisma.webUser.findUnique({
        where: {
          webUser_id: parseInt(id, 10),
        },
        include: {
          role: true,
        }
      });
  
      if (webUser) {
        if (webUser.urlFile) {
          webUser.urlFile = await generatePresignedUrl(webUser.urlFile);
        }
        res.json(webUser);
      } else {
        res.status(404).json({ error: "Usuario web no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ 
        error: "Error al obtener el usuario web", 
        details: (error as Error).message || "Error desconocido" 
      });
    }
  };

/**
 * @route POST /api/webUsers
 * @desc Create a new web user
 * @access Public
 */
export const createWebUser = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ error: "Error al subir el archivo" });
    }

    try {
      const { first_name, last_name, contact_number, email, uid, isActive, roleId } = req.body;
      const file = req.file;
      let fileKey;

      if (file) {
        fileKey = await uploadFileToS3(file, uuidv4());
      }

      const newWebUser = await prisma.webUser.create({
        data: {
          first_name,
          last_name,
          contact_number,
          email,
          uid,
          isActive,
          urlFile: fileKey,
          roleId
        },
      });

      res.json(newWebUser);
    } catch (error) {
      console.error("Error al crear el usuario web:", error);
      res.status(500).json({ error: "Error al crear el usuario web" });
    }
  });
};

/**
 * @route PUT /api/webUsers/:id
 * @desc Update a web user by ID
 * @access Public
 */
export const updateWebUser = async (req: Request, res: Response) => {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Error al subir el archivo:', err);
        return res.status(500).json({ error: "Error al subir el archivo" });
      }
  
      try {
        const { id } = req.params;
        const { first_name, last_name, contact_number, email, uid, isActive, role_id } = req.body;
        console.log(req.body);
        console.log(id);
        const file = req.file;
        let fileKey;
  
        if (file) {
          fileKey = await uploadFileToS3(file, id);
        }
  
        const data: any = {};
        if (first_name !== undefined) data.first_name = first_name;
        if (last_name !== undefined) data.last_name = last_name;
        if (contact_number !== undefined) data.contact_number = contact_number;
        if (email !== undefined) data.email = email;
        if (uid !== undefined) data.uid = uid;
        if (isActive !== undefined) data.isActive = isActive;
        if (fileKey !== undefined) data.urlFile = fileKey;
        if (role_id !== undefined) data.roleId = parseInt(role_id, 10);
  
        const updatedWebUser = await prisma.webUser.update({
          where: {
            webUser_id: parseInt(id, 10),
          },
          data,
        });
  
        res.json(updatedWebUser);
      } catch (error) {
        console.error("Error al actualizar el usuario web:", error);
        res.status(500).json({ error: "Error al actualizar el usuario web" });
      }
    });
  };

/**
 * @route DELETE /api/webUsers/:id
 * @desc Delete a web user by ID
 * @access Public
 */
export const deleteWebUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.webUser.delete({
      where: {
        webUser_id: parseInt(id, 10),
      },
    });

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ 
      error: "Error al eliminar el usuario web", 
      details: (error as Error).message || "Error desconocido" 
    });
  }
};