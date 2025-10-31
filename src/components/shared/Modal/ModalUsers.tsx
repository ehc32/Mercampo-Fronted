import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { AiFillEdit } from "react-icons/ai";

import "./Modal.css"

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#FFFFFF',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

export default function ModalUsers({ idLocal, updateUser }: propsModal) {
    const [open, setOpen] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    const [nombre, setNombre] = React.useState("");
    const [apellido, setApellido] = React.useState("");
    const [correo, setCorreo] = React.useState("");
    const [rol, setRol] = React.useState("");

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirmOpen = () => {
        setConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('apellido', apellido);
        formData.append('email', correo);
        formData.append('rol', rol);
        updateUser(formData)
        setConfirmOpen(false);
        setOpen(false);
    };

    return (
        <div>
            <Button onClick={handleOpen}
                startIcon={<AiFillEdit
                    size={22}
                    className="text-blue cursor-pointer"
                />}></Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            >
                <Box sx={{ ...style, width: 400 }}>
                    <h2 id="child-modal-title" className='form-title'>Actualizar usuario {idLocal}</h2>
                    <form>
                        <TextField
                            label="Nombre"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <TextField
                            label="Apellido"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                        />
                        <TextField
                            label="Correo"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />
                        <InputLabel id="rol-label">Rol</InputLabel>
                        <Select
                            labelId="rol-label"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                        >
                            <MenuItem selected hidden>Selecciona...</MenuItem>
                            <MenuItem value="seller">Vendedor</MenuItem>
                            <MenuItem value="client">Comprador</MenuItem>
                            <MenuItem value="admin">Administrador</MenuItem>
                        </Select>
                        <div className='flex flex-row gap-5'>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleConfirmOpen}
                                startIcon={<AiOutlineCheck />}
                            >
                                Actualizar
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleClose}
                                startIcon={<AiOutlineClose />}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Box>
            </Modal>
            <Modal
                open={confirmOpen}
                onClose={handleConfirmClose}
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-description"
            >
                <Box sx={{ ...style, width: 300, height: 200 }}>
                    <div className='flex flex-col justify-between h-full'>
                        <h2 id="confirm-modal-title" className='form-title'>Confimar cambio</h2>
                        <p id="confirm-modal-description" className='fs-18px'>
                            ¿Quieres hacer este cambio?
                        </p>
                        <div className='flex flex-row gap-5'>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleConfirmClose}
                                startIcon={<AiOutlineCheck />}
                            >
                                Sí
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setConfirmOpen(false)}
                                startIcon={<AiOutlineClose />}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}