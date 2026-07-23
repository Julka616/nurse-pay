import { useEffect, useState } from "react";
import api from "../utils/api";


function Schedule() {

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);


  const loadShifts = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get("/shifts");

      const receivedShifts =
        Array.isArray(response.data)
          ? response.data
          : [];

      const sortedShifts = [...receivedShifts].sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

      setShifts(sortedShifts);

    } catch (error) {

      console.error(
        "Błąd pobierania dyżurów:",
        error
      );

      console.log(
        "STATUS POBIERANIA:",
        error.response?.status
      );

      console.log(
        "ODPOWIEDŹ BACKENDU:",
        error.response?.data
      );

      setShifts([]);

      setError(
        error.response?.data?.message ||
        "Nie udało się pobrać dyżurów."
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

      setError(
        "Brak identyfikatora dyżuru."
      );

      return;

    }


    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć ten dyżur?"
    );

    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(id);
      setError("");

      const response = await api.delete(
        `/shifts/${id}`
      );

      console.log(
        "ODPOWIEDŹ PO USUNIĘCIU:",
        response.data
      );

      setShifts((currentShifts) =>
        currentShifts.filter(
          (shift) => shift._id !== id
        )
      );

    } catch (error) {

      console.error(
        "Błąd usuwania dyżuru:",
        error
      );

      console.log(
        "STATUS USUWANIA:",
        error.response?.status
      );

      console.log(
        "ODPOWIEDŹ BACKENDU:",
        error.response?.data
      );

      console.log(
        "USUWANY IDENTYFIKATOR:",
        id
      );

      setError(
        error.response?.data?.message ||
        "Nie udało się usunąć dyżuru."
      );

    } finally {

      setDeletingId(null);

    }

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

        shifts.map((shift) => {

          const shiftId =
            shift._id || shift.id;

          return (

            <div
              key={shiftId}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow p-5 mb-4 transition-colors"
            >

              <h2 className="font-bold text-slate-800 dark:text-white">

                📅 {shift.date}

              </h2>


              <p className="text-slate-600 dark:text-slate-300">

              {shift.type === "day"
                  ? "☀️ Dzień"
                  : shift.type === "night"
                    ? "🌙 Noc"
                    : "🏖️ Urlop"}
              </p>


              {shift.type !== "vacation" && (

<p className="text-slate-600 dark:text-slate-300">

  ⏰ {shift.hours} godzin

</p>

)}


              {shift.weekend && (

                <p className="text-indigo-600 font-bold">

                  ⭐ Weekend

                </p>

              )}


              {shift.holiday && (

                <p className="text-red-600 font-bold">

                  🎄 Święto

                </p>

              )}


              <button
                onClick={() =>
                  deleteShift(shiftId)
                }
                disabled={
                  deletingId === shiftId
                }
                className="
                  mt-3
                  bg-red-500
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {deletingId === shiftId
                  ? "Usuwanie..."
                  : "🗑️ Usuń"}

              </button>

            </div>

          );

        })

      )}

    </div>

  );

}


export default Schedule;
