import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import MyDatePicker from "../components/MyDatePicker";
import TextPredictNew from "../components/TextPredictNew";
import { encodeDate, stringToDate } from "../utils/dates";
import { getWindowSize } from "../utils/windowsz";
import { getRecurrenceOptions, getNoRecurrence } from "../utils/recurrences";
import { getTask, getTaskLists, updateTask } from "../utils/dbaccess";

export default function Edit() {
    const [form, setForm] = useState({
        item: "",
        due: null,
        note: "",
        taskList: "",
        recurrence: getNoRecurrence(),
        completed: false,
    });
    const [taskLists, setTaskLists] = useState([]);
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();

            const task = await getTask(id);
            if (!task) {
                window.alert(`Task with id ${id} not found`);
                navigate("/");
                return;
            }

            // celebrate weak typing
            task.due = stringToDate(task.due);
            setForm(task);
        }

        // get the task lists used by the system
        async function getTheTaskLists() {
            const lists = await getTaskLists();
            setTaskLists(lists);
        }

        fetchData();
        getTheTaskLists();

        return;
    }, [params.id, navigate]);

    // These methods will update the state properties.
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    function updateRecurrence(newValue) {
        if (
            !newValue ||
            newValue.length <= 0 ||
            !getRecurrenceOptions().includes(newValue)
        ) {
            newValue = "None";
        }
        updateForm({ recurrence: newValue });
    }

    async function onSubmit(e) {
        e.preventDefault();
        const editedTask = {
            item: form.item,
            due: encodeDate(form.due),
            note: form.note,
            taskList: form.taskList,
            recurrence: form.recurrence,
            completed: form.completed,
        };

        // This will send a post request to update the data in the database.
        await updateTask(params.id, editedTask);
        navigate("/");
    }

    // callback for the date picker
    function handleDateChange(newValue) {
        updateForm({ due: newValue });
    }

    function handleTaskListChange(newValue) {
        updateForm({ taskList: newValue });
    }

    var windowSz = getWindowSize();

    // This following section will display the form that takes input from the user to update the data.
    return (
        <Container
            sx={{
                width: windowSz.outerWidth,
                height: windowSz.outerHeight,
                marginTop: windowSz.marginTop,
            }}
        >
            <Box sx={{ flexGrow: 1, borderRadius: "10px" }}>
                <AppBar
                    position="static"
                    sx={{ borderRadius: "10px 10px 0px 0px" }}
                >
                    <Toolbar>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1 }}
                        >
                            Update Task
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
            <Paper
                sx={{
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    borderRadius: "10px",
                }}
            >
                <Stack
                    className="container"
                    direction="column"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    //sx={{ maxHeight: "500px" }}
                    spacing={2}
                >
                    <TextField
                        value={form.item}
                        onChange={(e) => updateForm({ item: e.target.value })}
                        label={"Task"}
                        fullWidth
                    />
                    <MyDatePicker
                        sx={{ width: "280px" }}
                        date={form.due}
                        label={"Due Date"}
                        callback={handleDateChange}
                    />
                    <Autocomplete
                        value={form.recurrence}
                        options={getRecurrenceOptions()}
                        onChange={(event, newValue) =>
                            updateRecurrence(newValue)
                        }
                        fullWidth
                        renderInput={(params) => (
                            <TextField {...params} label="Recurs" />
                        )}
                    />
                    <TextPredictNew
                        list={taskLists}
                        callback={handleTaskListChange}
                        value={form.taskList}
                    />
                    <TextField
                        value={form.note}
                        onChange={(e) => updateForm({ note: e.target.value })}
                        label={"Note"}
                        multiline
                        fullWidth
                        rows={5}
                    />
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="center"
                        spacing={2}
                        sx={{ width: "100%" }}
                    >
                        <Button
                            onClick={(event) => onSubmit(event)}
                            variant="contained"
                            startIcon={<SaveIcon />}
                        >
                            Save
                        </Button>
                        <Button
                            onClick={() => navigate("/")}
                            variant="contained"
                            startIcon={<CancelIcon />}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
}
