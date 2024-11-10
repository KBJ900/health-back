/*import path from 'path';
import { Request, Response } from 'express';

export const download = async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const file = path.join(__dirname, '../../public', filename);

  // Agregar encabezado para forzar la descarga
  res.download(file, (err: any) => {
    if (err) {
      console.error("Error al descargar el archivo:", err);
      res.status(500).send("Error en la descarga del archivo");
    }
  });
};*/