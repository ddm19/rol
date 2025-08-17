import axios from "axios";
import { axiosConfig } from "common/actionsUtils";

const BACK_URL = import.meta.env.VITE_BACK_URL;

export interface CardDTO {
  name: string;      
  url: string;       
}

export interface DeckDTO {
  title: string;     
  cards: CardDTO[];
}



export const fetchDecks = async (): Promise<DeckDTO[]> => {
  const { data } = await axios.get<DeckDTO[]>(
    `${BACK_URL}/cards`,         
    axiosConfig
  );
  
  return data;
};
