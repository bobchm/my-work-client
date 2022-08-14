import React from "react";
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import UndoIcon from '@mui/icons-material/Undo';
import PostAddIcon from '@mui/icons-material/PostAdd';

export default function ActionRow(props) {
    return (
        <Stack direction="row" alignItems="flex-start" justifyContent="center" spacing={2} sx={{width: "100%"}}>
            <IconButton 
                aria-label="complete" 
                disabled={!props.anySelected}
                color="primary"
                onClick={props.onToggleComplete}>
                {props.doComplete ?<DoneIcon /> : <UndoIcon />}
            </IconButton>
            <IconButton 
                aria-label="delete" 
                disabled={!props.anySelected} 
                color="primary"
                onClick={props.onDelete}>
                <DeleteIcon />
            </IconButton>
            <IconButton 
                aria-label="postpone" 
                disabled={!props.anySelected || !props.doComplete} 
                color="primary"
                onClick={props.onPostpone}>
                <PostAddIcon />
            </IconButton>        
        </Stack>
    )
}
