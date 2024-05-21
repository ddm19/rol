import axios from "axios";

const BACK_URL = process.env.REACT_APP_BACK_URL;
export const fetchArticles = () =>
{
    return axios.get(`${BACK_URL}/articles`)
        .then(res =>
        {
            return res.data;
        })
        .catch(err =>
        {
            console.log(err);
        });
};