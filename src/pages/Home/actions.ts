import axios from "axios";
import { axiosConfig } from "common/actionsUtils";

const BACK_URL = import.meta.env.VITE_BACK_URL;
export const fetchArticles = () =>
{
    return axios.get(`${BACK_URL}/articles`, axiosConfig)
        .then((res: { data: any; }) =>
        {
            return res.data;
        })
        .catch((err: any) =>
        {
            console.log(err);
        });
}; 