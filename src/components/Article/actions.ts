import axios from "axios";
import { axiosConfig } from "common/actionsUtils";

const BACK_URL = import.meta.env.VITE_BACK_URL;

export const fetchArticleById = (id: string) => {
  return axios
    .get(`${BACK_URL}/articles/${id}`, axiosConfig)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
    });
};
