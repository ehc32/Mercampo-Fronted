import React from 'react';
import Card from '../shared/Card/Cards';
import './Style.css';


const RandomProducts: React.FC<CarrouselLast12Props> = ({ productos }) => {
    return (

        <div className="containerRandom">
            <h4 className={'card-name-light'}>Descubre lo mejor</h4>
            <h6 className={'card-subname-light'}>Explora nuestra selección de productos de alta calidad</h6>
            <div className={'product-container-light'}>
                {productos.map((producto, index) => (
                    <Card key={index} producto={producto} />
                ))}
            </div>
        </div>
    );
};

export default RandomProducts;