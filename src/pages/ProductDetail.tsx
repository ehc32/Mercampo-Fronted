import { useEffect, useState } from 'react';
import { cate_api_random } from '../api/products';
import Comments from '../components/product/coments/Comments';
import ProductDetail from '../components/product/productDetail/ProductDetail';
import SwiperProducts from '../components/shared/SwiperProducts/swiperProducts';

const DetallesProd = () => {
  const [category, setCategory] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [productos, setProductos] = useState([]);
  const [productId, setProductId] = useState(0)

  const fetchProductos = async () => {
    try {
      const productos = await cate_api_random(category);
      setProductos(productos);
      setLoader(true);
    } catch (error) {
      console.error('Error al obtener los productos: ', error);
    }
  };

  useEffect(() => {
    if (category) {
      fetchProductos();
    }
  }, [category]);

  return (
    <main className='my-2'>
      <ProductDetail setCategory={setCategory} fetchProductos={fetchProductos} setProductId={setProductId} />
      <Comments productId={productId} />
      <SwiperProducts datos={productos} height='70vh' width='100%' loader={loader} />
            
    </main>
  );
};

export default DetallesProd;