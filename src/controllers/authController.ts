import { Request, Response } from 'express';
import { auth } from '../../firebase/firebaseService';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRecord = await auth.getUserByEmail(email);
    // Aquí puedes agregar lógica adicional para verificar la contraseña si es necesario

    // Generar un token personalizado
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({ uid: userRecord.uid, email: userRecord.email, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).send(error.message);
    } else {
      res.status(401).send('Authentication failed');
    }
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Generar un token personalizado
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({ uid: userRecord.uid, email: userRecord.email, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send('An unknown error occurred');
    }
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const userRecord = await auth.getUser(uid);
    res.status(200).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).send(error.message);
    } else {
      res.status(404).send('User not found');
    }
  }
};