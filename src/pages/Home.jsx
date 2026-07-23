import { useEffect, useState } from "react";
import api from "../utils/api";
import { calculateTotalSalary } from "../utils/payroll";

function Home() {

  const [shifts, setShifts] = useState([]);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);
        setError("");


        const savedUser =
          JSON.parse(
            localStorage.getItem("user")
          ) || null;


        setUser(savedUser);


        const [shiftsResponse, settingsResponse] =
          await Promise.all([
            api.get("/shifts"),
            api.get("/salary-settings")
          ]);

        console.log("DYŻURY Z BACKENDU:", shiftsResponse.data);

        setShifts(
          Array.isArray(shiftsResponse.data)
            ? shiftsResponse.data
            : []
        );

        setSettings(settingsResponse.data || null);

      } catch (error) {

        console.error(
          "Błąd podczas pobierania danych:",
          error
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


    loadData();


    window.addEventListener(
      "salaryUpdated",
      loadData
    );

    return () => {

      window.removeEventListener(
        "salaryUpdated",
        loadData
      );

    };

  }, []);



  const dayShifts = shifts.filter(
    (shift) => shift.type === "day"
  ).length;



  const nightShifts = shifts.filter(
    (shift) => shift.type === "night"
  ).length;



  const vacationShifts = shifts.filter(
    (shift) => shift.type === "vacation"
  ).length;



  const holidayShifts = shifts.filter(
    (shift) => Boolean(shift.holiday)
  ).length;



  const weekendShifts = shifts.filter((shift) => {

    if (shift.weekend) {
      return true;
    }


    if (!shift.date) {
      return false;
    }


    const date =
      new Date(`${shift.date}T12:00:00`);


    return (
      date.getDay() === 0 ||
      date.getDay() === 6
    );

  }).length;



  const totalHours = shifts.reduce(
    (sum, shift) =>
      sum + Number(shift.hours || 0),
    0
  );



  const calculateSalary = () => {

    if (!settings) {
      return null;
    }

    const total = calculateTotalSalary(shifts, settings);

    return total.toFixed(2);

  };



  const salary =
    calculateSalary();



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

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow transition-colors">

          Ładowanie danych...

        </div>

      ) : (

        <>

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



            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow transition-colors">

              <p className="text-slate-600 dark:text-slate-300">🏖️ Urlopy</p>

              <p className="text-3xl font-bold text-slate-800 dark:text-white">

                {vacationShifts}

              </p>

            </div>


          </div>



          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-3xl p-5 mt-5 transition-colors">

            <h2 className="font-bold text-slate-800 dark:text-white">

              💰 Przewidywana wypłata

            </h2>



            {salary !== null ? (

              <>

                <p className="text-3xl font-bold text-emerald-700 mt-2">

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

        </>

      )}


    </div>

  );

}


export default Home;