"use client";

import AuthButton from "./components/AuthButton";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type ItemListEntry = {
  id: string;
  itemId: string;
  addedAt: string;
  item: {
    id: string;
    name: string;
  };
};

export default function Home() {
 const { data: session, status } = useSession();
console.log("セッション", session, "ステータス", status);
  // GET
  const [items, setItems] = useState<ItemListEntry[]>([]);

  const fetchItems = async () => {
    const res = await fetch("/api/items", {
      credentials: "include",
    });
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // POST
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`登録成功: ${data.name} (ID: ${data.id})`);
        setName("");
        // 登録後に一覧を再取得(GET)
        const itemsRes = await fetch("/api/items", {
          credentials: "include",
        });
        const newItems = await itemsRes.json();
        setItems(newItems);
      } else {
        const error = await res.json();
        setMessage(`エラー: ${error.error || "不明なエラー"}`);
      }
    } catch (err) {
      setMessage("通信エラーが発生しました");
    }
  }

  // 削除&r履歴追加
  async function handlePurchase(itemListId: string) {
    try {
      const res = await fetch(`/api/items/${itemListId}/purchase`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Purchase failed");

      // 成功したらリストから除外
      setItems((prev) => prev.filter((item) => item.id !== itemListId));
    } catch (err) {
      console.error(err);
    }
  }

  if (status === "loading") return <p>読み込み中...</p>;
  if (!session) {
    return (
      <div className="text-center">
        <p className="mb-2">ログインしてください</p>
        <AuthButton />
      </div>
    );
  }

  // ページ生成部分
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <AuthButton />
        <h1>買い物リスト</h1>
        {/* GETしたアイテムを表示する部分 */}
        <ul>
          {items.map((listItem) => (
            <li key={listItem.id}>
              {listItem.item.name}
              {/* チェックボックス */}
              <label>
                <input
                  type="checkbox"
                  onChange={() => handlePurchase(listItem.id)}
                />
              </label>
            </li>
          ))}
        </ul>
        <h1 className="text-xl font-bold mb-4">買い物リストにアイテムを追加</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="アイテム名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
          >
            追加する
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </main>
    </div>
  );
}
