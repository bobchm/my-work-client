import {addDays, addMonths, addYears, getDayOfWeek} from "./dates";

function getRecurrenceOptions() {
    return [
        "None",
        "Daily",
        "Weekdays",
        "Weekly",
        "Monthly",
        "Yearly"
    ];
}

function getNoRecurrence() {
    return "None";
}

function isRecurrence(rec) {
    return (rec && getRecurrenceOptions().includes(rec) && (rec !== "None"));
}

function updateForRecurrence(oldDate, rec) {

    var newDate;
    switch (rec) {
        case "Daily":
            newDate = addDays(oldDate, 1);
            break;

        case "Weekdays":
            if (getDayOfWeek(oldDate) === "Friday") {
                newDate = addDays(oldDate, 3);
            } else {
                newDate = addDays(oldDate, 1);
            }
            break;

        case "Weekly":
            newDate = addDays(oldDate, 7);
            break;

        case "Monthly":
            newDate = addMonths(oldDate, 1);
            break;

        case "Yearly":
            newDate = addYears(oldDate, 1);
            break;

        default:
            newDate = oldDate;
    }
    return newDate;
}

export {getRecurrenceOptions, getNoRecurrence, isRecurrence, updateForRecurrence};