import React from "react";
import Task from "./Task";
import List from '@mui/material/List';
import Divider from '@mui/material/Divider'
import {compareDates, getToday} from "../dates";
import { isRecurrence } from "../recurrences";

export default function TaskList(props) {

    function getTaskColor(task, doWarnOnLate) {
        return ((doWarnOnLate && (compareDates(task.due, getToday()) < 0)) ? "red" : "black");
    }

    return (
        <List sx={{ overflow: 'auto', 
                    width: "100%",
                    minWidth: 400, 
                    maxWidth: 600, 
                    minHeight: 400, 
                    maxHeight: 400, 
                    bgcolor: 'background.paper',
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: 2,
                    textAlign: "left",
                    borderRadius: "10px"
                    }}>
            <div className="TaskList-header">{props.tasks.length} Tasks Found</div>
            {props.tasks.map(function(task, idx) {
                return (
                    <div key={idx}>
                        {idx === 0 && <Divider />}
                        <Task
                            key={idx}
                            id={task._id}
                            item={task.item}
                            allowEdit={props.allowEdit}
                            due={props.showDates ? task.due + (isRecurrence(task.recurrence) ? "@" + task.recurrence: ""): ""}
                            taskColor={getTaskColor(task, props.warnOnLate)}
                            checked={task.checked}
                            onChecked={props.onChecked}
                            isRecurrence={isRecurrence(task.recurrence)}
                            onEdit={props.onEdit}
                        />
                        <Divider />
                    </div>);
            }
            )}
        </List>
    );
}
