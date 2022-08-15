import taskURL from "./taskURL";

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

export { addTaskToDB, deleteTaskFromDB, changeTaskInDB, deleteTaskFromDBQuery };
