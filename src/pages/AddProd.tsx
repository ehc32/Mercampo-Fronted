import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { bring_prome, post_product } from "../api/products";
import { get_all_categories, get_all_units } from "../api/categories";
import ImageInput from "../components/assets/imageInput/ImageInput";
import BasicTooltip from "../components/shared/tooltip/TooltipHelp";
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './../global/style.css'

const AddProd = () => {
  const [images, setImages] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [ubicacionDescriptiva, setUbicacionDescriptiva] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [unidad, setUnidad] = useState("");
  const [tiempoL, setTiempoL] = useState<number>();
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const ciudades = ["Neiva", "Pitalito", "Garzón", "La Plata", "San Agustín", "Acevedo", "Campoalegre", "Yaguará", "Gigante", "Paicol", "Rivera", "Aipe", "Villavieja", "Tarqui", "Timaná", "Palermo", "Santa María"];
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await get_all_categories();
        // Filtrar solo categorías activas
        const activeCategories = categoriesData.filter((cat: any) => cat.is_active);
        setCategories(activeCategories);
      } catch (error) {
        toast.error("Error al cargar categorías");
      } finally {
        setLoadingCategories(false);
      }

      try {
        setLoadingUnits(true);
        const unitsData = await get_all_units();
        // Filtrar solo unidades activas
        const activeUnits = unitsData.filter((unit: any) => unit.is_active);
        setUnits(activeUnits);
      } catch (error) {
        toast.error("Error al cargar unidades de medición");
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchData();
  }, []);

  const handlePriceChange = (e: any) => {
    const inputValue = Math.max(0, Number(e.target.value));

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      let roundedPrice = inputValue;
      let remainder = roundedPrice % 100;

      if (remainder < 25) {
        roundedPrice = roundedPrice - remainder;
      } else if (remainder >= 25 && remainder < 75) {
        roundedPrice = roundedPrice - remainder + 50;
      } else {
        roundedPrice = roundedPrice + (100 - remainder);
      }

      setPrecio(roundedPrice.toString());
    }, 1500);

    setTypingTimeout(newTimeout);
    setPrecio(inputValue.toString());
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !categoria || !descripcion || !ubicacion || !cantidad || !precio || !unidad || !tiempoL || !ubicacionDescriptiva) {
      toast.error("Por favor, complete todos los campos");
      return;
    }

    let promedio = 0;
    let take_prom = false;

    try {
      const data = await bring_prome(nombre); // Traer el precio promedio del producto
      promedio = data.data.average_price;
      take_prom = true
    } catch (error) {
      take_prom = false
      // toast.warn("No hay productos como este para comparar precios, pon el más óptimo.");
    }

    if (isNaN(promedio)) {
      toast.error("El precio promedio no es un número válido");
      return;
    }
    if (take_prom) {

      let min_price = Math.round(promedio * 0.9); // -10%
      let max_price = Math.round(promedio * 1.1); // +10%

      const inputPrice = Number(precio);
      if (inputPrice < min_price) {
        toast.warning(`El precio es muy bajo, el minimo para este producto es de $ ${min_price}.`);
        return;
      }
      if (inputPrice > max_price) {
        toast.warning(`El precio es muy caro, el maximo para este producto es de $ ${max_price}.`);
        return;
      }
    }
    let price = parseInt(precio);
    let remainder = price % 100;

    if (remainder < 25) {
      price = price - remainder;
    } else if (remainder >= 25 && remainder < 75) {
      price = price - remainder + 50;
    } else {
      price = price - remainder + 100;
    }


    const product: Product = {
      name: nombre,
      product_category: parseInt(categoria), // Usar el ID de la categoría
      description: descripcion,
      count_in_stock: parseInt(cantidad),
      price: Number(price),
      image: images,
      map_locate: ubicacionDescriptiva,
      locate: ubicacion,
      unit_of_measurement: parseInt(unidad), // Usar el ID de la unidad
      tiempoL: tiempoL,
    };

    try {
      await post_product(product);
      toast.success("Producto agregado exitosamente");

      // Reiniciar los campos del formulario
      setNombre("");
      setCategoria("");
      setDescripcion("");
      setUbicacion("");
      setCantidad("");
      setPrecio("");
      setUnidad("");
      setUbicacionDescriptiva("");
      setTiempoL(0);
      setImages([]);
    } catch (error) {
      toast.error("Error al agregar el producto");
    }
  };


  return (
    <div className="flex">
      <div className="w-full flex m-auto dark:bg-gray-800 rounded-xl shadow-lg card-addprod">
        <div className="w-full p-4 md:p-10 card-bordered">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl text-black font-bold ">
              Añadir Producto
            </h1>
            <img src="/public/logoSena.png" alt="Logo-sena" className="h-12 md:h-16" />
          </div>

          <form onSubmit={manejarSubmit} className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1   md:mb-0">
                <h6 className="text-black font-bold m-1 ">Nombre del Producto
                  <BasicTooltip titlet={"Pon el nombre de tu producto"} /></h6>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.replace(/[^a-zA-ZñÑ\s]/g, ''))}
                  placeholder="Ej: Tomate cherry"
                  className="w-full p-3    bg-white  text-black focus:outline-none border_form"
                  required
                />
              </div>

              <div className="flex-1">
                <h6 className="text-black font-bold m-1 ">Categoria
                  <BasicTooltip titlet={"Selecciona la categoria que más se adecúe al tipo de producto que desea ofertar"} /></h6>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  {loadingCategories ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#39A900' }} />
                    </Box>
                  ) : (
                    <Select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      required
                      displayEmpty
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#39A900',
                        }
                      }}
                    >
                      <MenuItem value="" disabled>Selecciona una categoría</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </div>
            </div>

            <h6 className="text-black font-bold mx-1 mt-1 ">Descripción del Producto
              <BasicTooltip titlet={"Has una breve introducción de tu producto, el maximo de caractéres es de 350"} /></h6>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => {
                if (e.target.value.length <= 350) {
                  setDescripcion(e.target.value);
                }
              }}
              placeholder="Ej: Tomate cherry de alta calidad"
              className="resize-none w-full p-3 mt-2  focus:outline-none   bg-white  text-blac border_form"
              rows={4}
              required
            />
            <div className="flex flex-col md:flex-row md:space-x-4 mt-0">
              <div className="flex-1 md:mb-0">
                <h6 className="text-black font-bold m-1">Precio unitario
                  <BasicTooltip titlet={"El precio de cada producto será redondeado, es decir que no tendrá decimales"} />
                </h6>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    id="precio"
                    value={precio}
                    onChange={handlePriceChange}
                    placeholder="Ej: 5000"
                    className="w-full pl-10 p-3 focus:outline-none border-gray-500 bg-white text-black border_form text-end"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex-1   md:mb-0">
                <h6 className="text-black font-bold m-1 ">Cantidad en Stock
                  <BasicTooltip titlet={"Pon una cantidad de productos que realmente puedan ser vendidos en el tiempo limite"} />
                </h6>
                <input
                  type="number"
                  id="cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(0, Number(e.target.value)).toString())}
                  placeholder="Ej: 100"
                  className="w-full p-3  focus:outline-none   bg-white  text-black border_form"
                  min="0"
                  required
                />
              </div>
              <div className="flex-1   md:mb-0">
                <h6 className="text-black font-bold m-1 ">Unidad
                  <BasicTooltip titlet={"Seleccione una unidad de medida según al producto que desea ofertar"} />
                </h6>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  {loadingUnits ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#39A900' }} />
                    </Box>
                  ) : (
                    <Select
                      value={unidad}
                      onChange={(e) => setUnidad(e.target.value)}
                      displayEmpty
                      required
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#39A900',
                        }
                      }}
                    >
                      <MenuItem value="" disabled>Selecciona una unidad</MenuItem>
                      {units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.abbreviation ? `${unit.name} (${unit.abbreviation})` : unit.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </div>
              <div className="flex-1">
                <h6 className="text-black font-bold m-1">Tiempo de publicación
                  <BasicTooltip titlet={"Se debe tomar en cuenta que el producto puede caducar o dañarse, tome en cuenta el tipo de producto a la hora de seleccionar un tiempo limite."} /></h6>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={tiempoL}
                    onChange={(e) => setTiempoL(e.target.value)}
                    displayEmpty
                    required
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#39A900',
                      }
                    }}
                  >
                    <MenuItem value="" disabled>Selecciona un tiempo limite</MenuItem>
                    {/* <MenuItem value={0}>1 semana</MenuItem> */}
                    <MenuItem value={1}>2 semanas</MenuItem>
                    <MenuItem value={2}>3 semanas</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            <h6 className="fs-22px mt-1 text-black font-bold ">Agrega una ubicación</h6>
            <div className="flex flex-col md:flex-row md:space-x-4 mt-1">
              <div className="flex-1   md:mb-0">
                <h6 className="text-black font-bold m-1 ">Ubicación
                  <BasicTooltip titlet={"Menciona el país, ciudad, barrio o direccion del producto"} /></h6>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    displayEmpty
                    required
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#39A900',
                      }
                    }}
                  >
                    <MenuItem value="" disabled>Selecciona una ubicación</MenuItem>
                    {ciudades.map((ciudad, index) => (
                      <MenuItem key={index} value={ciudad}>
                        {ciudad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="flex-1">
                <h6 className="text-black font-bold  flex m-1 flex-row items-center">
                  Ubicación descriptiva
                  <BasicTooltip titlet={"Menciona el país, ciudad, barrio o direccion del producto"} />
                </h6>
                <input
                  type="text"
                  id="ubicacion-descriptiva"
                  value={ubicacionDescriptiva}
                  onChange={(e) => setUbicacionDescriptiva(e.target.value)}
                  placeholder="Ej: Dirección exacta"
                  className="w-full p-3 focus:outline-none   bg-white  text-black border_form"
                  required
                />
              </div>

            </div>

            <h6 className="fs-22px pb-2 text-black font-bold  mt-1 ">Agrega hasta 4 imágenes</h6>
            <div className="flex flex-col md:flex-row justify-between items-center  mt-1">
              <ImageInput images={images} setImages={setImages} img_lenght={4} rut={false} />
              <button
                type="submit"
                className="px-8 py-2 mt-4 md:mt-0 bg-[#39A900] hover:bg-[#2f6d30] text-white "
              >
                Añadir Producto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProd;