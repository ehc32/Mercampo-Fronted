import { authAxios, axi } from "./useAxios";
import { ProductCategory, UnitOfMeasurement } from "../Interfaces";

// ProductCategory API
export const get_all_categories = async () => {
    const response = await authAxios.get(`/products/categories/`);
    return response.data;
};

export const get_category = async (id: number) => {
    const response = await authAxios.get(`/products/categories/${id}/`);
    return response.data;
};

export const create_category = async (data: Partial<ProductCategory>) => {
    const response = await authAxios.post(`/products/categories/create/`, data);
    return response.data;
};

export const update_category = async (id: number, data: Partial<ProductCategory>) => {
    const response = await authAxios.put(`/products/categories/${id}/update/`, data);
    return response.data;
};

export const delete_category = async (id: number) => {
    const response = await authAxios.delete(`/products/categories/${id}/delete/`);
    return response.data;
};

// UnitOfMeasurement API
export const get_all_units = async () => {
    const response = await authAxios.get(`/products/units/`);
    return response.data;
};

export const get_unit = async (id: number) => {
    const response = await authAxios.get(`/products/units/${id}/`);
    return response.data;
};

export const create_unit = async (data: Partial<UnitOfMeasurement>) => {
    const response = await authAxios.post(`/products/units/create/`, data);
    return response.data;
};

export const update_unit = async (id: number, data: Partial<UnitOfMeasurement>) => {
    const response = await authAxios.put(`/products/units/${id}/update/`, data);
    return response.data;
};

export const delete_unit = async (id: number) => {
    const response = await authAxios.delete(`/products/units/${id}/delete/`);
    return response.data;
};


