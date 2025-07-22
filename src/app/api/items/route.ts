import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: 新しいアイテムを追加
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    // Item を name で検索 or 作成
    const item = await prisma.item.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    // すでにリストに存在していないか確認してから追加
    const existing = await prisma.itemList.findFirst({
      where: { itemId: item.id },
    });

    if (!existing) {
      await prisma.itemList.create({
        data: { itemId: item.id },
      });
    }

    // History にログ追加
    await prisma.itemHistory.create({
      data: {
        itemId: item.id,
        action: "added",
      },
    });

    return NextResponse.json({
      id: item.id,
      name: item.name,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // ItemList から削除
  await prisma.itemList.delete({
    where: { id },
  });

  // History にログ追加（itemId は取得してから）
  await prisma.itemHistory.create({
    data: {
      itemId: id,
      action: "purchased",
    },
  });

  return NextResponse.json({ success: true });
}

// GET
export async function GET() {
  const items = await prisma.itemList.findMany({
    include: {
      item: true, // リスト内のアイテムの名前などを取得する
    },
    orderBy: {
      addedAt: "asc", // 古い順に並べる
    },
  });
  return NextResponse.json(items);
}
