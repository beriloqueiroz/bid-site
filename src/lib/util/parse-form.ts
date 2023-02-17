import formidable from 'formidable';
import { mkdir, stat } from 'fs/promises';
import mime from 'mime';
import type { NextApiRequest } from 'next';

export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  // eslint-disable-next-line no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    const uploadDir = `/tmp/`;

    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    const form = formidable({
      maxFiles: 10,
      maxFileSize: 1024 * 1024 * 10, // 10mb
      uploadDir,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${part.name || 'file'}-${uniqueSuffix}.${mime.getExtension(part.mimetype || '') || 'unknown'}`;
        return filename;
      },
      filter: (part) => {
        return (
          part.name === 'media' && (part.mimetype?.includes('sheet') || part.mimetype?.includes('csv') || part.mimetype?.includes('excel') || false)
        );
      },
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};
