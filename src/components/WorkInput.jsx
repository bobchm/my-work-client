import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function WorkingInput(props) {
    return (
        <form className="workingInputForm" onSubmit={props.addItem}>
            <Stack
                className="workingInputContainer"
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
            >
                <TextField
                    variant="outlined"
                    onChange={props.handleChange}
                    value={props.inputText}
                    sx={{
                        bgcolor: "background.paper",
                        boxShadow: 2,
                        borderColor: "background.paper",
                        borderRadius: "10px",
                        width: "100%",
                    }}
                />
                <Button
                    onClick={props.addItem}
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                >
                    Add
                </Button>
            </Stack>
        </form>
    );
}
