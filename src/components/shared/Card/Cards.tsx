import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import './Card.css';
import BasicTooltip from '../tooltip/TooltipAddToCart';


const Card: React.FC<CarrouselLast12Props> = ({ producto }) => {
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };


    function formatearFecha(fechaISO: any) {
        const fecha = new Date(fechaISO);
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];

        return `${dia} de ${mes}`;
    }

    return (
        <div className='beforecard'>
            <div className='cardbody cardBodyLight'>
                <Link to={`/product/${producto.slug}`}>
                    <div className='imgContent'>
                        <img src={producto.first_image} alt="Imagen del producto" />
                    </div>
                    <div className='minihead'>
                        <hr />
                    </div>
                </Link>
                <div className='infoContent'>
                    <div className='head-card'>
                        <h4 className='headInfo-light'>
                            {producto.name?.length > 20 ? `${producto.name?.slice(0, 20)}...` : producto.name}
                        </h4>
                        <h4 className='headInfo category'>
                            {(() => {
                                const categoryName = producto.category_name || producto.category;
                                if (!categoryName) return "Sin categoría";
                                const firstChar = categoryName.charAt(0).toUpperCase();
                                const rest = categoryName.slice(1).toLowerCase();
                                return firstChar + rest;
                            })()}
                        </h4>
                    </div>
                    <p className='headInfo'>
                        {producto.description?.length > 100 ? `${producto.description?.slice(0, 70)}...` : producto.description}
                    </p>
                    <div className='footerInfo'>
                        <div>
                        <h6>$ {formatPrice(Number(producto.price))}</h6>
                            <span>{producto.locate?.slice(0, 15)}, {formatearFecha(producto.created)}</span>
                        </div>
                        <BasicTooltip producto={producto} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
