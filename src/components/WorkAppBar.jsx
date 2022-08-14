import React, {useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Check from '@mui/icons-material/Check';

export default function ButtonAppBar(props) {
  const [anchor, setAnchor] = useState(null);
  const [completed, setCompleted] = useState(props.completed);
  const [due, setDue] = useState(props.due);
  const [taskList, setTaskList] = useState(props.taskList);

  const dueOptions = ["All", "Today", "Tomorrow"];

  function buildOptions() {
    return {
      completed: completed,
      due: due,
      taskList: taskList
    }
  }

  const openMenu = (event) => {
    setAnchor(event.currentTarget);
  };

  function closeMenu(settingsCallback) {
    setAnchor(null);
    if (settingsCallback) {
      var options = buildOptions();
      settingsCallback(options);
    }
  };

  const onCompletedClick = (event) => {
    setCompleted(!completed);
  };

  const onDueClick = (event, idx) => {
    setDue(dueOptions[idx]);
  }

  const onTaskListClick = (event, idx, taskLists) => {
    if (idx < 0) {
      setTaskList("");
    } else {
      setTaskList(taskLists[idx]);
    }
  }

  return (
    <Box sx={{ flex: 1, flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={openMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            open={Boolean(anchor)}
            anchorEl={anchor}
            onClose={() => closeMenu(props.settingsCallback)}
            keepMounted
            // TransitionComponent={Slide}
            PaperProps={{
              style: {
                maxHeight: 40 * 10,
                width: "20ch",
              },
            }}
          >
            <MenuItem
              key={0}
              onClick={(event) => onCompletedClick(event)}
            >
              {completed === true
                ? <><ListItemIcon><Check /></ListItemIcon>Completed</>
                : <ListItemText inset>Completed</ListItemText>}
            </MenuItem>
            <Divider />
            {dueOptions.map(function(opt, idx) {
              return (<MenuItem
                key={idx}
                onClick={(event) => onDueClick(event, idx)}
              >
                {due === dueOptions[idx] 
                  ? <><ListItemIcon><Check /></ListItemIcon>{opt}</>
                  : <ListItemText inset>{opt}</ListItemText>}
              </MenuItem>);
            }
            )}
            {props.taskLists && props.taskLists.length > 0 && <Divider />}
            {props.taskLists && props.taskLists.map(function(tl, idx) {
              return (<MenuItem
                key={idx}
                onClick={(event) => onTaskListClick(event, idx, props.taskLists)}
              >
                {tl === taskList 
                  ? <><ListItemIcon><Check /></ListItemIcon>{tl}</>
                  : <ListItemText inset>{tl}</ListItemText>}
              </MenuItem>);
            }
            )}
            <MenuItem
                onClick={(event) => onTaskListClick(event, -1, props.taskLists)}
              >
                {taskList === ""
                  ? <><ListItemIcon><Check /></ListItemIcon>{"All Task Lists"}</>
                  : <ListItemText inset>{"All Task Lists"}</ListItemText>}
              </MenuItem>
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Work
          </Typography>
          <IconButton color="inherit" edge="end"><SettingsIcon /></IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}