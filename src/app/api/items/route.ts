import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST: 新しいアイテムを追加
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

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
        data: { itemId: item.id, userId: session.user.id },
      });
    }

    // History にログ追加
    await prisma.itemHistory.create({
      data: {
        userId: session.user.id,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id } = params;

  // ItemList から削除
  await prisma.itemList.delete({
    where: { id },
  });

  // History にログ追加（itemId は取得してから）
  await prisma.itemHistory.create({
    data: {
      userId: session.user.id,
      itemId: id,
      action: "purchased",
    },
  });

  return NextResponse.json({ success: true });
}

// GET
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const items = await prisma.itemList.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      item: true, // リスト内のアイテムの名前などを取得する
    },
    orderBy: {
      addedAt: "asc", // 古い順に並べる
    },
  });
  return NextResponse.json(items);
}
