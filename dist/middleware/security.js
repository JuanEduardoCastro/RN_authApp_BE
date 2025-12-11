"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceHTTPS = void 0;
const enforceHTTPS = (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        return next();
    }
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
        return next();
    }
    res.redirect(301, `https://${req.headers.host}${req.url}`);
};
exports.enforceHTTPS = enforceHTTPS;
//# sourceMappingURL=security.js.map