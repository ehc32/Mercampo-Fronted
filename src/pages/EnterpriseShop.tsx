import { useEffect, useState } from "react";
import { get_all_products_paginated_to_shop, filter_request } from '../api/products';
import './../global/style.css';
import { toast } from "react-toastify";
import AsideFilter from "../components/tienda/AsideFilter/AsideFilter";
import Content from "../components/enterprise/Content/ContentEnterprise";
import { get_enterprices } from "../api/users";

const Store = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataLenght, setDataLenght] = useState(0);
    const [page, setPage] = useState<number>(1)
    const [filtrado, toggleFiltrado] = useState<boolean>(false);
    const [locate, setLocate] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);
    const [time, setTime] = useState<string>("");
    const [searchItem, setSearchItem] = useState<string>("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [enterprises, setEnterprises] = useState<any[]>([]);
    const [dataLength, setDataLength] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
    const [locationFilter, setLocationFilter] = useState<string>("");
    const [priceFilter, setPriceFilter] = useState<string>("");
    const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

    // REQUEST TO SERVER

    const bringDataFilter = async () => {
        try {
            const formData = new FormData();

            formData.append('locate', locate);
            formData.append('price', price);
            formData.append('categories', categories ? categories.join(',') : '');

            if (startDate && endDate) {
                formData.append('startDate', startDate?.toISOString() ?? '');
                formData.append('endDate', endDate?.toISOString() ?? '');
            }

            formData.append('time', time);
            formData.append('searchItem', searchItem);

            const response = await filter_request(locate, price, categories, time, startDate, endDate, searchItem, page);

            toast.dismiss();
            toast.success("Filtros aplicados con éxito!");
            setDataLenght(response.data.meta.count)
            setProductos(response.data.data)
            toggleFiltrado(true)
        } catch (e) {

            toggleFiltrado(false)
            toast.error("Ha ocurrido un error al filtrar");
            console.error(e);
        }
    };

    // END FILTROS

    const fetchEnterprises = async (page: number, search: string = "") => {
        try {
            setLoading(true);
            const response = await get_enterprices(page, {
                searchQuery: search || undefined,
            });
            
            setEnterprises(response.data || []);
            setDataLength(response.total_enterprises || 0);
            
            // Marcar si hay filtros aplicados
            setFiltersApplied(!!search || locationFilter !== "" || priceFilter !== "" || categoryFilters.length > 0);
            
        } catch (error) {
            console.error("Error fetching enterprises:", error);
            toast.error("Error al cargar empresas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEnterprises(page, searchQuery);
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timer);
    }, [page, searchQuery, locationFilter, priceFilter, categoryFilters]);

    // Manejador de búsqueda
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1); // Resetear a la primera página al buscar
    };

    // Función para resetear todos los filtros
    const resetAllFilters = () => {
        setSearchQuery("");
        setLocationFilter("");
        setPriceFilter("");
        setCategoryFilters([]);
        setPage(1);
        setFiltersApplied(false);
    };

    // Función para aplicar filtros adicionales
    const applyAdditionalFilters = () => {
        // Aquí puedes agregar lógica para otros filtros si es necesario
        setPage(1); // Resetear a la primera página al aplicar filtros
        fetchEnterprises(1, searchQuery);
        toast.success("Filtros aplicados correctamente");
    };


    return (
        <section>
            <main className="mainTienda">
                <AsideFilter
                    bringDataFilter={bringDataFilter}
                    deleteDataFilter={resetAllFilters}
                    setTime={setTime}
                    setLocate={setLocate}
                    setCategories={setCategories}
                    setStartDate={setStartDate}
                    setPrice={setPrice}
                    setEndDate={setEndDate}
                    locate={locate}
                    price={price}
                    categories={categories}
                    time={time}
                    searchItem={searchItem}
                    startDate={startDate}
                    endDate={endDate}
                />

                <Content
                    empresa={enterprises}
                    loading={loading}
                    dataLenght={dataLength}
                    page={page}
                    setPage={setPage}
                    searchItem={searchQuery}
                    setSearchItem={handleSearch}
                    deleteDataFilter={resetAllFilters}
                    changeOrder={() => {
                        // Opcional: implementar ordenamiento si es necesario
                        setEnterprises([...enterprises].reverse());
                        toast.info("Orden cambiado");
                    }}
                />

            </main>
        </section>
    );
}
export default Store;