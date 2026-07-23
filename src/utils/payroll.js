// Oblicza datę Wielkanocy (niedziela) dla podanego roku (algorytm Meeusa/Jonesa/Butchera)
function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }
  
  // Dodaje dni do daty w formacie "YYYY-MM-DD" i zwraca ją w tym samym formacie
  function addDays(dateStr, days) {
    const date = new Date(`${dateStr}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
  
  // Zwraca listę polskich dni ustawowo wolnych od pracy dla danego roku
  function getPolishHolidays(year) {
    const easter = getEasterSunday(year);
    const easterStr = easter.toISOString().slice(0, 10);
  
    return new Set([
      `${year}-01-01`,
      `${year}-01-06`,
      addDays(easterStr, 1),
      `${year}-05-01`,
      `${year}-05-03`,
      addDays(easterStr, 49),
      addDays(easterStr, 60),
      `${year}-08-15`,
      `${year}-11-01`,
      `${year}-11-11`,
      `${year}-12-25`,
      `${year}-12-26`
    ]);
  }
  
  // Sprawdza, czy podana data (YYYY-MM-DD) jest polskim dniem ustawowo wolnym
  export function isPolishHoliday(dateStr) {
    const year = Number(dateStr.slice(0, 4));
    return getPolishHolidays(year).has(dateStr);
  }
  
  // Zwraca procent dodatku wynikający z TYPU DNIA dla danej daty.
  // Święto ma pierwszeństwo przed sobotą/niedzielą (prawo traktuje święto tak jak niedzielę).
  function getDayTypePercent(dateStr, settings) {
  
    if (isPolishHoliday(dateStr)) {
      return Number(settings.holidayPercent || 0);
    }
  
    const day = new Date(`${dateStr}T12:00:00`).getDay();
  
    if (day === 6) {
      return Number(settings.saturdayPercent || 0);
    }
  
    if (day === 0) {
      return Number(settings.sundayPercent || 0);
    }
  
    return 0;
  
  }
  
  // Dzieli dyżur na odcinki godzinowe zgodnie z rzeczywistym czasem zegarowym.
  // Dyżur dzienny (7:00-19:00) nie przekracza północy i nie wchodzi w porę nocną -> jeden odcinek.
  // Dyżur nocny (19:00-07:00) dzieli się na 4 odcinki wg ustawowej pory nocnej (22:00-06:00):
  //   19:00-22:00 (3h, dzień startu, bez dodatku nocnego)
  //   22:00-24:00 (2h, dzień startu, pora nocna)
  //   00:00-06:00 (6h, dzień następny, pora nocna)
  //   06:00-07:00 (1h, dzień następny, bez dodatku nocnego)
  function getShiftSegments(shift) {
  
    const totalHours = Number(shift.hours) || 0;
  
    if (shift.type !== "night") {
      return [{ date: shift.date, hours: totalHours, isNight: false }];
    }
  
    // Podział 3h/2h/6h/1h zakłada standardowy dyżur nocny 19:00-07:00 (12h).
    // Jeśli kiedyś pojawią się dyżury nocne o innej długości, ten podział przestanie
    // być dokładny - na razie w całej aplikacji dyżury zawsze mają 12h.
    if (totalHours !== 12) {
      return [{ date: shift.date, hours: totalHours, isNight: true }];
    }
  
    const nextDate = addDays(shift.date, 1);
  
    return [
      { date: shift.date, hours: 3, isNight: false }, // 19:00-22:00
      { date: shift.date, hours: 2, isNight: true },  // 22:00-24:00
      { date: nextDate, hours: 6, isNight: true },    // 00:00-06:00
      { date: nextDate, hours: 1, isNight: false }    // 06:00-07:00
    ];
  
  }
  
  // Liczy DOPŁATĘ za jeden odcinek godzin (nie pełną stawkę godzinową!).
  // Pensja podstawowa już pokrywa przepracowane godziny wg grafiku -
  // tu liczymy wyłącznie dodatek za porę nocną / weekend / święto.
  function calculateSegmentAmount(segment, settings) {
  
    const bonusPercent =
      getDayTypePercent(segment.date, settings) +
      (segment.isNight ? Number(settings.nightPercent || 0) : 0);
  
    if (bonusPercent === 0) {
      return 0;
    }
  
    return segment.hours * Number(settings.hourRate || 0) * (bonusPercent / 100);
  
  }
  
  // Zwraca zakres dat (YYYY-MM-DD) trzech pełnych miesięcy kalendarzowych
  // bezpośrednio poprzedzających miesiąc, w którym wypada podana data.
  function getThreeMonthWindowBefore(dateStr) {
  
    const year = Number(dateStr.slice(0, 4));
    const month = Number(dateStr.slice(5, 7)); // 1-12
  
    const startDate = new Date(Date.UTC(year, month - 1 - 3, 1));
    const endDate = new Date(Date.UTC(year, month - 1, 0)); // dzień 0 = ostatni dzień poprzedniego miesiąca
  
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10)
    };
  
  }
  
  // Liczy średnią stawkę dodatków (zł/h) na podstawie przepracowanych dyżurów
  // (nie urlopowych) w 3 pełnych miesiącach kalendarzowych poprzedzających
  // miesiąc, w którym wypada dany dzień urlopu.
  function getAverageBonusRate(allShifts, vacationDate, settings) {
  
    const { start, end } = getThreeMonthWindowBefore(vacationDate);
  
    let sumHours = 0;
    let sumBonus = 0;
  
    allShifts.forEach((shift) => {
  
      if (shift.type === "vacation" || !shift.date) {
        return;
      }
  
      if (shift.date < start || shift.date > end) {
        return;
      }
  
      const segments = getShiftSegments(shift);
  
      segments.forEach((segment) => {
        sumBonus += calculateSegmentAmount(segment, settings);
      });
  
      sumHours += Number(shift.hours || 0);
  
    });
  
    if (sumHours === 0) {
      return 0;
    }
  
    return sumBonus / sumHours;
  
  }
  
  // Liczy przewidywaną wypłatę na podstawie listy dyżurów i ustawień wynagrodzenia
  export function calculateTotalSalary(shifts, settings) {
  
    let total = Number(settings.basicSalary || 0);
  
    shifts.forEach((shift) => {
  
      if (shift.type === "vacation") {
  
        const hours = Number(shift.hours || 0);
        const averageRate = getAverageBonusRate(shifts, shift.date, settings);
  
        total += hours * averageRate;
  
        return;
  
      }
  
      if (!shift.date) {
        return;
      }
  
      const segments = getShiftSegments(shift);
  
      segments.forEach((segment) => {
        total += calculateSegmentAmount(segment, settings);
      });
  
    });
  
    return total;
  
  }