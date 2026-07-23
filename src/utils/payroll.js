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
      `${year}-01-01`, // Nowy Rok
      `${year}-01-06`, // Trzech Króli
      addDays(easterStr, 1), // Poniedziałek Wielkanocny
      `${year}-05-01`, // Święto Pracy
      `${year}-05-03`, // Święto Konstytucji 3 Maja
      addDays(easterStr, 49), // Zesłanie Ducha Świętego
      addDays(easterStr, 60), // Boże Ciało
      `${year}-08-15`, // Wniebowzięcie NMP
      `${year}-11-01`, // Wszystkich Świętych
      `${year}-11-11`, // Niepodległość
      `${year}-12-25`, // Boże Narodzenie (1 dzień)
      `${year}-12-26`  // Boże Narodzenie (2 dzień)
    ]);
  }
  
  // Sprawdza, czy podana data (YYYY-MM-DD) jest polskim dniem ustawowo wolnym
  export function isPolishHoliday(dateStr) {
    const year = Number(dateStr.slice(0, 4));
    return getPolishHolidays(year).has(dateStr);
  }
  
  // Dzieli dyżur na segmenty przypadające na poszczególne dni kalendarzowe.
  // Dyżur dzienny (7:00-19:00) nie przekracza północy -> jeden segment.
  // Dyżur nocny (19:00-7:00) dzieli się: 5h na dzień startu, 7h na dzień następny.
  function getShiftSegments(shift) {
  
    const totalHours = Number(shift.hours) || 0;
  
    if (shift.type !== "night") {
      return [{ date: shift.date, hours: totalHours }];
    }
  
    const firstPartHours = totalHours * (5 / 12);
    const secondPartHours = totalHours * (7 / 12);
    const nextDate = addDays(shift.date, 1);
  
    return [
      { date: shift.date, hours: firstPartHours },
      { date: nextDate, hours: secondPartHours }
    ];
  }
  
  // Liczy kwotę za jeden segment godzin, sumując dodatki od bazy (a nie mnożąc kaskadowo)
  function calculateSegmentAmount(segmentDate, hours, shiftType, settings) {
  
    const day = new Date(`${segmentDate}T12:00:00`).getDay();
  
    let bonusPercent = 0;
  
    if (shiftType === "night") {
      bonusPercent += Number(settings.nightPercent || 0);
    }
  
    if (day === 6) {
      bonusPercent += Number(settings.saturdayPercent || 0);
    }
  
    if (day === 0) {
      bonusPercent += Number(settings.sundayPercent || 0);
    }
  
    if (isPolishHoliday(segmentDate)) {
      bonusPercent += Number(settings.holidayPercent || 0);
    }
  
    const baseAmount = hours * Number(settings.hourRate || 0);
  
    return baseAmount * (1 + bonusPercent / 100);
  }
  
  // Liczy przewidywaną wypłatę na podstawie listy dyżurów i ustawień wynagrodzenia
  export function calculateTotalSalary(shifts, settings) {
  
    let total = Number(settings.basicSalary || 0);
  
    shifts.forEach((shift) => {
  
      if (shift.type === "vacation") {
        total += Number(settings.vacationDailyRate || 0);
        return;
      }
  
      if (!shift.date) {
        total += Number(shift.hours || 0) * Number(settings.hourRate || 0);
        return;
      }
  
      const segments = getShiftSegments(shift);
  
      segments.forEach((segment) => {
        total += calculateSegmentAmount(
          segment.date,
          segment.hours,
          shift.type,
          settings
        );
      });
  
    });
  
    return total;
  }