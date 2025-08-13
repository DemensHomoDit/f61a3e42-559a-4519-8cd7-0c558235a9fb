import { useMemo, useState } from "react";

function inRangeFactory(from: string, to: string) {
  return (d?: string) => {
    if (!d) return true;
    const dv = d.slice(0, 10);
    if (from && dv < from) return false;
    if (to && dv > to) return false;
    return true;
  };
}

export function useFinanceFilters(purchases: any[], salaries: any[], absences: any[]) {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [objectId, setObjectId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const inRange = useMemo(() => inRangeFactory(from, to), [from, to]);

  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases.filter((p: any) => {
      const byQ = !q || (p.item?.toLowerCase().includes(q) ?? false);
      const byDate = inRange(p.date);
      const byObj = !objectId || String(p.object_id ?? "") === objectId;
      const byUser = !userId || String(p.assignee_id ?? "") === userId;
      return byQ && byDate && byObj && byUser;
    });
  }, [purchases, search, inRange, objectId, userId]);

  const filteredSalaries = useMemo(() => {
    return salaries.filter((s: any)=> inRange(s.date) && (!userId || String(s.user_id ?? "") === userId) && (!objectId || String(s.object_id ?? "") === objectId));
  }, [salaries, inRange, userId, objectId]);

  const filteredAbsences = useMemo(() => {
    return absences.filter((a: any)=> inRange(a.date) && (!userId || String(a.user_id ?? "") === userId) && (!objectId || String(a.object_id ?? "") === objectId));
  }, [absences, inRange, userId, objectId]);

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; purchases: number; salaries: number; absences: number }>();
    const add = (date?: string, key?: "purchases"|"salaries"|"absences", amount?: number) => {
      if (!date || !key) return;
      const m = date.slice(0,7);
      if (!map.has(m)) map.set(m, { month: m, purchases: 0, salaries: 0, absences: 0 });
      const row = map.get(m)!;
      row[key] += Number(amount ?? 0) || 0;
    };
    filteredPurchases.forEach((p: any) => add(p.date, "purchases", p.amount));
    filteredSalaries.forEach((s: any) => add(s.date, "salaries", s.amount));
    filteredAbsences.forEach((a: any) => add(a.date, "absences", a.amount));
    return Array.from(map.values()).sort((a,b)=> a.month.localeCompare(b.month));
  }, [filteredPurchases, filteredSalaries, filteredAbsences]);

  const reset = () => { setSearch(""); setFrom(""); setTo(""); setObjectId(""); setUserId(""); };

  return {
    // state
    search, setSearch, from, setFrom, to, setTo, objectId, setObjectId, userId, setUserId,
    // derived
    filteredPurchases, filteredSalaries, filteredAbsences, monthly,
    reset,
  };
} 