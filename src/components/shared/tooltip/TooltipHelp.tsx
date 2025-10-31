import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function BasicTooltip({ titlet}) {
    return (
        <Tooltip title={`${titlet}`} style={{ padding: "2px" }} placement="right" className='focus:outline-none'>
            <IconButton>
                <HelpOutlineIcon style={{ color: "#39A900" }}  />
            </IconButton>
        </Tooltip>
    );
}