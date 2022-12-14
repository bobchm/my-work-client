function encodeDate(dt) {
    return dt.getMonth() + 1 + "-" + dt.getDate() + "-" + dt.getFullYear();
}

function stringToDate(dateS) {
    // assumes mm-dd-yyyy
    var dta = dateS.split("-");
    if (dta.length !== 3) {
        throw new Error("stringToDate: invalid date format");
    }

    var month = parseInt(dta[0]);
    var day = parseInt(dta[1]);
    var year = parseInt(dta[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        throw new Error("stringToDate: invalid date format");
    }

    month -= 1; // months are zero-offset
    return new Date(year, month, day, 0, 0, 0);
}

function addDays(dateS, nDays) {
    var startDate = stringToDate(dateS);
    var newDate = new Date();
    newDate.setDate(startDate.getDate() + nDays);
    return encodeDate(newDate);
}

function addMonths(dateS, nMonths) {
    var startDate = stringToDate(dateS);
    var newDate = new Date();
    newDate.setMonth(startDate.getMonth() + nMonths);
    return encodeDate(newDate);
}

function addYears(dateS, nYears) {
    var startDate = stringToDate(dateS);
    var newDate = new Date();
    newDate.setFullYear(startDate.getFullYear() + nYears);
    return encodeDate(newDate);
}

function getDayOfWeek(dateS) {
    var date = stringToDate(dateS);
    return date.toLocaleDateString("en-US", { weekday: "long" });
}

function getToday() {
    return encodeDate(new Date());
}

function compareDates(d1, d2) {
    const [smonth1, sdate1, syear1] = d1.split("-");
    const [smonth2, sdate2, syear2] = d2.split("-");

    var year1 = parseInt(syear1);
    var year2 = parseInt(syear2);
    if (year1 < year2) return -1;
    if (year1 > year2) return 1;

    var month1 = parseInt(smonth1);
    var month2 = parseInt(smonth2);
    if (month1 < month2) return -1;
    if (month1 > month2) return 1;

    var date1 = parseInt(sdate1);
    var date2 = parseInt(sdate2);
    if (date1 < date2) return -1;
    if (date1 > date2) return 1;
    return 0;
}

export {
    encodeDate,
    addDays,
    addMonths,
    addYears,
    getToday,
    getDayOfWeek,
    compareDates,
    stringToDate,
};
