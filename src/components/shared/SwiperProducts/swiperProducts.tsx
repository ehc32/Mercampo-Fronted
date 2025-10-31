import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import './styles.css';

// import required modules
import { Pagination,Autoplay } from 'swiper/modules';
import Card from '../Card/Cards';
import Loader from './../../shared/Loaders/Loader';


const SwiperProducts: React.FC<SwiperPropsP> = ({ width, height, datos, loader }) => {
  return (


    <div className="nk-main main-detail-product">
      
      <div className="nk-wrap">
        <div className="nk-content ">
          <div className="container-fluid">
            <div className="nk-content-body">
              <div className="nk-block">
                <div className="card card-bordered">
                  <div className="card-inner">
                    <div className="row pb-5">
                      <div className="col-lg-12 swiper-detail">
                        <h2 className='titulo-sala-compra-light'>Productos similares</h2>
                        <h4 className='sub-titulo-sala-compra-light'>Variedad de productos de la misma categoria</h4>

                        {
                          loader ? (
                            <Swiper
                              slidesPerView={5}
                              spaceBetween={10}
                              loop={true}
                              autoplay={{
                                delay: 2000, // Tiempo de retardo entre cada diapositiva (en ms)
                                disableOnInteraction: false, // Continúa con el autoplay después de la interacción del usuario
                              }}
                              pagination={{
                                clickable: true,
                              }}
                              style={{ width, height, paddingLeft: "5%", paddingRight: "5%"  }}
                              modules={[Pagination, Autoplay]}
                              className="mySwiper cursor-grab active:cursor-grabbing hover:cursor-grab"
                              breakpoints={{
                                0: {
                                  slidesPerView: 1,
                                  spaceBetween: 10,
                                },
                                720: {
                                  slidesPerView: 1,
                                  spaceBetween: 10,
                                },
                                810: {
                                  slidesPerView: 2,
                                  spaceBetween: 15,
                                },
                                1000: {
                                  slidesPerView: 3,
                                  spaceBetween: 20,
                                },
                                1480: {
                                  slidesPerView: 4,
                                  spaceBetween: 25,
                                }
                              }}
                            >
                              {datos.map((item, index) => (
                                <SwiperSlide key={index}>
                                  <Card producto={item} />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          ) : (
                            <Loader />
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwiperProducts;
