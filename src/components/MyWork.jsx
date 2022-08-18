import React, { useState, useEffect } from "react";
import { isMobileOnly } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import WorkAppBar from "./WorkAppBar";
import SettingsDisplay from "./SettingsDisplay";
import ActionRow from "./ActionRow";
import WorkInput from "./WorkInput";
import TaskList from "./TaskList";
import { addDays, getToday, compareDates } from "../utils/dates";
import {
    getAllTasks,
    addTaskToDB,
    deleteTaskFromDB,
    changeTaskInDB,
    deleteTaskFromDBQuery,
    getTaskLists,
} from "../utils/dbaccess";
import {
    getNoRecurrence,
    isRecurrence,
    updateForRecurrence,
} from "../utils/recurrences";
import { getCookie, setCookie } from "../utils/cookies";
import taskURL from "../utils/taskURL";

export default function MyWork() {
    const [tasks, setTasks] = useState([]);
    const [numTasks, setNumTasks] = useState(0);
    const [inputText, setInputText] = useState("");
    const [anySelected, setAnySelected] = useState(false);

    // we can pass in state for due date, completed, and list
    const [initDue, initCompleted, initTaskList] = restoreDisplayContext(
        "All",
        false,
        ""
    );
    const [due, setDue] = useState(initDue);
    const [completed, setCompleted] = useState(initCompleted);
    const [taskList, setTaskList] = useState(initTaskList);
    const [taskLists, setTaskLists] = useState([]);
    const [doUpdate, setDoUpdate] = useState(false);

    const navigate = useNavigate();

    // This fetches the tasks from the database.
    useEffect(() => {
        saveDisplayContext();
        updateTaskLists();
        updateTasks();
        setDoUpdate(false);
        return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numTasks, completed, due, taskList, doUpdate]);

    useEffect(() => {
        const interval = setInterval(() => setDoUpdate(true), 30000);
        return () => clearInterval(interval);
    }, []);

    function dateFromDue() {
        var sDate;

        switch (due) {
            case "Today":
                // for the Today filter, show today and overdue, so get all and then filter
                sDate = "";
                break;
            case "Tomorrow":
                sDate = addDays(getToday(), 1);
                break;
            default:
                sDate = "";
        }
        return sDate;
    }

    function postProcessTasks(tasks) {
        // if we're looking at "today's" tasks, we really want to include overdue as well
        var newTasks = tasks;
        if (due === "Today") {
            var today = getToday();
            newTasks = tasks.filter(
                (task) => compareDates(task.due, today) <= 0
            );
        }
        newTasks.map((task) => (task.checked = false));
        return newTasks;
    }

    // get all or filtered tasks from MongoDB
    async function updateTasks() {
        var tasks = await getAllTasks(completed, dateFromDue(), taskList);
        tasks = postProcessTasks(tasks);
        sortAndSetTasks(tasks);
    }

    // get the task lists used by the system
    async function updateTaskLists() {
        const lists = await getTaskLists();
        setTaskLists(lists);
    }

    // sort tasks based on the current filter criteria and set
    async function sortAndSetTasks(tasks) {
        await tasks.sort(function (a, b) {
            if (isMixingDates()) {
                var ans = compareDates(a.due, b.due);
                if (ans !== 0) return ans;
            }
            if (a.item < b.item) {
                return -1;
            } else if (a.item > b.item) {
                return 1;
            } else {
                return 0;
            }
        });

        setTasks(tasks);
        setNumTasks(tasks.length);
    }

    // set or get the diplay context across sessions
    function restoreDisplayContext(defaultDue, defaultCompleted, defaultList) {
        var cDueDate;
        var cCompleted;
        var cList;
        if ((cDueDate = getCookie("dueDate")) === undefined) {
            cDueDate = defaultDue;
        }
        if ((cCompleted = getCookie("completed")) === undefined) {
            cCompleted = defaultCompleted;
        } else if (cCompleted === "true") {
            cCompleted = true;
        } else {
            cCompleted = false;
        }
        if ((cList = getCookie("taskList")) === "undefined") {
            cList = defaultList;
        }
        return [cDueDate, cCompleted, cList];
    }

    function saveDisplayContext() {
        setCookie("dueDate", due, { "max-age": 60 * 60 * 24 });
        setCookie("completed", completed, { "max-age": 60 * 60 * 24 });
        setCookie("taskList", taskList, { "max-age": 60 * 60 * 24 });
    }

    // handler for typing into the task text box
    function handleChange(event) {
        const newValue = event.target.value;
        setInputText(newValue);
    }

    // add a new task
    function isMixingDates() {
        return due === "All" || due === "Today";
    }

    // they toggled one of the task checkboxes - enable/disable relevant buttons
    function handleCheckboxToggle(event, id) {
        var any = event.target.checked;
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i]._id === id) {
                tasks[i].checked = event.target.checked;
            } else if (tasks[i].checked) {
                any = true;
            }
        }
        setAnySelected(any);
    }

    // jump to the edit dialog page to edit a task
    function handleEdit(event, id) {
        // we're leaving this page, save the due date and completed incomplete context
        navigate(`/edit/${id}?due=${due}&completed=${completed}`);
    }

    async function doAddTask(event) {
        var text = inputText.trim();
        if (text.length > 0) {
            var dueDate = getToday();
            if (due === "Tomorrow") {
                dueDate = addDays(dueDate, 1);
            }
            var jtask = {
                item: text,
                due: dueDate,
                note: "",
                taskList: taskList,
                recurrence: getNoRecurrence(),
                completed: false,
            };

            await addTaskToDB(jtask);
            setInputText("");
            setNumTasks(numTasks + 1);
        }
    }

    function handleAddTask(event) {
        doAddTask(event);
        event.preventDefault();
    }

    async function doDelete() {
        var count = 0;
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            if (task.checked) {
                await deleteTaskFromDB(task._id);
                count += 1;
            }
        }

        setNumTasks(numTasks - count);
        setAnySelected(false);
    }

    // handler for the delete button
    function handleDelete() {
        doDelete();
    }

    // deal with recurring tasks - if completing a recurring task, schedule the next recurrence if
    //   "uncompleting" a recurring task, try to delete the scheduled task created when it was completed
    //   return true if a task was created or destroyed, false otherwise
    async function handleRecurrence(task) {
        if (!isRecurrence(task.recurrence)) return;

        // if item is incomplete, that means we're going from incomplete to complete so have to create the next occurence
        if (!task.completed) {
            var newTask = {
                item: task.item,
                due: updateForRecurrence(task.due, task.recurrence),
                note: task.note,
                taskList: task.taskList,
                recurrence: task.recurrence,
                completed: false,
            };
            await addTaskToDB(newTask);
        } else {
            // this is a recurring task that was marked as complete so generated a follow-on task
            var qry = {
                item: task.item,
                due: updateForRecurrence(task.due, task.recurrence),
                recurrence: task.recurrence,
            };
            await deleteTaskFromDBQuery(qry);
        }
    }

    async function doToggleComplete() {
        var resetTasks = false;
        var count = tasks.length;

        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            if (task.checked) {
                // toggle completion in the DB
                await changeTaskInDB(task._id, "completed", !task.completed);

                // if we're completing (or uncompleting) a recurring task, that need special handling
                if (isRecurrence(task.recurrence)) {
                    await handleRecurrence(task);
                    resetTasks = true;
                } else {
                    count -= 1;
                }
            }
        }

        setAnySelected(false);
        if (resetTasks) {
            setNumTasks(0);
        } else {
            setNumTasks(count);
        }
    }

    // handler for toggling the complete flag of marked tasks
    function handleToggleComplete() {
        doToggleComplete();
    }

    async function doPostpone() {
        var isAny = false;
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            if (task.checked) {
                isAny = true;
                await changeTaskInDB(task._id, "due", addDays(task.due, 1));
            }
        }

        setAnySelected(false);
        if (isAny) {
            setNumTasks(0);
        }
    }

    function handlePostpone() {
        doPostpone();
    }

    function menuSettingsCallback(settings) {
        if (settings) {
            setCompleted(settings.completed);
            setDue(settings.due);
            setTaskList(settings.taskList);
            console.log("Task List: ", settings.taskList);
        }
    }

    // render
    return (
        <Container
            className="outerDiv"
            sx={{
                width: "80vw",
                height: "80vh",
                marginTop: "2vh",
            }}
        >
            <WorkAppBar
                settingsCallback={menuSettingsCallback}
                completed={completed}
                due={due}
                taskList={taskList}
                taskLists={taskLists}
                title="My Work"
            />
            <Stack
                className="container"
                direction="column"
                alignItems="flex-start"
                justifyContent="flex-start"
                spacing={1}
            >
                {!isMobileOnly && (
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="center"
                        sx={{ width: "100%" }}
                    >
                        <Autocomplete
                            disablePortal
                            disableClearable
                            fullWidth
                            sx={{ padding: "5px" }}
                            value={due}
                            onChange={(event, newValue) => setDue(newValue)}
                            options={["All", "Today", "Tomorrow"]}
                            renderInput={(params) => (
                                <TextField {...params} label="Day" />
                            )}
                        />
                        <Autocomplete
                            disablePortal
                            disableClearable
                            fullWidth
                            sx={{ padding: "5px" }}
                            value={
                                taskList && taskList.length > 0
                                    ? taskList
                                    : "All"
                            }
                            onChange={(event, newValue) =>
                                setTaskList(newValue === "All" ? "" : newValue)
                            }
                            options={[...taskLists, "All"]}
                            renderInput={(params) => (
                                <TextField {...params} label="Task List" />
                            )}
                        />
                    </Stack>
                )}
                {isMobileOnly && (
                    <SettingsDisplay
                        completed={completed}
                        due={due}
                        taskList={taskList}
                    />
                )}
                <WorkInput
                    addItem={handleAddTask}
                    handleChange={handleChange}
                    inputText={inputText}
                    sx={{ width: "100%" }}
                />
                <TaskList
                    tasks={tasks}
                    onChecked={handleCheckboxToggle}
                    allowEdit={!completed}
                    onEdit={handleEdit}
                    // showDates={isMixingDates()}
                    showDates={true}
                    warnOnLate={!completed}
                    sx={{ width: "100%", height: "800px" }}
                />
                {!isMobileOnly && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={completed}
                                onChange={(event) =>
                                    setCompleted(event.target.checked)
                                }
                            />
                        }
                        label="Completed"
                    />
                )}
                <ActionRow
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                    onPostpone={handlePostpone}
                    anySelected={anySelected}
                    doComplete={!completed}
                />
            </Stack>
        </Container>
    );
}
