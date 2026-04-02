"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImage = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const api_error_1 = require("../utils/api-error");
const uploadsDirectory = node_path_1.default.resolve(process.cwd(), 'uploads');
if (!node_fs_1.default.existsSync(uploadsDirectory)) {
    node_fs_1.default.mkdirSync(uploadsDirectory, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDirectory);
    },
    filename: (_req, file, cb) => {
        const extension = node_path_1.default.extname(file.originalname).toLowerCase() || '.jpg';
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, safeName);
    },
});
function imageFileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
        return;
    }
    cb(new api_error_1.ApiError(400, 'Solo se permiten archivos de imagen.'));
}
const upload = (0, multer_1.default)({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
exports.uploadSingleImage = upload.single('image');
//# sourceMappingURL=upload.middleware.js.map