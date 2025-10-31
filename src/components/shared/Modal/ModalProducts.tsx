import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { AiFillEdit } from "react-icons/ai";

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

export default function ModalProducts({ updateProduct, idLocal }) {
    const [open, setOpen] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    const [nombre, setNombre] = React.useState("");
    const [categoria, setCategoria] = React.useState("");
    const [descripcion, setDescripcion] = React.useState("");
    const [ubicacion, setUbicacion] = React.useState("");
    const [ubicacionDescriptiva, setUbicacionDescriptiva] = React.useState("");
    const [cantidad, setCantidad] = React.useState("");
    const [precio, setPrecio] = React.useState("");
    const [unidad, setUnidad] = React.useState("");

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
                    <h2 id="child-modal-title" className='form-title'>Actualizar Producto</h2>
                    <form>
                        <TextField
                            label="Nombre"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <Select
                            labelId="categoria-label"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            <MenuItem selected hidden>Selecciona una categoría</MenuItem>
                            <MenuItem value="VERDURAS">Verduras</MenuItem>
                            <MenuItem value="GRANOS">Granos</MenuItem>
                            <MenuItem value="FRUTAS">Frutas</MenuItem>
                        </Select>
                        <TextField
                            label="Descripción"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                        <Select
                            labelId="ubicacion-label"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={ubicacion}
                            onChange={(e) => setUbicacion(e.target.value)}
                        >
                            <MenuItem selected hidden>Selecciona una ubicación</MenuItem>
                            <MenuItem value="Neiva">Neiva</MenuItem>
                        </Select>
                        <TextField
                            label="Ubicación descriptiva"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={ubicacionDescriptiva}
                            onChange={(e) => setUbicacionDescriptiva(e.target.value)}
                        />
                        <TextField
                            label="Cantidad"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                        />
                        <TextField
                            label="Precio"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                        />
                        <Select
                            labelId="unidad-label"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={unidad}
                            onChange={(e) => setUnidad(e.target.value)}
                        >
                            <MenuItem selected hidden>Selecciona una unidad</MenuItem>
                            <MenuItem value="Kg">Kilos</MenuItem>
                            <MenuItem value="L">Litros</MenuItem>
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
                        <h2 id="confirm-modal-title" className='form-title'>Confirmar cambio</h2>
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