import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { Tooltip } from '@mui/material';
import './ST.css';

const ST_Icon = () => {
    return (
        <Tooltip 
            title="Servicio Nacional de Aprendizaje"
            arrow
            placement="bottom"
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: '#3A3A3A',
                        color: 'white',
                        fontSize: '0.8rem',
                        '& .MuiTooltip-arrow': {
                            color: '#3A3A3A',
                        },
                    }
                }
            }}
        >
            <div className="h-full min-w-52 m-2 flex row whitespace-nowrap">
                <img
                    className="h-10 w-auto lg:block mx-1 relative top-1"
                    src="/public/lo.ico"
                    alt="Logo SENA"
                />
                <HorizontalRuleIcon className='rotaricon' />
                <p className="hover-class fs-16px font-bold text-white">
                    Servicios <br />
                    Tecnológicos
                </p>
            </div>
        </Tooltip>
    )
}

export default ST_Icon;