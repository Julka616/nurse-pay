import { useEffect, useState } from "react";
import api from "../utils/api";

function Schedule() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Aktywna zakładka miesiąca (np. "2026-07")
  const [activeMonthKey, setActiveMonthKey] = useState("");

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/shifts");

      const receivedShifts = Array.isArray(response.data)
        ? response.data
        : [];

      const sortedShifts = [...receivedShifts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setShifts(sortedShifts);

      // Ustawiamy domyślnie aktywną zakładkę na najnowszy miesiąc
      if (sortedShifts.length > 0 && sortedShifts[0].date) {
        const latestDate = new Date(`${sortedShifts[0].date}T12:00:00`);
        const monthKey = `${latestDate.getFullYear()}-${String(
          latestDate.getMonth() + 1
        ).padStart(2, "0")}`;
        setActiveMonthKey(monthKey);
      } else {
        const now = new Date();
        setActiveMonthKey(
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        );
      }
    } catch (error) {
      console.error("Błąd pobierania dyżurów:", error);
      console.log("STATUS POBIERANIA:", error.response?.status);
      console.log("ODPOWIEDŹ BACKENDU:", error.response?.data);

      setShifts([]);

      setError(
        error.response?.data?.message || "Nie udało się pobrać dyżurów."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const deleteShift = async (id) => {
    if (!id) {
      setError("Brak identyfikatora dyżuru.");
      return;
    }

    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten dyżur?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await api.delete(`/shifts/${id}`);

      console.log("ODPOWIEDŹ PO USUNIĘCIU:", response.data);

      setShifts((currentShifts) =>
        currentShifts.filter((shift) => (shift._id || shift.id) !== id)
      );

      // Powiadamiamy ekran Home o zmianie, aby zaktualizował wypłatę
      window.dispatchEvent(new Event("salaryUpdated"));
    } catch (error) {
      console.error("Błąd usuwania dyżuru:", error);
      console.log("STATUS USUWANIA:", error.response?.status);
      console.log("ODPOWIEDŹ BACKENDU:", error.response?.data);
      console.log("USUWANY IDENTYFIKATOR:", id);

      setError(
        error.response?.data?.message || "Nie udało się usunąć dyżuru."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --- 1. GRUPOWANIE DYŻURÓW WG MIESIĘCY ---
  const groupedShifts = shifts.reduce((acc, shift) => {
    if (!shift.date) return acc;
    const date = new Date(`${shift.date}T12:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(shift);
    return acc;
  }, {});

  // Najnowsze miesiące po lewej stronie paska
  const monthKeys = Object.keys(groupedShifts).sort().reverse();

  // Pomocnicze formatowanie nazwy miesiąca na polski (np. "Lipiec 2026")
  const formatMonthName = (key) => {
    const [year, month] = key.split("-");
    const date = new Date(year, Number(month) - 1, 1);
    const monthName = date.toLocaleString("pl-PL", { month: "long" });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 pb-24 transition-colors">
      <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-5">
        📋 Historia dyżurów
      </h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl p-4 mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-3xl p-5 shadow transition-colors">
          Ładowanie dyżurów...
        </div>
      ) : shifts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-3xl p-5 shadow transition-colors">
          Brak zapisanych dyżurów
        </div>
      ) : (
        <>
          {/* PASEK PRZEWIJANYCH ZAKŁADEK MIESIĘCY */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {monthKeys.map((key) => {
              const isActive = activeMonthKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveMonthKey(key)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-sky-600 text-white shadow-md"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {formatMonthName(key)} ({groupedShifts[key].length})
                </button>
              );
            })}
          </div>

          {/* LISTA DYŻURÓW Z WYBRANEGO MIESIĄCA */}
          {activeMonthKey && groupedShifts[activeMonthKey] ? (
            groupedShifts[activeMonthKey].map((shift) => {
              const shiftId = shift._id || shift.id;

              return (
                <div
                  key={shiftId}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow p-5 mb-4 transition-colors flex justify-between items-start"
                >
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                      📅 {shift.date}
                    </h2>

                    <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      {shift.type === "day"
                        ? "☀️ Dzień"
                        : shift.type === "night"
                        ? "🌙 Noc"
                        : "🏖️ Urlop"}
                    </p>

                    {shift.type !== "vacation" && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        ⏰ {shift.hours} godzin
                      </p>
                    )}

                    {shift.weekend && (
                      <p className="text-indigo-600 font-bold text-sm mt-1">
                        ⭐ Weekend
                      </p>
                    )}

                    {shift.holiday && (
                      <p className="text-red-600 font-bold text-sm mt-1">
                        🎄 Święto
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteShift(shiftId)}
                    disabled={deletingId === shiftId}
                    className="
                      bg-red-500
                      hover:bg-red-600
                      text-white
                      px-3
                      py-2
                      rounded-xl
                      text-sm
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      transition-colors
                    "
                  >
                    {deletingId === shiftId ? "..." : "🗑️ Usunąć"}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-3xl p-5 shadow transition-colors">
              Brak dyżurów w tym miesiącu.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Schedule;