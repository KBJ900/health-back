/*import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const { doctor_id } = req.params;
    const paymentMethods = await prisma.paymentMethods.findMany({
      where: { doctor_id: parseInt(doctor_id, 10) },
    });
    res.json(paymentMethods);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const { doctor_id } = req.params;
    const { payment_type, provider, account_number, expiry_date } = req.body;

    const newPaymentMethod = await prisma.paymentMethods.create({
      data: {
        doctor_id: parseInt(doctor_id, 10),
        payment_type,
        provider,
        account_number,
        expiry_date: new Date(expiry_date),
      },
    });

    res.json(newPaymentMethod);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_type, provider, account_number, expiry_date } = req.body;

    const updatedPaymentMethod = await prisma.paymentMethods.update({
      where: { id: parseInt(id, 10) },
      data: {
        payment_type,
        provider,
        account_number,
        expiry_date: new Date(expiry_date),
      },
    });

    res.json(updatedPaymentMethod);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};*/