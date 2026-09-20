import { supabase } from "./supabaseClient";

export const generateROHCode = async () => 
    {

    const ORDER_CONFIRMATION_FUNCTION = 'generate-pairing-code';
    

    const { data,error } = await supabase.functions.invoke(ORDER_CONFIRMATION_FUNCTION, {
        method: 'POST',
    });

    if (error) {
        console.error('Error generating ROH code:', error);
        throw new Error('Error generating ROH code');
    }

    return data.code;
}