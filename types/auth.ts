// Authentication Types

export interface LoginRequest {
    phone_number: string;
}

export interface LoginResponse {
    otp: string;
    mock_otp: boolean;
}

export interface VerifyRequest {
    phone_number: string;
    otp: string;
}

export interface VerifyResponse {
    jwt_token: string;
    is_success: boolean;
}
