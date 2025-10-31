// Actualizado AsideToggle.js para usar el contexto
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useDrawer } from '../../../context/DrawerProvider'; // Importa el hook del contexto    

// Componente de toggle para mostrar u ocultar el menú lateral
export default function AsideToggle() {
    const { abierto, toggleAbierto } = useDrawer(); // Usa el hook del contexto

    const icon = abierto ? <CloseIcon className="block fs-18px" aria-hidden="true" /> : <MenuIcon className="block fs-18px" aria-hidden="true" />;

    return (
        <Tooltip title={abierto ? "Cerrar" : "Abrir"} className='w-16 h-16 relative top-1 focus:outline-none'>
            <IconButton onClick={toggleAbierto} className='text-white'>
                {icon}
            </IconButton>
        </Tooltip>
    );
}
