/*import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getFollowingCampains = async (req: Request, res: Response) => {
  try {
    res.json(await prisma.blood_donation_campaigns.findMany({
      where: {
        start_date: {
          gte: new Date(),
        }
      },
      orderBy: {
        start_date: "asc",
      }
    }));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener información" });
  }
};

export const getUserDonation = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const userDonation = await prisma.campaign_attendance.findFirst({
      where: {
        user_id: uid,
        attendance_date: {
          gte: new Date(),
        },
      },
      orderBy: {
        attendance_date: "asc",
      },
      include: {
        blood_donation_campaigns: true,
      },
    });

    return res.json(userDonation);
  } catch (error) {
    res.status(500).json({ error: "Error al leer información" });
  }
};

export const getFollowingCampain = async (req: Request, res: Response) => {
  try {
    const campain = await prisma.blood_donation_campaigns.findFirst({
      where: {
        start_date: {
          gte: new Date(),
        },
      },
      orderBy: {
        start_date: "asc",
      },
    });

    return res.json(campain);
  } catch (error) {
    res.status(500).json({ error: "Error al hacer registro" });
  }
};

// todo: trye to get less data from campain_attendance
// todo: add sorting
// todo: add pagination
export const getCampainDonators = async (req: Request, res: Response) => {
  try {
    const { campain } = req.params;
    const donators = await prisma.campaign_attendance.findFirst({
      where: {
        campaign_id: +campain,
      },
      orderBy: {
        attendance_date: "asc",
        attendance_hour: 'asc',
      },
      include: {
        users: 
        {
          select: {
            first_name: true,
            lastname: true,
            surname: true,
            blood_type: true,
            date_of_birth: true,
            gender: true,
          }
        },
      },
    });

    return res.json(donators);
  } catch (error) {
    res.status(500).json({ error: "Error al leer información" });
  }
};

export const getCampain = async (req: Request, res: Response) => {
  try {
    const { cid:campaignId, } = req.params;
    const campainData = await prisma.blood_donation_campaigns.findUnique({
      where: {
        campaign_id: +campaignId,
      },
    });

    return res.json(campainData);
  } catch (error) {
    res.status(500).json({ error: "Error al leer información" });
  }
};

// todo: trye to get less data from blood_donation_campaigns
// todo: add sorting
// todo: add pagination
export const getCampains = async (req: Request, res: Response) => {
  try {
    res.json(await prisma.blood_donation_campaigns.findMany({
      orderBy: {
        start_date: "desc",
      }
    }));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener información" });
  }
};


// export const createCampain = async (req: Request, res: Response) => {
//   try {
//     const {
//       name,
//       description,
//       start_date,
//       end_date,
//       location,
//       capacity,
//       blood_type,
//       age_range
//     } = req.body; 
//     const newCampain = await prisma.blood_donation_campaigns.create({
//       data: {
//         campaign_name: name,
//         description,
//         start_date,
//         end_date,
//         location,
//         capacity,
//         blood_type,
//         age_range,
//       },
//     });
//     res.json(newCampain);
//   } catch (error) {
//     res.status(500).json({ error: "Error al hacer registro" });
//   }
// }

export const setAttendance = async (req: Request, res: Response) => {
  try {
    const { id, attended, donated } =
      req.body;
    const newAttendance = await prisma.campaign_attendance.update({
      where: {
        attendance_id: +id,
      },
      data: {
        attended: !!attended,
        was_able_to_donate: !!donated,
      },
    });
    res.json(newAttendance);
  } catch (error) {
    res.status(500).json({ error: "Error al hacer registro" });
  }
}

export const getCampainAttendance = async (req: Request, res: Response) => {
  try {
    const {cid:campain } = req.params;
    const campainData = await prisma.campaign_attendance.count({
      where: {
        campaign_id: +campain,
      },
      select: {
        _all: true, // Count all records
        was_able_to_donate: true, // Count all non-null field values
      },
    });
    return res.json(campainData);
  } catch (error) {
    res.status(500).json({ error: "Error al leer información" });
  } 
}


export const bookDonation = async (req: Request, res: Response) => {
  try {
    const { uid, date, hour, cid } = req.body;
    const availableSlot = await prisma.campaign_attendance.findFirst({
      where: {
        campaign_id: +cid,
        attendance_date: new Date(date),
        attendance_hour: hour,
        user_id: null,
      },
    });

    if (!availableSlot) {
      return res.status(400).json({ error: "No hay disponibilidad" });
    }

    const newAttendance = await prisma.campaign_attendance.update({
      data: {
        user_id: uid,
        attendance_expected: true,
      },
      where: {
        attendance_id: availableSlot.attendance_id,
      }
    });

    res.json(newAttendance);
  } catch (error) {
    res.status(500).json({ error: "Error al hacer registro" });
  }
}

export const cancelDonation = async (req: Request, res: Response) => {
  try {
    const { aid } = req.body;
    const attendance = await prisma.campaign_attendance.findFirst({
      where: {
        attendance_id: +aid,
      },
    });

    if (!attendance) {
      return res.status(404).json({ error: "No hay información" });
    }

    const updatedAttendance = await prisma.campaign_attendance.update({
      data: {
        attendance_expected: false,
      },
      where: {
        attendance_id: attendance.attendance_id,
      }
    });

    const newAttendance = {
      campaign_id: attendance.campaign_id,
      attendance_date: attendance.attendance_date,
      attendance_hour: attendance.attendance_hour,
      module: attendance.module,
    };

    await prisma.campaign_attendance.create({
      data: newAttendance,
    });

    res.json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ error: "Error al hacer registro" });
  }
}

export const getDonationSlots = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const slots = await prisma.campaign_attendance.findMany({
      distinct: ["attendance_date", "attendance_hour"],
      where: {
        campaign_id: +cid,
        user_id: null,
      },
      select: {
        attendance_date: true,
        attendance_hour: true,
      },
      orderBy: {
        attendance_date: "asc",
        attendance_hour: "asc",
      },
    });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener información" });
  }
}*/