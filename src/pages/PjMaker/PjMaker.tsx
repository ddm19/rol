import { Link } from "react-router-dom";

const PJMaker = () => {
    const isMobile = window.innerWidth <= 768;
    return (
        <>
            <h1>Funcionalidad todavía en construcción</h1>
            <h3>Próximamente podrás crear y personalizar tus propios personajes aquí. Mientras tanto puedes ir a crear la ficha directamente una <Link to="/sheets/new">Nueva Ficha</Link>.</h3>
            <img draggable="false" width={isMobile ? "100%" : "20%"} src="https://nas.thedm.es/apps/files_sharing/publicpreview/wdcpnqm2drcWzFf?file=/imagen_2025-10-25_155108014.png&fileId=3900&x=3840&y=2160&a=true&etag=7f1fb1d0bbbb5d09d21e29e08ce7e433" alt="PJ Maker en construcción" style={{ maxWidth: '100%', height: 'auto' }} />
        </>
    );
}
export default PJMaker;