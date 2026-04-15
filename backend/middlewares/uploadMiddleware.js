import multer from 'multer';

const storage = multer.memoryStorage(); // Process file in memory to avoid writing to disk

export const uploadPDF = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter(req, file, cb) {
        if (!file.originalname.toLowerCase().match(/\.(pdf)$/)) {
            return cb(new Error('Please upload a PDF document'));
        }
        cb(undefined, true);
    }
});
