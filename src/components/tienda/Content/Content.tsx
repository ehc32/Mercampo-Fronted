import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LoopIcon from '@mui/icons-material/Loop';
import TuneIcon from '@mui/icons-material/Tune';
import { Button, TextField } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import React, { useEffect, useState } from 'react';
import { useDrawer } from '../../../context/DrawerProvider';
import NotfoundPage from '../../../global/NotfoundPage';
import Card from '../../shared/Card/Cards';
import Loader from './../../shared/Loaders/Loader';
import { FaMapMarkerAlt } from "react-icons/fa";
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import './Content.css';

const Content: React.FC<ContenidoProps> = ({
    productos,
    loading,
    dataLenght,
    page,
    setPage,
    searchItem,
    setSearchItem,
    bringDataFilter,
    deleteDataFilter,
    changeOrder
}) => {
    const [location, setLocation] = useState({ lat: -34.397, lng: 150.644 }); // Valor por defecto
    const [municipio, setMunicipio] = useState('');
    const [timer, setTimer] = useState()

    const obtenerMunicipio = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDWmh4H4O1AqdP5-nzLJft-EdFo9m6TDk8`);
            if (!response.ok) throw new Error('Error en la respuesta de la API');
            const data = await response.json();
            console.log(data)
            if (data.results && data.results.length > 0) {
                const addressComponents = data.results[0].address_components;
                const municipioComponent = addressComponents.find(component =>
                    component.types.includes("administrative_area_level_2")
                );

                if (municipioComponent) {
                    setMunicipio(municipioComponent.long_name);
                } else {
                    setMunicipio('Municipio no encontrado');
                }
            } else {
                setMunicipio('No hay resultados');
            }
        } catch (error) {
            console.error("Error al obtener el municipio:", error);
            setMunicipio('Error al obtener municipio');
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    obtenerMunicipio(latitude, longitude);
                },
                (error) => {
                    console.error("Error al obtener la ubicación:", error);
                    setMunicipio('No se pudo obtener ubicación');
                }
            );
        } else {
            console.error("La geolocalización no es soportada por este navegador.");
            setMunicipio('Geolocalización no soportada');
        }
    }, []);

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const buscarTextfield = (e: string) => {
        setSearchItem(e);
        bringDataFilter();
    };

    const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchItem(value);
        // Timer para búsqueda
        if (timer) {
            clearTimeout(timer);
        }
        const newTimer = setTimeout(() => {
            buscarTextfield(value);
        }, 1000);
        setTimer(newTimer);
    };

    const { abierto, toggleAbierto } = useDrawer();
    const isWideScreen = window.innerWidth > 900;

    return (
        <section className="contenidoTienda">
            <div className='locationcss'>
                <FaMapMarkerAlt className='icon' />
                <h3>{municipio || 'Cargando...'}</h3>
            </div>

            <div>
                <div className='flex flex-col '>
                    <div>
                        <h2 className='titulo-sala-compra-light'>Una gran variedad de productos</h2>
                        <h4 className='sub-titulo-sala-compra-light'>Encuentra productos de alta calidad a los mejores precios</h4>
                    </div>
                    <p className='mt-4'>Busca de manera dinámica los productos que más se adecuen a lo que necesitas, para ello se han dispuesto filtros en donde especificar un poco más lo que buscas.</p>
                    <div className='flex align-center justify-evenly flex-wrap ajuste-wrap'>
                        <div className={isWideScreen ? 'flex flex-col sm:flex-row items-center justify-center gap-4 my-10' : 'flex flex-row mx-2 sm:flex-row items-center justify-center gap-2 my-8'}>
                            <Button variant="contained" className='flex align-center boton_header' color="info" onClick={changeOrder}>
                                <LoopIcon />
                                {isWideScreen && <p>Orden ascendente</p>}
                            </Button>
                            <Button variant="contained" className='flex align-center boton_header' color="error" onClick={deleteDataFilter}>
                                <DeleteSweepIcon />
                                {isWideScreen && <p>Borrar filtros</p>}
                            </Button>
                            <Button variant="contained" color="success" className='flex align-center boton_header' onClick={toggleAbierto}>
                                <TuneIcon />
                                {isWideScreen && <p>Filtrar productos</p>}
                            </Button>
                        </div>
                        <form action="" onSubmit={(e) => e.preventDefault()} className='flex-1 max-w-lg'>
                            <TextField
                                fullWidth
                                id="search"
                                label="Buscar producto  ..."
                                value={searchItem}
                                onChange={handleChange2}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#39A900',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#39A900',
                                    },
                                }}
                            />
                        </form>
                    </div>
                </div>

                {
                    loading ? (
                        <div className="flex justify-center items-center">
                            <Loader />
                        </div>
                    ) : (
                        dataLenght > 0 ? (
                            <>
                                <div className='product-container-light'>
                                    <div className="flex flex-wrap intern">
                                        {productos.length > 0 && productos.map((producto, index) => (
                                            <Card key={index} producto={producto} />
                                        ))}
                                    </div>
                                    <div className="w-95 flex items-center justify-center h-min-100px">
                                        <Pagination
                                            count={Math.ceil(dataLenght / 20)}
                                            page={page}
                                            showFirstButton
                                            showLastButton
                                            onChange={handleChange}
                                            className="flex flex-row w-full justify-center my-6"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <NotfoundPage boton={true} />
                        )
                    )
                }
            </div>
        </section>
    );
};

export default Content;
