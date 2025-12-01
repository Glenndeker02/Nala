import { NextRequest, NextResponse } from 'next/server';
import { ROICalculatorService, CalculatorInputs } from '@/lib/services/roi-calculator';
import { verifyAuth } from '@/lib/auth'; // Assuming verifyAuth helper exists or similar logic

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, inputs, campaignId } = body;

        if (!name || !inputs) {
            return NextResponse.json({ error: 'Name and inputs are required' }, { status: 400 });
        }

        const scenario = await ROICalculatorService.saveScenario(
            auth.userId,
            name,
            inputs,
            campaignId
        );

        return NextResponse.json(scenario);
    } catch (error) {
        console.error('Error saving scenario:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const scenarios = await ROICalculatorService.getUserScenarios(auth.userId);

        return NextResponse.json({ scenarios });
    } catch (error) {
        console.error('Error listing scenarios:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
