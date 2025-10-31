import toast from "react-hot-toast";

const ProductList = ({ productos, setProductos, setSelectedProduct, selectedProduct }) => {


    const agregarProducto = () => {
        if (selectedProduct.trim() === "") return;
        if (productos.includes(selectedProduct)) return;
        if (productos.lenght > 4) {
            toast.error("Solo se pueden agregar 1 productos")
            return;
        }
        setProductos([...productos, selectedProduct]);
        setSelectedProduct("");
    };

    const eliminarProducto = (index) => {
        const nuevosProductos = productos.filter((_, i) => i !== index);
        setProductos(nuevosProductos);
    };

    return (
        <div className="flex flex-col my-1">
            <h6 className="text-black font-bold m-1">Tipos de Productos</h6>
            <div className="flex space-x-2">
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="flex-1 p-3 bg-white text-black border_form focus:outline-none"
                >
                    <option value="Café">Café</option>
                    <option value="Pescado">Pescado</option>
                    <option value="Granos">Granos</option>
                    <option value="Frutas">Frutas</option>
                    <option value="Verduras">Verduras</option>
                    <option value="Productos del campo">Productos del campo</option>

                </select>
                <button
                    onClick={agregarProducto}
                    type="button"
                    className="px-4 py-2 bg-[#39A900] hover:bg-[#2f6d30] text-white"
                >
                    Agregar
                </button>
            </div>
            <ul className="mt-2">
                {productos.map((producto, index) => (
                    <li key={index} className="flex justify-between items-center border-b py-2">
                        <span>{producto}</span>
                        <button onClick={() => eliminarProducto(index)} className="text-red-500 hover:text-red-700">
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;
