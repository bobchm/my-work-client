import React from "react";
import Task from "./Task";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { compareDates, getToday } from "../utils/dates";
import { isRecurrence } from "../utils/recurrences";

export default function TaskList({
    tasks,
    allowEdit,
    showDates,
    warnOnLate,
    onChecked,
    onEdit,
    loading,
}) {
    function getTaskColor(task, doWarnOnLate) {
        return doWarnOnLate && compareDates(task.due, getToday()) < 0
            ? "red"
            : "black";
    }

    return (
        <List
            sx={{
                overflow: "auto",
                width: "100%",
                height: "100%",
                bgcolor: "background.paper",
                fontSize: "14px",
                fontWeight: 500,
                boxShadow: 2,
                textAlign: "left",
                borderRadius: "10px",
            }}
        >
            <div className="TaskList-header">{tasks.length} Tasks Found</div>
            {loading ? (
                <Stack spacing={1}>
                    <Skeleton variant="rectangular" width="100%" height={80} />{" "}
                    <Skeleton variant="rectangular" width="100%" height={80} />{" "}
                    <Skeleton variant="rectangular" width="100%" height={80} />{" "}
                </Stack>
            ) : (
                tasks.map(function (task, idx) {
                    return (
                        <div key={idx}>
                            {idx === 0 && <Divider />}
                            <Task
                                key={idx}
                                id={task._id}
                                item={task.item}
                                allowEdit={allowEdit}
                                due={
                                    showDates
                                        ? task.due +
                                          (isRecurrence(task.recurrence)
                                              ? "@" + task.recurrence
                                              : "")
                                        : ""
                                }
                                taskColor={getTaskColor(task, warnOnLate)}
                                checked={task.checked}
                                onChecked={onChecked}
                                isRecurrence={isRecurrence(task.recurrence)}
                                onEdit={onEdit}
                            />
                            <Divider />
                        </div>
                    );
                })
            )}
        </List>
    );
}
