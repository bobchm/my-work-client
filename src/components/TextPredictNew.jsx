import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions();

export default function TextPredictNew(props) {
  const [value, setValue] = React.useState(null);

  return (
    <Autocomplete
      value={props.value}
      onChange={function (event, newValue) {
        if (typeof newValue === 'string') {
          setValue(newValue);
          props.callback(newValue);
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue(newValue.inputValue);
          props.callback(newValue.inputValue);
        } else {
          setValue(newValue);
          props.callback(newValue);
        }

      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option);
        if (inputValue !== '' && !isExisting) {
          filtered.push(`${inputValue}`);
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="text-predict-new"
      options={props.list}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option;
      }}
      renderOption={(props, option) => <li {...props}>{option}</li>}
      freeSolo
      fullWidth
      renderInput={(params) => (
        <TextField {...params} fullWidth label="Task List Name" />
      )}
    />
  );
}
