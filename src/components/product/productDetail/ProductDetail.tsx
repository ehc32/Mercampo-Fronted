import "bootstrap-icons/font/bootstrap-icons.min.css";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { Rating } from "@mui/material";
import { get_solo_user } from "../../../api/users";
import MySwiper from "../../shared/Swiper/swiper";
import Map from "../map/Map";
import { useCartStore } from "../../../hooks/cart";
import { toast } from "react-toastify";
import { get_all_images_product, get_solo } from "./../../../api/products";
import "./../../../global/dashlite.css";
import "./styles.css";
import StarIcon from '@mui/icons-material/Star';

interface ProductProps {
  setCategory: any;
  fetchProductos: any;
  setProductId: any;
}
interface User {
  name: string;
  phone?: string;
  rating?: number;
  email?: string;
  date_joined?: string;
  num_reviews?: number
}

interface Producto {
  price?: number;
  name?: string;
  description?: string;
  category?: string;
  locate?: string;
  count_in_stock?: number;
  unit?: string;
  num_reviews?: number;
  map_locate?: string;
}

const ProductDetail: React.FC<ProductProps> = ({
  setCategory,
  fetchProductos,
  setProductId,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const [producto, setProducto] = useState<Producto>();
  const [usuario, setUsuario] = useState<User>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(0);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const productoData = await get_solo(slug);
        setProducto(productoData);
        setProductId(productoData.id);
        const imagesData = await get_all_images_product(productoData.id);
        setImages(imagesData.images);
        const userContact = await get_solo_user(productoData.user);
        setUsuario(userContact);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener el producto: ", error);
        setLoading(false);
      }
    };

    fetchProducto();
  }, [slug]);

  useEffect(() => {
    if (!loading && producto) {
      const categoryValue = producto.category_name || producto.category;
      if (categoryValue) {
        setCategory(categoryValue);
        fetchProductos();
      }
    }
  }, [loading, producto]);

  function formatearFecha(fechaISO: any) {
    const fecha = new Date(fechaISO);
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia} de ${mes} de ${año}`;
  }
  const imagesData = images.map((image) => ({
    foto: image,
  }));

  return (
    <>
      <div className="nk-main main-detail-product">
        <div className="nk-wrap">
          <div className="nk-content ">
            <div className="container-fluid">
              <div className="nk-content-body">
                <div className="nk-block">
                  <div className="card card-bordered">
                    <div className="card-inner">
                      <div className="row pb-5">
                        <div className="col-lg-6">
                          <div className="product-gallery mr-xl-1 mr-xxl-5 p-4">
                            <h4 className="titleProductoPreview text-black font-bold">
                              Visualización del producto
                            </h4>
                            <MySwiper
                              width={"100%"}
                              height={"40vh"}
                              datos={imagesData}
                              isUpSwiper={false}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="product-info mt-5 mr-xxl-5 h-96 flex justify-between flex-col">
                            <div>
                              <div className="flex flex-col justify-between text-start">
                                <h2 className="fs-22px  mb-1 color-light text-black font-weight-bolder">
                                  {loading ? <Skeleton /> : producto?.name}
                                </h2>
                                <h4 className="fs-20x product-price text-primary w-40 font-bold text-start pb-2">
                                  {loading ? (
                                    <Skeleton
                                      style={{
                                        width: "100px",
                                        height: "100px",
                                      }}
                                    />
                                  ) : (
                                    `$ ${Number(producto?.price).toLocaleString()}`
                                  )}
                                </h4>
                              </div>
                              <div className="product-rating">
                                <Rating
                                  name="read-only"
                                  value={producto?.rating || 0}
                                  precision={0.5}
                                  readOnly
                                />
                                <div className=" pl-2 text-black">
                                  ({producto?.num_reviews != null ? producto?.num_reviews : 0} Opiniones)
                                </div>
                              </div>
                            </div>
                            <div className="product-excrept text-black h-32">
                              <p className="lead">{producto?.description}</p>
                            </div>
                            <div>
                              <div className="product-meta">
                                <ul className="d-flex g-3 gx-5">
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Cantidad en stock
                                    </div>
                                    <div className="fs-16px text-black">
                                      {producto?.count_in_stock?.toLocaleString()}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Unidad de medida
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {(() => {
                                        const unitName = producto?.unit_name || producto?.unit;
                                        if (!unitName) return "Sin unidad";
                                        return unitName;
                                      })()}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Categoría
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {(() => {
                                        const categoryName = producto?.category_name || producto?.category;
                                        if (!categoryName) return "Sin categoría";
                                        const firstChar = categoryName.charAt(0).toUpperCase();
                                        const rest = categoryName.slice(1).toLowerCase();
                                        return firstChar + rest;
                                      })()}
                                    </div>
                                  </li>
                                </ul>
                              </div>
                              <div className="product-meta">
                                <ul className="d-flex g-3 gx-5">
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Ciudad
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {producto?.locate}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Fecha de publicación
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {formatearFecha(producto?.created)}
                                    </div>
                                  </li>
                                </ul>
                              </div>
                              <div className="product-meta">
                                <div className="productCatn">
                                  <div className="fs-14px font-bold text-black">
                                    Selecciona una cantidad
                                  </div>
                                  <div className="fs-16px text-black total">
                                    {`$ ${(cantidad * (producto?.price || 0)).toLocaleString()}`}
                                  </div>
                                </div>
                                <ul className="d-flex flex-wrap max-w-64 g-2 pt-1">
                                  <li className="w-140px item-row">
                                    <div className="cantidadOrden">
                                      <button
                                        className="btn btn-icon btn-outline-light number-spinner-btn number-minus"
                                        onClick={() => {
                                          setCantidad((prevCantidad) =>
                                            Math.max(prevCantidad - 1, 0)
                                          );
                                        }}
                                      >
                                        <em className="icon bi bi-dash"></em>
                                      </button>
                                      <input
                                        type="number"
                                        value={cantidad}
                                        className="input-increment"
                                        readOnly
                                      />
                                      <button
                                        className="btn btn-icon btn-outline-light number-spinner-btn number-plus"
                                        onClick={() => {
                                          setCantidad(
                                            (prevCantidad) => prevCantidad + 1
                                          );
                                        }}
                                      >
                                        <i className="icon bi bi-plus"></i>
                                      </button>
                                    </div>
                                  </li>
                                </ul>
                              </div>
                              <button
                                className="btn btn-primary mt-3"
                                style={{ backgroundColor: "#39A900" }}
                                onClick={() => {
                                  if (cantidad > 0) {
                                    addToCart(producto, cantidad);
                                    toast.dismiss();
                                    toast.success(
                                      "Producto agregado al carrito exitosamente"
                                    );
                                  } else {
                                    toast.error(
                                      "Selecciona al menos una unidad para añadir al carrito"
                                    );
                                  }
                                }}
                              >
                                Añadir al carrito
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row pb-5">
                        <div className="col-lg-12">
                          <div className="product-gallery mr-xl-1 mr-xxl-5 p-4">
                            <h4 className="titleProductoPreview">
                              Datos del vendedor
                            </h4>
                            <div>
                              <div className="product-meta">
                                <ul className="d-flex justify-start w-full gap-8 flex-wrap">
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Nombre
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {usuario?.name}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Teléfono
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {usuario?.phone
                                        ? usuario?.phone
                                        : "Sin definir"}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Correo electronico
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {usuario?.email}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Fecha en que se unió
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {formatearFecha(usuario?.date_joined)}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Localización ingresada ( mapa )
                                    </div>
                                    <div className="fs-16px  text-black">
                                      {producto?.map_locate?.slice(0, 40)}
                                    </div>
                                  </li>
                                  <li>
                                    <div className="fs-14px font-bold text-black">
                                      Calificación del usuario
                                      ({usuario?.num_reviews != null ? usuario?.num_reviews : 0} Opiniones)
                                    </div>
                                    <Rating
                                      name="read-only"
                                      value={usuario?.rating}
                                      readOnly
                                      precision={0.5}
                                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                      sx={{ marginBottom: 1, width: "5em" }}
                                    />
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Map address={producto?.map_locate || ""} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
