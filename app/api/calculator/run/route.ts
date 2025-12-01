import { NextRequest, NextResponse } from 'next/server';
import { ROICalculatorService, CalculatorInputs } from '@/lib/services/roi-calculator';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const inputs: CalculatorInputs = body;

        // Basic validation
        if (
            typeof inputs.views !== 'number' ||
            typeof inputs.downloadRate !== 'number' ||
            typeof inputs.conversionRate !== 'number' ||
            typeof inputs.averagePrice !== 'number' ||
            typeof inputs.churnRate !== 'number'
        ) {
            return NextResponse.json(
                { error: 'Invalid inputs. All fields must be numbers.' },
                { status: 400 }
            );
        }

        const results = ROICalculatorService.calculateProjections(inputs);

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error running calculator:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
