export declare const BluenetErrorType: {
    INPUT_ERROR: string;
    COULD_NOT_VALIDATE_SESSION_NONCE: string;
    INCOMPATIBLE_FIRMWARE: string;
};
export declare class BluenetError {
    type: string;
    message: string;
    code: number;
    constructor(type: any, message: any, code?: number);
}
