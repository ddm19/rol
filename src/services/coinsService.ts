import { supabase } from './supabaseClient';

export type CoinWallet = {
    user_id: string;
    balance: number;
    last_claim_at: string | null;
};

export type AdminWalletRow = CoinWallet & {
    username: string | null;
    email: string | null;
};

export type CoinTransfer = {
    id: string;
    from_user: string;
    to_user: string;
    amount: number;
    created_at: string;
};

export type CoinMovement = {
    id: string;
    user_id: string;
    amount: number;
    reason: 'claim' | 'card_order' | 'booster_order' | 'admin' | 'transfer_in' | 'transfer_out';
    order_id: string | null;
    note: string | null;
    created_at: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function fetchMyWallet(userId: string): Promise<CoinWallet> {
    const { data, error } = await supabase
        .from('roh_wallets')
        .select('user_id, balance, last_claim_at')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw error;
    return data || { user_id: userId, balance: 0, last_claim_at: null };
}

export async function claimCoins(): Promise<CoinWallet> {
    const { data, error } = await supabase.rpc('roh_reclamar_monedas');
    if (error) throw error;
    return data as CoinWallet;
}

export function getNextClaimDate(wallet: CoinWallet | null, claimIntervalDays: number): Date | null {
    if (!wallet?.last_claim_at) return null;
    return new Date(new Date(wallet.last_claim_at).getTime() + claimIntervalDays * DAY_MS);
}

export async function fetchAdminWallets(): Promise<AdminWalletRow[]> {
    const { data, error } = await supabase.rpc('roh_admin_monederos');
    if (error) throw error;
    return data || [];
}

export async function adjustUserCoins(userId: string, amount: number, note: string): Promise<CoinWallet> {
    const { data, error } = await supabase.rpc('roh_admin_ajustar_monedas', {
        p_usuario: userId,
        p_cantidad: amount,
        p_nota: note,
    });
    if (error) throw error;
    return data as CoinWallet;
}

export async function fetchUserCoinMovements(userId: string): Promise<CoinMovement[]> {
    const { data, error } = await supabase
        .from('roh_coin_movements')
        .select('id, user_id, amount, reason, order_id, note, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data || [];
}

export async function sendCoins(toUserId: string, amount: number): Promise<CoinWallet> {
    const { data, error } = await supabase.rpc('roh_enviar_monedas', { p_destino: toUserId, p_cantidad: amount });
    if (error) throw error;
    return data as CoinWallet;
}

export async function fetchReceivableCoins(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('roh_monedas_recibibles', { p_usuario: userId });
    if (error) throw error;
    return (data as number) ?? 0;
}

export async function fetchUnseenTransfers(userId: string): Promise<CoinTransfer[]> {
    const { data, error } = await supabase
        .from('roh_coin_transfers')
        .select('id, from_user, to_user, amount, created_at')
        .eq('to_user', userId)
        .is('seen_at', null)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function markTransfersSeen(): Promise<void> {
    const { error } = await supabase.rpc('roh_marcar_transferencias_vistas');
    if (error) throw error;
}
