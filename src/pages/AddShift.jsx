import { useState } from "react";
import api from "../utils/api";


function AddShift() {

  const [date, setDate] = useState("");
  const [type, setType] = useState("day");
  const [holiday, setHoliday] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");



  const saveShift = async () => {

    if (!date) {

      setError("Wybierz datę dyżuru.");
      setMessage("");

      return;

    }


    try {

      setLoading(true);
      setError("");
      setMessage("");


      const selectedDate =
        new Date(`${date}T12:00:00`);


      const weekend =
        selectedDate.getDay() === 0 ||
        selectedDate.getDay() === 6;


      const shift = {

        date,
        type,
        holiday,
        weekend,
        hours: 12,
        completed: true

      };


      await api.post("/shifts", shift);


      setDate("");
      setType("day");
      setHoliday(false);

      setMessage("Dyżur został zapisany ✅");

    } catch (error) {

      console.error(
        "Błąd zapisywania dyżuru:",
        error
      );


      setError(
        error.response?.data?.message ||
        "Nie udało się zapisać dyżuru."
      );

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-slate-100 p-4 pb-24">


      <h1 className="text-2xl font-bold text-sky-700 mb-5">

        ➕ Dodaj dyżur

      </h1>



      {message && (

        <div className="bg-emerald-100 text-emerald-700 rounded-2xl p-4 mb-4">

          {message}

        </div>

      )}



      {error && (

        <div className="bg-red-100 text-red-700 rounded-2xl p-4 mb-4">

          {error}

        </div>

      )}



      <div className="bg-white rounded-3xl shadow p-5 space-y-5">


        <div>

          <label className="font-medium">

            📅 Data dyżuru

          </label>


          <input
            type="date"
            value={date}
            onChange={(event) => {

              setDate(event.target.value);
              setError("");
              setMessage("");

            }}
            className="
              w-full
              border
              rounded-xl
              p-3
              mt-2
            "
          />

        </div>



        <h2 className="font-bold">

          Rodzaj dyżuru

        </h2>



        <button
          type="button"
          onClick={() => setType("day")}
          className={`
            w-full
            p-4
            rounded-xl
            transition

            ${
              type === "day"
                ? "bg-sky-600 text-white"
                : "bg-sky-100 text-slate-800"
            }
          `}
        >

          ☀️ Dzień

          <br />

          7:00 - 19:00

        </button>



        <button
          type="button"
          onClick={() => setType("night")}
          className={`
            w-full
            p-4
            rounded-xl
            transition

            ${
              type === "night"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 text-slate-800"
            }
          `}
        >

          🌙 Noc

          <br />

          19:00 - 7:00

        </button>



        <button
          type="button"
          onClick={() => {
            setType("vacation");
            setHoliday(false);
          }}
          className={`
            w-full
            p-4
            rounded-xl
            transition

            ${
              type === "vacation"
                ? "bg-amber-500 text-white"
                : "bg-amber-100 text-slate-800"
            }
          `}
        >

          🏖️ Urlop

        </button>



        {type !== "vacation" && (

          <label className="flex gap-3 items-center">

            <input
              type="checkbox"
              checked={holiday}
              onChange={(event) =>
                setHoliday(event.target.checked)
              }
            />

            🎄 Dyżur w święto

          </label>

        )}



        <button
          type="button"
          onClick={saveShift}
          disabled={loading}
          className="
            w-full
            bg-emerald-600
            text-white
            p-4
            rounded-xl
            font-bold
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >

          {loading
            ? "Zapisywanie..."
            : "💾 Zapisz dyżur"}

        </button>


      </div>


    </div>

  );

}


export default AddShift;