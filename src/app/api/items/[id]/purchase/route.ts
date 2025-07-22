import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const itemListId = params.id;

  // ItemList の該当アイテム取得（Itemの情報も欲しい）
  const itemList = await prisma.itemList.findUnique({
    where: { id: itemListId },
    include: { item: true },
  });

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!itemList) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  // ItemHistory に追加
  await prisma.itemHistory.create({
    data: {
      itemId: itemList.item.id,
      action: "purchased",
      userId: session.user.id,
    },
  });

  // ItemList から削除
  await prisma.itemList.delete({ where: { id: itemListId } });

  return NextResponse.json({ success: true });
}
