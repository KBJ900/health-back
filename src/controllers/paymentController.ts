import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

/*export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency, payment_letter_id } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    const newPayment = await prisma.payments.create({
      data: {
        payment_letter_id,
        payment_date: new Date(),
        amount_paid: amount,
        payment_method: 'stripe',
        payment_status: 'pending',
        commission_paid: false,
      },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      paymentId: newPayment.payment_id,
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { payment_id } = req.params;
    const { payment_status } = req.body;

    const updatedPayment = await prisma.payments.update({
      where: { payment_id: parseInt(payment_id, 10) },
      data: { payment_status },
    });

    res.json(updatedPayment);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};*/