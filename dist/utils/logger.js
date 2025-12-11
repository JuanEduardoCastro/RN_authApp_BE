"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    log: (...args) => {
        if (process.env.NODE_ENV === "development") {
            console.log(...args);
        }
    },
    error: (...args) => {
        console.error(...args);
    },
    info: (...args) => {
        console.log(...args);
    },
};
//# sourceMappingURL=logger.js.map