import { NextResponse } from 'next/server';

export class ApiResponse {
    static success<T>(data: T, status: number = 200) {
        return NextResponse.json(
            { success: true, data },
            { status }
        );
    }

    static error(message: string, status: number = 500, errors?: any) {
        return NextResponse.json(
            { success: false, error: message, errors },
            { status }
        );
    }

    static unauthorized(message: string = 'Unauthorized') {
        return NextResponse.json(
            { success: false, error: message },
            { status: 401 }
        );
    }

    static forbidden(message: string = 'Forbidden') {
        return NextResponse.json(
            { success: false, error: message },
            { status: 403 }
        );
    }

    static notFound(message: string = 'Not found') {
        return NextResponse.json(
            { success: false, error: message },
            { status: 404 }
        );
    }

    static badRequest(message: string = 'Bad request', errors?: any) {
        return NextResponse.json(
            { success: false, error: message, errors },
            { status: 400 }
        );
    }
}
