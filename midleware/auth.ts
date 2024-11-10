
import { PrismaClient } from "@prisma/client";
import { auth } from "../firebase/firebaseService";

const prisma = new PrismaClient();

export const verifyFirebaseToken = async (req: any, res: any, next: any) => {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(403).send('Authorization header is missing');
  }

  const token = authorizationHeader.split(' ')[1]; // Bearer <token>

  if (token) {
    console.log('Token:', token);
    //return res.status(403).send('Token is missing');
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Decoded Token:', decodedToken);

    // Attach the decoded token to the request object
    req.user = decodedToken;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).send('Invalid token');
  }
};

export const verifyRoles = (roles: number[]) => {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(403).send('Unauthorized');
    }

    const webUser = await prisma.webUser.findFirst({
      where: {
        uid: req.user.uid,
      },
      include: {
        role: true,
      }
    });

    /*if (!webUser  !roles.includes(user.roleId)) {
      return res.status(403).send("Unauthorized");
    }*/

    next();
  };
}