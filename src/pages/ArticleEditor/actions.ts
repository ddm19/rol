import axios from "axios"
import { axiosConfig } from "common/actionsUtils"
import { ArticleType } from "components/Article/types";

const BACK_URL = import.meta.env.VITE_BACK_URL;


export const uploadNewArticle = (articleJSON : ArticleType, password: string) =>
{
    return axios.post(`${BACK_URL}/articles`, {articleJSON, password}, axiosConfig).then((res) => {
        return res.data;
    });
}

export const deleteArticle = (articleId: string, password: string) =>
{
    return axios.delete(`${BACK_URL}/articles/${articleId}`, { data: { password }, ...axiosConfig }).then((res) => {
        return res.data;
    });
}

export const updateArticle = (articleId: string, articleJSON: ArticleType, password: string) =>
{
    return axios.put(`${BACK_URL}/articles/${articleId}`, {articleJSON, password}, axiosConfig).then((res) => {
        return res.data;
    });
}

export const getCategories = () =>
{
    return axios.get(`${BACK_URL}/categories`, axiosConfig).then((res) => {
        return res.data;
    });
}
export const addCategory = (categoryName: string) =>
{
    return axios.post(`${BACK_URL}/categories`, { id: categoryName+Date.now() ,name: categoryName }, axiosConfig).then((res) => {
        return res.data;
    });
}