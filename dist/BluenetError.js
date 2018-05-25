"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BluenetErrorType = {
    INPUT_ERROR: 'INPUT_ERROR',
    COULD_NOT_VALIDATE_SESSION_NONCE: 'COULD_NOT_VALIDATE_SESSION_NONCE',
    INCOMPATIBLE_FIRMWARE: 'INCOMPATIBLE_FIRMWARE',
};
class BluenetError {
    constructor(type, message, code = 500) {
        this.type = type;
        this.message = message;
        this.code = code;
    }
}
exports.BluenetError = BluenetError;
//# sourceMappingURL=BluenetError.js.map