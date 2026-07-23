import { useEffect, useState } from "react";
import api from "../utils/api";


function Calendar() {


  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDay, setSelectedDay] = useState(null);

  const [type, setType] = useState("day");

  const [holiday, setHoliday] = useState(false);

  const [plannedShifts, setPlannedShifts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);




  const loadPlannedShifts = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get("/planned-shifts");

      setPlannedShifts(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Błąd pobierania zaplanowanych dyżurów:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Nie udało się pobrać zaplanowanych dyżurów."
      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(()=>{

    loadPlannedShifts();

  },[]);




  const year=currentDate.getFullYear();

  const month=currentDate.getMonth();



  const monthName =
    currentDate.toLocaleString(
      "pl-PL",
      {
        month:"long",
        year:"numeric"
      }
    );



  const daysInMonth =
    new Date(year,month+1,0).getDate();


  const firstDay =
    new Date(year,month,1).getDay();




  const createDate=(day)=>{

    return `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  };




  const getShift=(day)=>{

    return plannedShifts.find(
      shift=>shift.date===createDate(day)
    );

  };





  const savePlan = async () => {


    if(!selectedDay)
      return;


    const date=createDate(selectedDay);

    const checkDate=new Date(date);

    const weekend =
      checkDate.getDay()===0 ||
      checkDate.getDay()===6;


    const newShift={

      date,
      type,
      holiday,
      weekend,
      hours:12,
      completed:false

    };


    try {

      setSaving(true);
      setError("");

      await api.post("/planned-shifts", newShift);

      await loadPlannedShifts();

      setHoliday(false);
      setSelectedDay(null);

    } catch (err) {

      console.error(
        "Błąd dodawania zaplanowanego dyżuru:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Nie udało się zaplanować dyżuru."
      );

    } finally {

      setSaving(false);

    }


  };





  const completeShift = async () => {


    const shift=getShift(selectedDay);

    if(!shift)
      return;


    try {

      setSaving(true);
      setError("");

      await api.patch(`/planned-shifts/${shift._id}/complete`);

      await loadPlannedShifts();

      // odśwież wypłatę na Home
      window.dispatchEvent(
        new Event("salaryUpdated")
      );

      setSelectedDay(null);

    } catch (err) {

      console.error(
        "Błąd oznaczania dyżuru jako wykonanego:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Nie udało się oznaczyć dyżuru jako wykonanego."
      );

    } finally {

      setSaving(false);

    }


  };








  const deletePlan = async () => {


    const shift=getShift(selectedDay);

    if(!shift)
      return;


    try {

      setSaving(true);
      setError("");

      await api.delete(`/planned-shifts/${shift._id}`);

      await loadPlannedShifts();

      window.dispatchEvent(
        new Event("salaryUpdated")
      );

      setSelectedDay(null);

    } catch (err) {

      console.error(
        "Błąd usuwania zaplanowanego dyżuru:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Nie udało się usunąć dyżuru."
      );

    } finally {

      setSaving(false);

    }


  };







  const changeMonth=(value)=>{

    setCurrentDate(

      new Date(
        year,
        month+value,
        1
      )

    );

    setSelectedDay(null);

  };




return (

<div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 pb-24 transition-colors">


<h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-5">

📅 Grafik pracy

</h1>


{error && (

  <div className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl p-4 mb-5">
    {error}
  </div>

)}


<div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-5 transition-colors">


<div className="flex justify-between items-center mb-5">


<button

onClick={()=>changeMonth(-1)}

className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl"

>
◀
</button>



<h2 className="font-bold capitalize text-slate-800 dark:text-white">

{monthName}

</h2>



<button

onClick={()=>changeMonth(1)}

className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl"

>
▶
</button>


</div>


{loading ? (

  <div className="p-5 text-center text-slate-500 dark:text-slate-400">
    Ładowanie grafiku...
  </div>

) : (

<>

<div className="grid grid-cols-7 text-center font-bold text-slate-700 dark:text-slate-300 mb-2">

{
["Pn","Wt","Śr","Cz","Pt","Sob","Nd"]
.map(x=>(

<div key={x}>{x}</div>

))
}

</div>




<div className="grid grid-cols-7 gap-2">


{
Array(firstDay===0?6:firstDay-1)
.fill(null)
.map((_,i)=>(

<div key={i}></div>

))
}




{
[...Array(daysInMonth)].map((_,i)=>{


const day=i+1;

const shift=getShift(day);



return (

<button

key={day}

onClick={()=>setSelectedDay(day)}

className={`h-14 rounded-xl font-bold

${
day===selectedDay

?

"ring-4 ring-offset-2 dark:ring-offset-slate-800 ring-sky-500"

:

""

}

${
shift?.completed

?

"bg-emerald-500 text-white"

:

shift?.holiday

?

"bg-red-500 text-white"

:

shift?.type==="vacation"

?

"bg-amber-500 text-white"

:

shift?.type==="day"

?

"bg-sky-500 text-white"

:

shift?.type==="night"

?

"bg-indigo-600 text-white"

:

"bg-slate-100 dark:bg-slate-700 dark:text-white"

}

`}

>

{day}

</button>


);


})

}



</div>

</>

)}



<div className="mt-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">

<div className="flex items-center gap-2">
  <span className="w-4 h-4 rounded bg-sky-500 inline-block"></span>
  Dzień
</div>

<div className="flex items-center gap-2">
  <span className="w-4 h-4 rounded bg-indigo-600 inline-block"></span>
  Noc
</div>

<div className="flex items-center gap-2">
  <span className="w-4 h-4 rounded bg-red-500 inline-block"></span>
  Święto
</div>

<div className="flex items-center gap-2">
  <span className="w-4 h-4 rounded bg-amber-500 inline-block"></span>
  Urlop
</div>

<div className="flex items-center gap-2">
  <span className="w-4 h-4 rounded bg-emerald-500 inline-block"></span>
  Wykonany
</div>

</div>




{
selectedDay &&

<div className="mt-5 bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl transition-colors">


<h3 className="font-bold mb-3 text-slate-800 dark:text-white">

📅 {createDate(selectedDay)}

</h3>



{
getShift(selectedDay)

?

<>


<button

onClick={completeShift}

disabled={saving || getShift(selectedDay)?.completed}

className="w-full bg-emerald-600 text-white font-bold p-3 rounded-xl mb-2 disabled:opacity-60 disabled:cursor-not-allowed"

>

{getShift(selectedDay)?.completed
  ? "✅ Dyżur wykonany"
  : saving
    ? "Zapisywanie..."
    : "✅ Oznacz jako wykonany"}

</button>



<button

onClick={deletePlan}

disabled={saving}

className="w-full bg-red-500 text-white font-bold p-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"

>

{saving ? "Usuwanie..." : "🗑️ Usuń dyżur"}

</button>


</>


:

<>

<button

onClick={()=>setType("day")}

className={`w-full p-3 rounded-xl mb-2 font-bold ${type==="day" ? "bg-sky-500 text-white" : "bg-sky-200 text-sky-900 dark:bg-sky-950 dark:text-sky-100"}`}

>
🟦 Dzień
</button>



<button

onClick={()=>setType("night")}

className={`w-full p-3 rounded-xl mb-2 font-bold ${type==="night" ? "bg-indigo-600 text-white" : "bg-indigo-200 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100"}`}

>
🟪 Noc
</button>



<button

onClick={()=>{ setType("vacation"); setHoliday(false); }}

className={`w-full p-3 rounded-xl mb-2 font-bold ${type==="vacation" ? "bg-amber-500 text-white" : "bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-100"}`}

>
🏖️ Urlop
</button>



{
type!=="vacation" &&

<button

onClick={()=>setHoliday(!holiday)}

className={`w-full p-3 rounded-xl mb-3 font-bold ${holiday ? "bg-red-500 text-white" : "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-100"}`}

>
🟥 Święto
</button>
}



<button

onClick={savePlan}

disabled={saving}

className="w-full bg-emerald-600 text-white font-bold p-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"

>

{saving ? "Zapisywanie..." : "💾 Dodaj"}

</button>

</>

}


</div>

}


</div>

</div>

);


}


export default Calendar;