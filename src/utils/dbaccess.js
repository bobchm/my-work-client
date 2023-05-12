import taskURL from "./taskURL";

function getParams(completed, due, taskList) {
    var params = { completed: completed };

    if (taskList && taskList.length > 0) {
        params = { ...params, taskList: taskList };
    }

    if (due.length > 0) {
        params = { ...params, due: due };
    }

    return "?" + new URLSearchParams(params);
}

// get all tasks
async function getAllTasks(completed, due, taskList) {
    const response = await fetch(
        taskURL("task/" + getParams(completed, due, taskList))
    );

    if (!response.ok) {
        throw new Error(`An error occured: ${response.statusText}`);
    }

    return await response.json();
}

async function getTask(id) {
    const response = await fetch(taskURL(`task/${id}`));

    if (!response.ok) {
        throw new Error(`An error has occured: ${response.statusText}`);
    }

    return response.json();
}

async function getTaskLists() {
    const response = await fetch(taskURL("taskLists/"));

    if (!response.ok) {
        throw new Error(`An error occured: ${response.statusText}`);
    }

    return await response.json();
}

async function updateTask(id, taskDef) {
    await fetch(taskURL(`update/${id}`), {
        method: "POST",
        body: JSON.stringify(taskDef),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// add task to the database
async function addTaskToDB(task) {
    await fetch(taskURL("task/add"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    }).catch((error) => {
        console.log(error);
        return;
    });
}

// delete a task from MongoDB based on id
async function deleteTaskFromDB(id) {
    await fetch(taskURL(`${id}`), {
        method: "DELETE",
    });
}

// delete a task from MongoDB based on description
async function deleteTaskFromDBQuery(qry) {
    var qry_S = "?" + new URLSearchParams(qry);
    const response = await fetch(taskURL("task/" + qry_S));

    if (!response.ok) {
        console.log(`An error occured: ${response.statusText}`);
        return;
    }

    const tasks = await response.json();
    if (tasks && tasks.length > 0) {
        await deleteTaskFromDB(tasks[0]._id);
    }
}

// delete all tasks matching query from MongoDB really slowly - should add a server-side function to support
async function deleteTasksFromDBQuery(qry) {
    var qry_S = "?" + new URLSearchParams(qry);
    const response = await fetch(taskURL("task/" + qry_S));

    if (!response.ok) {
        console.log(`An error occured: ${response.statusText}`);
        return;
    }

    const tasks = await response.json();
    if (tasks && tasks.length > 0) {
        for (var i = 0; i < tasks.length; i++) {
            await deleteTaskFromDB(tasks[i]._id);
            console.log(`${i + 1} of ${tasks.length}`);
        }
    }
}

// handler for the task completion button
async function changeTaskInDB(id, key, value) {
    // get the task from the database
    const id_s = id.toString();
    const response = await fetch(taskURL(`task/${id_s}`));

    if (!response.ok) {
        console.log(`An error has occured: ${response.statusText}`);
        return;
    }

    const task = await response.json();
    if (!task) {
        console.log(`Task with id ${id_s} not found`);
        return;
    }

    // mark as complete
    var newTask = { ...task, [key]: value };

    // save back to database
    await fetch(taskURL(`update/${id_s}`), {
        method: "POST",
        body: JSON.stringify(newTask),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export {
    getAllTasks,
    getTask,
    getTaskLists,
    updateTask,
    addTaskToDB,
    deleteTaskFromDB,
    changeTaskInDB,
    deleteTaskFromDBQuery,
    deleteTasksFromDBQuery,
};
