import { useEffect, useMemo, useState } from "react"
import "./sheetEditor.scss"
import { useNavigate, useParams } from "react-router-dom"
import { getSheet, patchSheet } from "services/sheets"
import { supabase } from "services/supabaseClient"


const SheetEditor: React.FC = () => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState("")
    const [data, setData] = useState<any>({})
    const navigate = useNavigate()
    const sheetId = useParams().id || ""

    const userPromise = useMemo(() => supabase.auth.getSession(), [])
    useEffect(() => {
        userPromise.then(async ({ data }) => {
            if (!data.session) {
                navigate("/login", { replace: true })
                return
            }
            const sheet = await getSheet(sheetId)
            setName(sheet.name)
            setData(sheet.data || {})
            setLoading(false)
        })
    }, [sheetId, navigate, userPromise])

    useEffect(() => {
        if (loading) return
        setSaving(true)
        const t = setTimeout(async () => {
            await patchSheet(sheetId, { name, data })
            setSaving(false)
        }, 700)
        return () => clearTimeout(t)
    }, [name, data, sheetId, loading])

    const handleChange = (key: string, value: string) => {
        setData((d: any) => ({ ...d, [key]: value }))
    }

    if (loading) return <div className="sheetEditor__loading">Cargando…</div>

    return (
        <div className="sheetEditor">
            <div className="sheetEditor__bar">
                <input
                    className="sheetEditor__name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre de la ficha"
                />
                <div className={"sheetEditor__status" + (saving ? " sheetEditor__status--saving" : " sheetEditor__status--saved")}>
                    {saving ? "Guardando…" : "Guardado"}
                </div>
            </div>

            <div className="sheetEditor__grid">
                <div className="sheetEditor__field">
                    <label className="sheetEditor__label">Nombre del PJ</label>
                    <input
                        className="sheetEditor__input"
                        value={data.nombre || ""}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        placeholder="Ej. Valar"
                    />
                </div>

                <div className="sheetEditor__field">
                    <label className="sheetEditor__label">Clase</label>
                    <input
                        className="sheetEditor__input"
                        value={data.clase || ""}
                        onChange={(e) => handleChange("clase", e.target.value)}
                        placeholder="Guerrero"
                    />
                </div>

                <div className="sheetEditor__field">
                    <label className="sheetEditor__label">Nivel</label>
                    <input
                        className="sheetEditor__input"
                        value={data.nivel || ""}
                        onChange={(e) => handleChange("nivel", e.target.value)}
                        placeholder="3"
                    />
                </div>

                <div className="sheetEditor__field sheetEditor__field--span2">
                    <label className="sheetEditor__label">Notas</label>
                    <textarea
                        className="sheetEditor__textarea"
                        value={data.notas || ""}
                        onChange={(e) => handleChange("notas", e.target.value)}
                        placeholder="Trasfondo, rasgos, objetivos…"
                    />
                </div>
            </div>
        </div>
    )
}

export default SheetEditor