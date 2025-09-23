import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: obtener todos los leads
export async function GET() {
  const leads = await prisma.lead.findMany();
  return NextResponse.json(leads);
}

// POST: crear un nuevo lead
export async function POST(request: Request) {
  const data = await request.json();
  const lead = await prisma.lead.create({ data });
  return NextResponse.json(lead);
}
