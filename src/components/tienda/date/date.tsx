import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

interface DatePickersProps {
    label: string;
    value: Date;
    onChange?: (date: Date) => void;
}

const useStyles = makeStyles({
    containerDate: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textFieldDate: {
        marginLeft: '1rem',
        marginRight: '1rem',    
        width: '100%',
    },
});

export default function DatePickers({ label, value, onChange }: DatePickersProps) {
    const classes = useStyles();

    return (
        <form className={classes.containerDate} noValidate>
            <TextField
                id="date"
                label={label}
                type="date"
                value={value}
                onChange={(e) => onChange?.(new Date(e.target.value))}
                className={classes.textFieldDate}
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </form>
    );
}