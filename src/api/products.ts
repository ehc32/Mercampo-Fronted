import { Product } from "../Interfaces";
import { authAxios, axi } from "./useAxios";

export const cate_api = async (category: string) => {
    const response = await authAxios.get(`/products/cate/${category}/`);
    return response.data.data.map((item) => item);
};

export const cate_api_random = async (category: string) => {
    const response = await authAxios.get(`/products/caterandom/${category}/`);
    return response.data;
};

export const search_prod = async (query: string) => {
    const response = await authAxios.get(`/products/search/?query=${query}`);
    return response.data;
};

export const get_solo = async (slug: string) => {
    const response = await authAxios.get(`/products/get/${slug}/`);
    return response.data;
};

export const get_solo_prod = async (id: number) => {
    const response = await authAxios.get(`/products/get/admin/${id}/`);
    return response.data;
};

export const edit_product = async (data: Product) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("count_in_stock", data.count_in_stock.toString());
    formData.append("category", data.category);
    formData.append("price", data.price.toString());
    if (data.image) {
        formData.append("images", data.image);
    }
    await authAxios.put(`/products/edit/${data.id}/`, formData);
};

export const delete_product = async (id: number) => {
    await authAxios.delete(`/products/delete/${id}/`);
};

export const post_product = async (data: Product) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("count_in_stock", data.count_in_stock.toString());
    // Enviar product_category si existe, sino mantener category para compatibilidad
    if (data.product_category) {
        formData.append("product_category", data.product_category.toString());
    } else if (data.category) {
        formData.append("category", data.category);
    }
    formData.append("price", data.price.toString());
    // Enviar unit_of_measurement si existe, sino mantener unit para compatibilidad
    if (data.unit_of_measurement) {
        formData.append("unit_of_measurement", data.unit_of_measurement.toString());
    } else if (data.unit) {
        formData.append("unit", data.unit);
    }
    formData.append("map_locate", data.map_locate);
    formData.append("locate", data.locate);
    formData.append("tiempoL", data.tiempoL.toString());
    if (data.image) {
        formData.append("images", data.image);
    }
    await authAxios.post("/products/post/", formData);
};

export const filter_request = async (locate, price, categories, time, startDate, endDate, searchItem, pageParam) => {
    const urlParams = new URLSearchParams();

    if (locate) {
        urlParams.append("locate", locate);
    }
    if (price) {
        urlParams.append("price", price);
    }
    if (categories) {
        urlParams.append("categories", categories.join(","));
    }

    if (time) {
        urlParams.append("time", time);
    } else {
        urlParams.append("time", "manual");
        if (startDate && endDate) {
            urlParams.append("startDate", startDate.toISOString());
            urlParams.append("endDate", endDate.toISOString());
        }
    }
    if (searchItem) {
        urlParams.append("searchItem", searchItem);
    }

    const response = await axi.get(`/products/filterdata/?${urlParams.toString()}&page=${pageParam}&pages=20`);
    return response;
};

export const get_products = async ({ pageParam = 1 }) => {
    const response = await axi.get(`/products/?page=${pageParam}&pages=20`);
    return response.data;
};

export const get_all_products = async () => {
    const response = await axi.get(`/products/getRandom/random_products/`);
    return response.data;
};

export const get_all_products_by_user = async (id: number) => {
    const response = await axi.get(`/products/user_products/${id}/`);
    return response.data;
};

export const get_products_in_sells_by_user = async (userId: number) => {
    const response = await axi.get(`/products/user_products/in_sells/${userId}/`);
    return response.data;
};

export const get_all_images_product = async (id: number | string) => {
    const response = await axi.get(`/products/get_product_images/${id}/`);
    return response.data;
};

export const get_all_products_paginated = async (page: number | string) => {
    const response = await axi.get(`/products/?page=${page}&page_size=10`);
    return response.data;
};

export const get_all_products_paginated_to_shop = async (page: number | string) => {
    const response = await axi.get(`/products/?page=${page}&page_size=20`);
    return response.data;
};

export const send_review = async (data: { userId: number, rating: number, opinion: string }, productId: number) => {
    const formData = new FormData();
    formData.append("user", data.userId.toString());
    formData.append("rating", data.rating.toString());
    formData.append("comment", data.opinion);
    await authAxios.post(`/products/opinion/send/${productId}/`, formData);
};

export const bring_reviews = async (productId: number) => {
    const response = await authAxios.get(`/products/opinion/bring/${productId}/`);
    return response;
};

export const bring_prome = async (searchParam: string) => {
    const response = await authAxios.get(`products/get/equals/${searchParam}/`);
    return response;
};

export const reduce_product_stock = async (productId: number, quantity: number) => {
    const response = await authAxios.patch(`/products/product/${productId}/reduce-stock/`, { quantity });
    return response.data;
};

export const bring_new_products = async (page: number | string) => {
    const response = await axi.get(`/products/news/?page=${page}&page_size=20`);
    return response.data;
};

export const approveRequestSeller = async (id: number | string) => {
    await axi.put(`/products/${id}/update-status/`)
}