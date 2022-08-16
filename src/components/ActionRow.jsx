import React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import UndoIcon from "@mui/icons-material/Undo";
import PostAddIcon from "@mui/icons-material/PostAdd";

export default function ActionRow(props) {
    return (
        <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="center"
            spacing={2}
            sx={{ width: "100%" }}
        >
            <Button
                variant="contained"
                disabled={!props.anySelected}
                color="primary"
                onClick={props.onToggleComplete}
                startIcon={props.doComplete ? <DoneIcon /> : <UndoIcon />}
            >
                {props.doComplete ? "Done" : "Undo"}
            </Button>
            <Button
                variant="contained"
                disabled={!props.anySelected}
                color="primary"
                onClick={props.onDelete}
                startIcon={<DeleteIcon />}
            >
                Delete
            </Button>
            <Button
                variant="contained"
                disabled={!props.anySelected || !props.doComplete}
                color="primary"
                onClick={props.onPostpone}
                startIcon={<PostAddIcon />}
            >
                Delay
            </Button>
        </Stack>
    );
}
