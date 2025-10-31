import * as React from 'react';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

export default function BasicRating({ typeRating, valueData }: BasicRatingProps) {
    const [value, setValue] = React.useState<number | null>(2);

    return (
        <Box
            sx={{
                '& > legend': { mt: 2 },
            }}
        >
            {
                typeRating == "use" ? (
                    <div>
                        <Typography component="legend">Controlled</Typography>
                        <Rating
                            name="simple-controlled"
                            value={value}
                            onChange={(event, newValue) => {
                                setValue(newValue);
                            }}
                        />
                    </div>
                ) : (
                    <div>
                        <Typography component="legend">Read only</Typography>
                        <Rating name="read-only" value={value} readOnly />
                    </div>
                )
            }
        </Box>
    );
}