import React from "react";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ReplayIcon from '@mui/icons-material/Replay';

export default function Task(props) {

    return (
        <ListItem
        secondaryAction={
          <IconButton 
            edge="end" 
            aria-label="comments" 
            onClick={event => props.allowEdit && props.onEdit(event, props.id)}
            >
            {props.isRecurrence && <ReplayIcon />}
            {props.allowEdit && <EditIcon />}
          </IconButton>
        }
        disablePadding
      >
        <ListItemButton role={undefined} dense>
          <ListItemIcon>
            <Checkbox
              key={props.id}
              edge="start"
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': props.id }}
              onChange={event => props.onChecked(event, props.id)}
            />
          </ListItemIcon>
          <ListItemText 
            id={props.id} 
            primary={props.item}
            primaryTypographyProps={{ 
                variant: 'subtitle2', 
                style: {
                    color: props.taskColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
            }}}
            secondary={props.due}
            secondaryTypographyProps={{ 
                style: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 10
            }}}
             />
        </ListItemButton>
        <Divider />
    </ListItem>       
    );
}

