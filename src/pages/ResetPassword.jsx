import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Hasła nie są takie same.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { newPassword });
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Wystąpił błąd.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-2 text-center">
          Ustaw nowe hasło 🔑
        </h1>
        <form onSubmit={handleReset} className="space-y-3 mt-4">
          <input
            type="password"
            placeholder="Nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl"
            required
          />
          <input
            type="password"
            placeholder="Powtórz nowe hasło"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl"
            required
          />
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-xl font-bold transition-colors"
          >
            Zapisz nowe hasło
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;