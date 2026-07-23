import { useEffect, useState } from "react";
import api from "../utils/api";
import { calculateTotalSalary, getVacationHistoryWarnings } from "../utils/payroll";

function Home() {
  const [shifts, setShifts] = useState([]);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stan do przechowywania, który miesiąc jest rozwijany (domyślnie bieżący)
  const [activeMonthKey, setActiveMonthKey] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const savedUser = JSON.parse(localStorage.getItem("user")) || null;
        setUser(savedUser);

        const [shiftsResponse, settingsResponse] = await Promise.all([
          api.get("/shifts"),
          api.get("/salary-settings")
        ]);

        const fetchedShifts = Array.isArray(shiftsResponse.data)
          ? shiftsResponse.data
          : [];

        setShifts(fetchedShifts);
        setSettings(settingsResponse.data || null);

        // Ustawienie domyślnie otwartej zakładki na najnowszy miesiąc
        if (fetchedShifts.length > 0 && fetchedShifts[0].date) {
          const latestDate = new Date(`${fetchedShifts[0].date}T12:00:00`);
          const monthKey = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, "0")}`;
          setActiveMonthKey(monthKey);
        } else {
          const now = new Date();
          setActiveMonthKey(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
        }

      } catch (err) {
        console.error("Błąd podczas pobierania danych:", err);
        setShifts([]);
        setError(
          err.response?.data?.message || "Nie udało się pobrać dyżurów."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();

    window.addEventListener("salaryUpdated", loadData);
    return () => {
      window.removeEventListener("salaryUpdated", loadData);
    };
  }, []);

  // --- 1. GRUPOWANIE DYŻURÓW WEDŁUG MIESIĘCY ---
  const groupedShifts = shifts.reduce((acc, shift) => {
    if (!shift.date) return acc;
    const date = new Date(`${shift.date}T12:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(shift);
    return acc;
  }, {});

  const monthKeys = Object.keys(groupedShifts).sort().reverse(); // najnowsze miesiące na górze

  // --- 2. FILTROWANIE DYŻURÓW DO BIEŻĄCEGO/AKTYWNEGO MIESIĄCA (dla kafli podsumowania) ---
  const activeShiftDate = shifts.length > 0 && shifts[0].date
    ? new Date(`${shifts[0].date}T12:00:00`)
    : new Date();

  const currentYear = activeShiftDate.getFullYear();
  const currentMonth = activeShiftDate.getMonth();

  const currentMonthShifts = shifts.filter((shift) => {
    if (!shift.date) return false;
    const shiftDate = new Date(`${shift.date}T12:00:00`);
    return (
      shiftDate.getFullYear() === currentYear &&
      shiftDate.getMonth() === currentMonth
    );
  });

  // Statystyki podsumowania dla bieżącego miesiąca
  const dayShifts = currentMonthShifts.filter((s) => s.type === "day").length;
  const nightShifts = currentMonthShifts.filter((s) => s.type === "night").length;
  const vacationShifts = currentMonthShifts.filter((s) => s.type === "vacation").length;
  const holidayShifts = currentMonthShifts.filter((s) => Boolean(s.holiday)).length;

  const weekendShifts = currentMonthShifts.filter((shift) => {
    if (shift.weekend) return true;
    if (!shift.date) return false;
    const date = new Date(`${shift.date}T12:00:00`);
    return date.getDay() === 0 || date.getDay() === 6;
  }).length;

  const totalHours = currentMonthShifts.reduce(
    (sum, shift) => sum + Number(shift.hours || 0),
    0
  );

  const salary = settings ? calculateTotalSalary(shifts, settings).toFixed(2) : null;
  const vacationWarnings = settings ? getVacationHistoryWarnings(shifts, settings) : [];

  // Funkcja usuwania dyżuru
  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten dyżur?")) return;
    try {
      await api.delete(`/shifts/${id}`);
      setShifts((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert("Błąd podczas usuwania dyżuru.");
    }
  };

  // Pomocnicza nazwa miesiąca po polsku
  const formatMonthName = (key) => {
    const [year, month] = key.split("-");
    const date = new Date(year, Number(month) - 1, 1);
    const monthName = date.toLocaleString("pl-PL", { month: "long" });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 pb-24 transition-colors">
      <h1 className="text-3xl font-bold text-sky-700 dark:text-sky-400 mb-1">
        👩‍⚕️ NursePay
      </h1>

      {user && (
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Witaj, {user.firstName} 👋
        </p>
      )}

      <p className="text-gray-600 dark:text-slate-400 mb-6">
        Twój grafik i wynagrodzenie
      </p>

      {error && (
        <div className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl p-4 mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow transition-colors text-slate-800 dark:text-white">
          Ładowanie danych...
        </div>
      ) : (
        <>
          {/* PODSUMOWANIE GODZIN I STATYSTYK */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow mb-5 transition-colors">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">
              ⏰ Razem godzin
            </h2>
            <p className="text-4xl font-bold text-sky-700 dark:text-sky-400 mt-2">
              {totalHours} h
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow transition-colors">
              <p className="text-slate-600 dark:text-slate-300">☀️ Dni</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {dayShifts}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow transition-colors">
              <p className="text-slate-600 dark:text-slate-300">🌙 Noce</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {nightShifts}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow transition-colors">
              <p className="text-slate-600 dark:text-slate-300">⭐ Weekendy</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {weekendShifts}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow transition-colors">
              <p className="text-slate-600 dark:text-slate-300">🎄 Święta</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {holidayShifts}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow transition-colors col-span-2">
              <p className="text-slate-600 dark:text-slate-300">🏖️ Urlopy</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {vacationShifts}
              </p>
            </div>
          </div>

          {/* WYNAGRODZENIE */}
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-3xl p-5 mt-5 transition-colors">
            <h2 className="font-bold text-slate-800 dark:text-white">
              💰 Przewidywana wypłata
            </h2>

            {salary !== null ? (
              <>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">
                  {salary} zł
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">
                  Obliczone według Twoich stawek
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-amber-600 mt-2">
                  Brak ustawionych stawek
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">
                  Uzupełnij dane w zakładce Ustawienia
                </p>
              </>
            )}
          </div>

          {vacationWarnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-3xl p-4 mt-4 text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Brak historii dyżurów z poprzednich miesięcy — dopłata urlopowa za {vacationWarnings.join(", ")} wyniosła 0 zł. Dodaj przeszłe dyżury, aby wyliczyć średnią.
            </div>
          )}

          {/* --- SEKCJA HISTORII DYŻURÓW Z ZAKŁADKAMI MIESIĘCZNYMI --- */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              📋 Historia dyżurów
            </h2>

            {/* PASKI ZAKŁADEK MIESIĘCY */}
            {monthKeys.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
                {monthKeys.map((key) => {
                  const isActive = activeMonthKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveMonthKey(key)}
                      className={`px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
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
            )}

            {/* LISTA DYŻURÓW DLA WYBRANEGO MIESIĄCA */}
            {activeMonthKey && groupedShifts[activeMonthKey] ? (
              <div className="space-y-3">
                {groupedShifts[activeMonthKey].map((shift) => (
                  <div
                    key={shift._id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow flex justify-between items-center transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        📅 {shift.date}
                        {shift.type === "vacation" && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                            🏖️ Urlop
                          </span>
                        )}
                        {shift.type === "day" && (
                          <span className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-2 py-0.5 rounded-full">
                            ☀️ Dzień
                          </span>
                        )}
                        {shift.type === "night" && (
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                            🌙 Noc
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex gap-2">
                        {shift.hours && <span>⏰ {shift.hours}h</span>}
                        {shift.weekend && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            ⭐ Weekend
                          </span>
                        )}
                        {shift.holiday && (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            🎄 Święto
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(shift._id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-xl text-sm font-medium"
                      title="Usuń dyżur"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
                Brak dyżurów do wyświetlenia.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;