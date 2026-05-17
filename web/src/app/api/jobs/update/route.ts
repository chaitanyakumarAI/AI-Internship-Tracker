import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function POST(req: Request) {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return NextResponse.json({ error: 'Notion API keys not configured', success: false }, { status: 400 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status', success: false }, { status: 400 });
    }

    // Update the Notion page
    await notion.pages.update({
      page_id: id,
      properties: {
        'Status': {
          select: {
            name: status
          }
        }
      }
    });

    return NextResponse.json({ success: true, id, status });
  } catch (err: any) {
    console.error('Notion update error:', err.message);
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}
