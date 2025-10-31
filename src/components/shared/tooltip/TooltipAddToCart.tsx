import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useCartStore } from '../../../hooks/cart';
import { toast } from 'react-toastify';

export default function BasicTooltip({ producto }) {
    const addToCart = useCartStore(state => state.addToCart);

    const addCart = (producto) => {
        toast.dismiss();
        toast.success("Producto agregado al carrito exitosamente");
        addToCart(producto)
    }

    return (
        <Tooltip title="Añadir al carrito">
            <IconButton className='focus:outline-none' onClick={() => addCart(producto)}>
                <ShoppingCartIcon style={{ color: "#39A900" }} />
            </IconButton>
        </Tooltip>
    );
}