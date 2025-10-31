import {
    Backdrop,
    Box,
    Button,
    Checkbox,
    Chip,
    Drawer,
    Fade,
    FormControlLabel,
    FormGroup,
    MenuItem,
    Modal,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDrawer } from '../../../context/DrawerProvider'; // Importa el hook del contexto
import ListAsideNav from '../ListAsideNav/ListAsideNav';
import './Aside.css'
import { useAuthStore } from '../../../hooks/auth';

const ciudades = ["Todos", "Neiva", "Pitalito", "Garzón", "La Plata", "San Agustín", "Acevedo", "Campoalegre", "Yaguará", "Gigante", "Paicol", "Rivera", "Aipe", "Villavieja", "Tarqui", "Timaná", "Palermo"];
const AsideFilter = ({
    bringDataFilter,
    deleteDataFilter,
    setTime,
    setCategories,
    setStartDate,
    setPrice,
    setEndDate,
    locate,
    price,
    categories,
    time,
    searchItem,
    startDate,
    endDate,
    setLocate
}) => {
    const { abierto, toggleAbierto } = useDrawer(); // Usa el hook del contexto
    const location = useLocation()
    const [timer, setTimer] = useState(null);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    function logOutFun() {
        useAuthStore.getState().logout();
        navigate('/login');
    }

    const precioOptions = [
        { label: 'Menos de 50 mil pesos', value: 1 },
        { label: 'Entre 50 mil y 150 mil', value: 2 },
        { label: 'Más de 150 mil', value: 3 },
    ];

    const categorias = ['FRUTAS', 'VERDURAS', 'GRANOS', 'OTROS'];

    const locationPath = useLocation();

    const handleCategoryChange = (e) => {
        const { checked, value } = e.target;
        if (checked) {
            setCategories((prevCategories) => [...prevCategories, value]);
        } else {
            setCategories((prevCategories) =>
                prevCategories.filter((category) => category !== value)
            );
        }
    };

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTimeRangeChange = (e) => {
        setTime(e.target.value);
    };

    const handlePriceChange = (e) => {
        setPrice(e.target.value);
    };

    const handleLocationChange = (e) => {
        setLocate(e.target.value);
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    return (
        <Drawer
            open={abierto}
            onClose={toggleAbierto}
            sx={{
                width: 300,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 300,
                    boxSizing: 'border-box',
                },
            }}
        >
            {
                window.innerWidth < 900 && (
                    <ListAsideNav />
                )
            }
            {
                location.pathname == "/store" && (



                    <Box sx={{ p: 2, maxWidth: "350px" }}>
                        {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Búsqueda de productos
                            </Typography>
                        </Box>
                        <Typography variant="body2" gutterBottom>
                            Ingrese un término de búsqueda para encontrar productos relacionados.
                        </Typography>
                         */}
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom style={{ color: 'black' }}>
                                    Categoría
                                </Typography>
                            </Box>
                            <Typography variant="body2" gutterBottom>
                                Seleccione una o varias categorías para filtrar los productos.
                            </Typography>
                            <FormGroup>
                                {categorias.map((categoria, index) => (
                                    <FormControlLabel
                                        key={index}
                                        control={
                                            <Checkbox
                                                id={categoria}
                                                name={categoria}
                                                value={categoria}
                                                onChange={handleCategoryChange}
                                                sx={{
                                                    color: '#39a900', // Color por defecto del checkbox
                                                    '&.Mui-checked': {
                                                        color: '#39a900', // Color cuando está seleccionado
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(51, 154, 144, 0.08)' // Color en hover
                                                    }
                                                }}
                                            />
                                        }
                                        label={capitalizeFirstLetter(categoria)}
                                    />
                                ))}
                            </FormGroup>


                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom style={{ color: 'black' }}>
                                    Precio máximo
                                </Typography>
                            </Box>
                            <Typography variant="body2" gutterBottom>
                                Seleccione el rango de precio más acorde a su bolsillo.
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                {precioOptions.map((option) => (
                                    <Chip
                                        key={option.value}
                                        label={option.label}
                                        onClick={() => setPrice(option.value)}
                                        style={{ marginRight: 10, marginBottom: 10 }}
                                    />
                                ))}
                            </Box>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom style={{ color: 'black' }}>
                                    Rango de fechas
                                </Typography>
                            </Box>
                            <Typography variant="body2" gutterBottom>
                                Seleccione un rango de fechas para filtrar los productos.
                            </Typography>
                            <div className='flex flex-col justify-between align-middle'>
                                <Select
                                    id="date-range"
                                    value={time || 'todos'}
                                    style={{ height: "4em", width: "100%" }}
                                    onChange={handleTimeRangeChange}
                                    sx={{
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#39a900',  // Cambia el borde cuando el Select está enfocado o abierto
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#39a900',  // Cambia el borde cuando el Select está en hover
                                        },
                                        '&.Mui-focused .MuiSelect-icon': {
                                            color: '#39a900', // Cambia el color del ícono (flecha) cuando el Select está abierto
                                        }
                                    }}
                                >
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="hoy">Publicados hoy</MenuItem>
                                    <MenuItem value="ayer">Publicados ayer</MenuItem>
                                    <MenuItem value="semana">Esta semana</MenuItem>
                                    <MenuItem value="mes">Este mes</MenuItem>
                                </Select>

                                {/* <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={handleOpen}
                                    className='my-2'
                                >
                                    Establecer fechas manualmente
                                </Button> */}
                            </div>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom style={{ color: 'black' }}>
                                    Ubicación
                                </Typography>
                            </Box>
                            <Typography variant="body2" gutterBottom>
                                Seleccione una ubicación para filtrar los productos.
                            </Typography>
                            <Select
                                id="location"
                                value={locate || 'Todos'}
                                style={{ height: "4em", width: "100%" }}
                                onChange={handleLocationChange}
                                sx={{
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#39a900',  // Cambia el borde del Select cuando está enfocado
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#39a900',  // Cambia el borde en hover
                                    }
                                }}
                            >
                                {ciudades.map((ciudad, index) => (
                                    <MenuItem key={index} value={ciudad}>
                                        {ciudad}
                                    </MenuItem>
                                ))}
                            </Select>


                        </Box>

                        <Modal
                            aria-labelledby="spring-modal-title"
                            aria-describedby="spring-modal-description"
                            open={open}
                            onClose={handleClose}
                            closeAfterTransition
                            slots={{ backdrop: Backdrop }}
                            slotProps={{
                                backdrop: {
                                    TransitionComponent: Fade,
                                },
                            }}
                        >
                            <Fade in={open}>
                                <Box sx={style}>
                                    <Typography id="spring-modal-title" variant="h6" component="h2">
                                        Establecer fechas
                                    </Typography>
                                    <Typography id="spring-modal-description" sx={{ mt: 2 }}>
                                        Seleccione un rango de fechas para filtrar los productos.
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">Fecha de inicio:</Typography>
                                        <TextField
                                            fullWidth
                                            id="start-date"
                                            type="date"
                                            sx={{ mt: 1 }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={startDate}
                                            onChange={handleStartDateChange}
                                        />
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">Fecha de fin:</Typography>
                                        <TextField
                                            fullWidth
                                            id="end-date"
                                            type="date"
                                            sx={{ mt: 1 }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={endDate}
                                            onChange={handleEndDateChange}
                                        />
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button variant="contained" onClick={handleClose}>
                                            Aceptar
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        </Modal>
                        <Button
                            className='mt-2'
                            variant="contained"
                            color="success"
                            fullWidth
                            onClick={bringDataFilter}
                        >
                            Establecer filtros
                        </Button>
                        <Button
                            className='mt-2'
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={deleteDataFilter}
                        >
                            Borrar filtros
                        </Button>
                    </Box>
                )
            }
        </Drawer>
    );
};

export default AsideFilter;

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
