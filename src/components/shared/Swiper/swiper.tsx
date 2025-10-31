import React from 'react';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import './styles.css';
import { Navigation } from 'swiper/modules';


const MySwiper: React.FC<SwiperPropsP> = ({ width, height, datos, isUpSwiper }) => {
  if (!datos) {
    return <div>Cargando...</div>;
  }

  return (
    <SwiperReact
      navigation={true}
      modules={[Navigation]}
      className="mySwiper"
      style={{ width, height, }}
      loop={true}
      autoplay={{
        delay: 2000, // Tiempo de retardo entre cada diapositiva (en ms)
        disableOnInteraction: false, // Continúa con el autoplay después de la interacción del usuario
      }}
    >
      {datos.map((producto, index) => (
        <SwiperSlide key={index}>
          <img  src={producto.foto ? producto.foto : '/public/logoSena.png'} alt="alt" />
          {isUpSwiper && (
            <div className="contenedorSwiper">
              <p>
                Promociones o mensajes aqui junto a la imagen
              </p>
            </div>
          )}
        </SwiperSlide>
      ))}
    </SwiperReact>
  );
};

export default MySwiper;