import { useEffect, useState } from "react";
import api from "../utils/api";

function Settings() {
  const [settings, setSettings] = useState({
    basicSalary: "",
    hourRate: "",
    nightPercent: "",
    saturdayPercent: "",
    sundayPercent: "",
    holidayPercent: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/salary-settings");

        // Pozostawiamy wartości jako stringi lub puste pola, żeby ułatwić edycję
        setSettings({
          basicSalary: response.data.basicSalary ?? "",
          hourRate: response.data.hourRate ?? "",
          nightPercent: response.data.nightPercent ?? "",
          saturdayPercent: response.data.saturdayPercent ?? "",
          sundayPercent: response.data.sundayPercent ?? "",
          holidayPercent: response.data.holidayPercent ?? ""
        });

      } catch (err) {
        console.error("Błąd pobierania ustawień:", err);

        setError(
          err.response?.data?.message ||
          "Nie udało się pobrać ustawień wynagrodzenia."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Pozwalamy na przechowywanie pustego ciągu tekstowego "" podczas edycji Backspace'em
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError("");

      // Dopiero przy zapisie bezpiecznie zamieniamy ciągi na liczby (puste "" zmienia się w 0)
      const payload = {
        basicSalary: settings.basicSalary === "" ? 0 : Number(settings.basicSalary),
        hourRate: settings.hourRate === "" ? 0 : Number(settings.hourRate),
        nightPercent: settings.nightPercent === "" ? 0 : Number(settings.nightPercent),
        saturdayPercent: settings.saturdayPercent === "" ? 0 : Number(settings.saturdayPercent),
        sundayPercent: settings.sundayPercent === "" ? 0 : Number(settings.sundayPercent),
        holidayPercent: settings.holidayPercent === "" ? 0 : Number(settings.holidayPercent)
      };

      await api.put("/salary-settings", payload);

      // Odśwież ekran Home
      window.dispatchEvent(new Event("salaryUpdated"));

      alert("Stawki zapisane ✅");

    } catch (err) {
      console.error("Błąd zapisywania ustawień:", err);

      setError(
        err.response?.data?.message ||
        "Nie udało się zapisać ustawień wynagrodzenia."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 pb-24 transition-colors">
      <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-5">
        ⚙️ Ustawienia wynagrodzenia
      </h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl p-4 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-3xl shadow p-5 transition-colors">
          Ładowanie ustawień...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-5 space-y-4 transition-colors">
          
          <div>
            <label className="text-slate-700 dark:text-slate-200 block mb-1">
              💰 Pensja podstawowa
            </label>
            <input
              type="number"
              name="basicSalary"
              value={settings.basicSalary}
              onChange={handleChange}
              placeholder="np. 5000"
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-200 block mb-1">
              ⏰ Stawka godzinowa
            </label>
            <input
              type="number"
              name="hourRate"
              value={settings.hourRate}
              onChange={handleChange}
              placeholder="np. 40"
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-200 block mb-1">
              🌙 Noc %
            </label>
            <input
              type="number"
              name="nightPercent"
              value={settings.nightPercent}
              onChange={handleChange}
              placeholder="np. 65"
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-200 block mb-1">
              ⭐ Sobota %
            </label>
            <input
              type="number"
              name="saturdayPercent"
              value={settings.saturdayPercent}
              onChange={handleChange}
              placeholder="np. 0"
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-200 block mb-1">
              ⭐ Niedziela %
            </label>
            <input
              type="number"
              name="sundayPercent"
              value={settings.sundayPercent}
              onChange={handleChange}
              placeholder="np. 65"
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-200 block mb-1">
              🎄 Święto %
            </label>
            <input
              type="number"
              name="holidayPercent"
              value={settings.holidayPercent}
              onChange={handleChange}
              placeholder="np. 65"
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="bg-sky-50 dark:bg-sky-950 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300">
            ℹ️ Wynagrodzenie za urlop wyliczane jest automatycznie na podstawie średniej ze składników zmiennych (nocne, niedzielne) z ostatnich 3 miesięcy.
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Zapisywanie..." : "💾 Zapisz ustawienia"}
          </button>

        </div>
      )}
    </div>
  );
}

export default Settings;