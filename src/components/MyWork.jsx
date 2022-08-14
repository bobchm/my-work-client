import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stack from '@mui/material/Stack';
import WorkAppBar from "./WorkAppBar";
import SettingsDisplay from "./SettingsDisplay";
import ActionRow from "./ActionRow";
import WorkInput from "./WorkInput";
import TaskList from "./TaskList";
import {addDays, getToday, compareDates} from "../dates";
import {getNoRecurrence, isRecurrence, updateForRecurrence} from "../recurrences";
import { getCookie, setCookie } from "../cookies";
import taskURL from "../taskURL";

export default function MyWork() {
    const [tasks, setTasks] = useState([]);
    const [inputText, setInputText] = useState("");
    const [anySelected, setAnySelected] = useState(false);
    
    // we can pass in state for due date, completed, and list
    const [initDue, initCompleted, initTaskList] = restoreDisplayContext("All", false, "");
    const [due, setDue] = useState(initDue);
    const [completed, setCompleted] = useState(initCompleted);
    const [taskList, setTaskList] = useState(initTaskList);
    const [taskLists, setTaskLists] = useState([]);
 
    const navigate = useNavigate();
    
    // This fetches the tasks from the database.
    useEffect(() => {

        saveDisplayContext();
        updateTaskLists();
        updateTasks();

        return;
          // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks.length, completed, due, taskList]);

    function getParams() {
        var params = {completed: completed};
        var sDate;

        if (taskList && taskList.length > 0) {
            params = {...params, taskList: taskList};
        }

        switch (due) {
            case "Today":
                sDate = getToday();
                break;
            case "Tomorrow":
                sDate = addDays(getToday(), 1);
                break;
            default:
                sDate = "";
        }
        if (sDate.length > 0) {
            params = {...params, due: sDate};
        }

        return "?" + new URLSearchParams(params);
    }

    // get all or filtered tasks from MongoDB
    async function updateTasks() {
        const response = await fetch(taskURL('task/' + getParams()));

        if (!response.ok) {
            const message = `An error occured: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const tasks = await response.json();
        tasks.map((task) => task.checked = false);
        sortAndSetTasks(tasks);
    }

    // get the task lists used by the system
    async function updateTaskLists() {
        const response = await fetch(taskURL('taskLists/'));

        if (!response.ok) {
            const message = `An error occured: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const lists = await response.json();
        setTaskLists(lists);
    }

    // sort tasks based on the current filter criteria and set
    async function sortAndSetTasks(tasks) {
        await tasks.sort(function(a, b) {
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
        setCookie("dueDate", due, {'max-age': 60*60*24});
        setCookie("completed", completed, {'max-age': 60*60*24});
        setCookie("taskList", taskList, {'max-age': 60*60*24});
    }

    // handler for typing into the task text box
    function handleChange(event) {
        const newValue = event.target.value;
        setInputText(newValue);
    }

    // add task to the database
    async function addTaskToDB(task) {
        await fetch(taskURL("task/add"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
          })
          .catch(error => {
            window.alert(error);
            return;
          });
    }

    // add a new task
    async function addTask(event) {
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
                completed: false
            }

            addTaskToDB(jtask);
          
            setInputText("");

            // force useEffects
            jtask.checked = false;
            tasks.push(jtask);
            sortAndSetTasks(tasks);
        }
        //event.preventDefault();
    }

    function isMixingDates() {
        return due === "All";
    }

    function addTaskSubmit(event) {
        setTimeout(function() {
            addTask(event);
        }, 100);
        event.preventDefault();
    }

    // they toggled one of the task checkboxes - enable/disable relevant buttons
    function doCheckboxToggle(event, id) {
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

    // delete a task from MongoDB based on id
    async function deleteTask(id) {
        await fetch(taskURL(`${id}`), {
            method: "DELETE"
        });        
    }

    // delete a task from MongoDB based on description
    async function deleteTaskFromQuery(qry) {

        var qry_S = "?" + new URLSearchParams(qry);
        const response = await fetch(taskURL('task/' + qry_S));

        if (!response.ok) {
            console.log(`An error occured: ${response.statusText}`);
            return;
        }

        const tasks = await response.json();
        if (tasks && tasks.length > 0) {
            await fetch(taskURL(`${tasks[0]._id}`), {
                method: "DELETE"
            });
        }        
    }

    // handler for the task completion button
    async function changeTask(id, key, value) {

        // get the task from the database
        const id_s = id.toString();
        const response = await fetch(taskURL(`task/${id_s}`));
  
        if (!response.ok) {
          const message = `An error has occured: ${response.statusText}`;
          window.alert(message);
          return;
        }
  
        const task = await response.json();
        if (!task) {
          window.alert(`Task with id ${id_s} not found`);
          return;
        }

        // mark as complete
        var newTask = {...task, [key]: value};

        // save back to database
        await fetch(taskURL(`update/${id_s}`), {
            method: "POST",
            body: JSON.stringify(newTask),
            headers: {
              'Content-Type': 'application/json'
            },
          });
    }

    // handler for the delete button
    function handleDelete() {
        const newItems = tasks.filter((item) => {
            var thisone = item.checked;
            if (thisone) {
                deleteTask(item._id);
            }
            return (!thisone);
        });

        sortAndSetTasks(newItems);
        setAnySelected(false);
    }

    // deal with recurring tasks - if completing a recurring task, schedule the next recurrence if
    //   "uncompleting" a recurring task, try to delete the scheduled task created when it was completed
    //   return true if a task was created or destroyed, false otherwise
    function handleRecurrence(task) {
        if (!isRecurrence(task.recurrence)) {
            return false;
        }

        // if item is incomplete, that means we're going from incomplete to complete so have to create the next occurence
        if (!task.completed) {
            var newTask = {
                item: task.item,
                due: updateForRecurrence(task.due, task.recurrence),
                note: task.note,
                taskList: task.taskList,
                recurrence: task.recurrence,
                completed: false
            }
            addTaskToDB(newTask);
        } else {
            // this is a recurring task that was marked as complete so generated a follow-on task
            var qry = {
                item: task.item,
                due: updateForRecurrence(task.due, task.recurrence),
                recurrence: task.recurrence,
            }
            deleteTaskFromQuery(qry);
        }
        return true;
    }

    // handler for toggling the complete flag of marked tasks
    function handleToggleComplete() {
        var resetTasks = false;
        const newItems = tasks.filter((item) => {
            var thisone = item.checked
            if (thisone) {
                changeTask(item._id, "completed", !item.completed);

                // if we're completing (or uncompleting) a recurring task, that need special handling
                if (handleRecurrence(item)) {
                    resetTasks = true;
                }
            }
            return (!thisone);
        });

        setAnySelected(false);
        if (resetTasks) {
            setTasks([]);
            setTimeout(() => updateTasks, 100);
        } else {
            sortAndSetTasks(newItems);
        }
    }

    function handlePostpone() {
        const newItems = tasks.filter((item) => {
            var thisone = item.checked;
            if (thisone) {
                changeTask(item._id, "due", addDays(item.due, 1));
            }
            return (!thisone);
        });

        sortAndSetTasks(newItems);
        setAnySelected(false);
    }

    function menuSettingsCallback(settings) {
        if (settings) {
            setCompleted(settings.completed);
            setDue(settings.due);
            setTaskList(settings.taskList);
        }
    }

    // render
    return (
        <div>
            <WorkAppBar 
                settingsCallback={menuSettingsCallback} 
                completed={completed} due={due} 
                taskList={taskList}
                taskLists={taskLists}
                />
            <Stack className="container" direction="column" alignItems="flex-start" justifyContent="flex-start" spacing={2}>
                <SettingsDisplay completed={completed} due={due} taskList={taskList} />
                <WorkInput addItem={addTaskSubmit} handleChange={handleChange} inputText={inputText} sx={{width: "100%"}}/>
                <TaskList 
                    tasks={tasks} 
                    onChecked={doCheckboxToggle}
                    allowEdit={!completed}
                    onEdit={handleEdit}
                    showDates={isMixingDates()}
                    warnOnLate={!completed}
                />
                <ActionRow 
                    onDelete={handleDelete} 
                    onToggleComplete={handleToggleComplete} 
                    onPostpone={handlePostpone} 
                    anySelected={anySelected}
                    doComplete={!completed}
                />
            </Stack>
        </div>
    );
}

