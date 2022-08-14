
    function encodeDate(dt) {
        return (dt.getMonth() + 1) + "-" + dt.getDate() + "-" + dt.getFullYear();
    }

    function addDays(dateS, nDays) {
        var startDate = new Date(dateS);
        var newDate = new Date();
        newDate.setDate(startDate.getDate() + nDays);
        return encodeDate(newDate);
    }

    function addMonths(dateS, nMonths) {
        var startDate = new Date(dateS);
        var newDate = new Date();
        newDate.setMonth(startDate.getMonth() + nMonths);
        return encodeDate(newDate);
    }

    function addYears(dateS, nYears) {
        var startDate = new Date(dateS);
        var newDate = new Date();
        newDate.setFullYear(startDate.getFullYear() + nYears);
        return encodeDate(newDate);
    }

    function getDayOfWeek(dateS) {
        var date = new Date(dateS);
        return date.toLocaleDateString('en-US', {weekday: 'long'});
    }

    function getToday() {
        return encodeDate(new Date());
    }

    function compareDates(d1, d2) {
        const [month1, date1, year1] = d1.split("-");
        const [month2, date2, year2] = d2.split("-");

        if (year1 < year2) return -1;
        if (year1 > year2) return 1;
        if (month1 < month2) return -1;
        if (month1 > month2) return 1;
        if (date1 < date2) return -1;
        if (date1 > date2) return 1;
        return 0;
    }

    export {encodeDate, addDays, addMonths, addYears, getToday, getDayOfWeek, compareDates};
    