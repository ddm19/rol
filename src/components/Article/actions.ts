import axios from "axios";

const BACK_URL = process.env.REACT_APP_BACK_URL;
export const fetchArticleById = (id: string) =>
{
    return axios.get(`${BACK_URL}/articles/${id}`)
        .then(res =>
        {
            return res.data;
        })
        .catch(err =>
        {
            console.log(err);
        });
};