"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const connnection = await mongoose.connect(URI);
        const connnection = yield mongoose_1.default.connect(`mongodb+srv://jcvenepro:${process.env.SECRET_DB}@cluster0.f6e7p3i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
        if (connnection) {
            console.log("++ --> DB CONNECTED <-- ++");
        }
    }
    catch (error) {
        console.log("XX -> connection.ts:6 -> connectDB -> error:", error);
    }
});
exports.default = connectDB;
/* WnuAi1esHXDgFCm0 - jcvenepro */
//# sourceMappingURL=connection.js.map