import fs from 'node:fs';
import path from 'node:path';
import multer, { FileFilterCallback } from 'multer';
import { ApiError } from '../utils/api-error';

const uploadsDirectory = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  },
});

function imageFileFilter(_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new ApiError(400, 'Solo se permiten archivos de imagen.'));
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadSingleImage = upload.single('image');
