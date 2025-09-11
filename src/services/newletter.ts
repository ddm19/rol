import { supabase } from "./supabaseClient";

const submitNewsletter = async (email: string) => {
    const response = await supabase
        .from('newsletter')
        .insert({ email })
        .select()
    return response;
};

export default submitNewsletter;