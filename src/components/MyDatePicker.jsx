import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function MyDatePicker(props) {
  const [value, setValue] = React.useState(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
          label={props.label}
          inputFormat="MM/dd/yyyy"
          value={props.date}
          onChange={function(newValue) {
                    setValue(newValue);
                    props.callback(newValue);
                  }}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
    </LocalizationProvider>
  );
}