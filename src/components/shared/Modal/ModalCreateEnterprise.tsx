import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FaRegBuilding } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid transparent',
    boxShadow: 24,
    p: 2,
};

export default function ModalCreateEnterprise() {

    const [openEnter, setOpenEnter] = React.useState(false);
    const handleOpenEnter = () => setOpenEnter(true);
    const handleCloseEnter = () => setOpenEnter(false);

    return (
        <div>
            <Typography className="tyc2 flex flex-row cursor-pointer bg-green-700 text-white border border-green-700 hover:bg-green-800 mx-2 my-1 p-3 rounded" onClick={handleOpenEnter}>
                <FaRegBuilding className="fs-20px mr-1" />¿Tienes una empresa?
            </Typography>
            <Modal
                open={openEnter}
                onClose={handleCloseEnter}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5" component="h2" className='text-[#39A900] text-center'>
                        Crear empresa
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }} className='text-black text-justify'>
                        Será redirigido a un formulario que recibirá los datos nesesarios para crearlos y asegurarnos que en verdad existe la empresa.
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }} className='flex flex-row justify-around'>
                        <button className='bg-[#FF0000] text-white px-2 py-1 m-1 hover:bg-[#FA0000] focus:outline-none'>Cancelar</button>
                        <Link to={"/create-enterprise"}>
                            <button className='bg-[#39A900] text-white px-2 py-1 m-1 hover:bg-[#39B500] focus:outline-none'>Aceptar</button>
                        </Link>
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}
