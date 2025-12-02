import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { LoginRequest, LoginResponse, VerifyRequest, VerifyResponse } from '../types/auth';
import { ChecklistResponse } from '../types/checklist';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    },
});

// Auth API
export const login = async (phoneNumber: string): Promise<LoginResponse> => {
    try {
        const request: LoginRequest = { phone_number: phoneNumber };
        const response = await api.post<LoginResponse>('/auth/login', request);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const verifyOTP = async (
    phoneNumber: string,
    otp: string
): Promise<VerifyResponse> => {
    const request: VerifyRequest = { phone_number: phoneNumber, otp };
    const response = await api.post<VerifyResponse>('/auth/verify', request);
    return response.data;
};

// Checklist API
export const generateChecklist = async (
    prompt: string,
    token: string
): Promise<ChecklistResponse> => {
    const response = await api.post<ChecklistResponse>(
        '/checklist/',
        { prompt },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};
