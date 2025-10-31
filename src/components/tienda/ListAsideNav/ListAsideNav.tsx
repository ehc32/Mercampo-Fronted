import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ST_Icon from '../../assets/ST-light/ST_Icon';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../hooks/auth';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import jwt_decode from 'jwt-decode';
import { Token } from '../../../Interfaces';

export default function ListAsideNav({ handleClose }) {


    useEffect(() => {
        const token: string | null = useAuthStore.getState().access;

        if (token) {
            try {
                const tokenDecoded: Token = jwt_decode(token);
                const userRole = tokenDecoded.role;
                setRoleLocal(userRole);
            } catch (error) {
                console.error("Error al decodificar el token:", error);
            }
        }
    }, []);


    const [roleLocal, setRoleLocal] = useState("");

    const navigate = useNavigate();
    const { isAuth } = useAuthStore();

    function logOutFun() {
        useAuthStore.getState().logout();
        navigate('/login');
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <div className='w-full mx-4'>
                <ST_Icon />
            </div>
            <nav aria-label="main mailbox folders">
                <List>
                    <ListItem disablePadding>
                        <Link to="/" className='w-full'>
                            <ListItemButton>
                                <ListItemIcon>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary="Inicio" />
                            </ListItemButton>
                        </Link>
                    </ListItem>
                    <ListItem disablePadding>
                        <Link to="/store" className='w-full'>
                            <ListItemButton>
                                <ListItemIcon>
                                    <StoreIcon />
                                </ListItemIcon>
                                <ListItemText primary="Tienda" />
                            </ListItemButton>
                        </Link>
                    </ListItem>
                    <ListItem disablePadding>
                        <Link to="/cart" className='w-full'>
                            <ListItemButton>
                                <ListItemIcon>
                                    <ShoppingCartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Carrito de compras" />
                            </ListItemButton>
                        </Link>
                    </ListItem>

                </List>
            </nav>
            <Divider />
            <nav aria-label="secondary mailbox folders">
                <List>

                    {
                        !isAuth &&
                        <ListItem disablePadding>
                            <Link to="/login" className='w-full'>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <LoginIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Iniciar sesión" />
                                </ListItemButton>
                            </Link>
                        </ListItem>


                    }
                    {
                        isAuth &&

                        <>
                            {
                                roleLocal == "admin" ? (
                                    <>
                                        <ListItem disablePadding>
                                            <Link to="/admin" className='w-full'>
                                                <ListItemButton>
                                                    <ListItemIcon>
                                                        <AdminPanelSettingsIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary="Administrador" />
                                                </ListItemButton>
                                            </Link>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <Link to="/addprod" className='w-full'>
                                                <ListItemButton>
                                                    <ListItemIcon>
                                                        <AddToPhotosIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary="Agregar producto" />
                                                </ListItemButton>
                                            </Link>
                                        </ListItem>
                                    </>
                                ) : (
                                    <>
                                    </>
                                )
                            }
                            <ListItem disablePadding>
                                <Link to="/profile" className='w-full'>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <AccountCircleIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Perfil del usuario" />
                                    </ListItemButton>
                                </Link>
                            </ListItem>
                            <ListItem disablePadding onClick={logOutFun}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Cerrar sesión" />
                                </ListItemButton>
                            </ListItem>
                        </>

                    }
                </List>
            </nav>
            <Divider />
        </Box>
    );
}
